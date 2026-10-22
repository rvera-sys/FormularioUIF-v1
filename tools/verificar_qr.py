#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_qr.py — Verificador de integridad de los Formularios UIF (F1).

Lee un PDF (digital o escaneado), extrae los códigos QR que el formulario
imprime y responde tres preguntas:

  1. ¿Este PDF corresponde a un formulario UIF generado por el sistema?
  2. ¿Está completo? (páginas faltantes, reordenadas o duplicadas)
  3. ¿El contenido fue alterado después de generarse?

El formulario F1 lleva dos tipos de QR:

  * QR de página (uno por hoja, esquina inferior derecha)
        CREA-2610-XXXXXXXXXXXXXX|p3/6|a1b2c3d4e5f6a7b8
        → ID del formulario | página N de M | primeros 16 hex del SHA-256

  * QR de contenido (página "ANEXO DIGITAL")
        UIF1Z:<base64url(deflate(JSON canónico))>
        → el F1 completo (todos los campos) codificado y comprimido

El hash se calcula sobre el JSON canónico (claves ordenadas) SIN el campo "h",
y el propio payload lleva "h" con el SHA-256 completo. Verificar es quitar "h",
volver a canonicalizar y recalcular.

Uso:
    python tools/verificar_qr.py ARCHIVO.pdf
    python tools/verificar_qr.py ARCHIVO.pdf --exportar f1.json
    python tools/verificar_qr.py ARCHIVO.pdf --json
    python tools/verificar_qr.py ARCHIVO.pdf --dpi 400

Código de salida:
    0 = todo OK
    1 = se detectaron problemas (páginas faltantes, hash no coincide, etc.)
    2 = error de uso o falta de dependencias

Dependencias (pip install zxing-cpp pypdfium2):
    zxing-cpp   → lectura de códigos QR (alternativa: zbarimg / pyzbar)
    pypdfium2   → renderizado de las páginas (alternativa: pdftoppm de poppler)
"""

import argparse
import base64
import binascii
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zlib

# ──────────────────────────────────────────────────────────────
# Canonicalización idéntica a la del generador (index.html → F1QR.canonico)
# ──────────────────────────────────────────────────────────────


def _json_str(s):
    """Equivalente a JSON.stringify() de JavaScript."""
    return json.dumps(s, ensure_ascii=False)


def canonico(obj):
    """Serializa un objeto con las claves ordenadas, igual que F1QR.canonico()."""
    if obj is None:
        return "null"
    if isinstance(obj, bool):
        return "true" if obj else "false"
    if isinstance(obj, int):
        return str(obj)
    if isinstance(obj, float):
        return str(int(obj)) if obj.is_integer() else repr(obj)
    if isinstance(obj, str):
        return _json_str(obj)
    if isinstance(obj, (list, tuple)):
        return "[" + ",".join(canonico(x) for x in obj) + "]"
    if isinstance(obj, dict):
        claves = sorted(obj.keys())
        return "{" + ",".join(_json_str(k) + ":" + canonico(obj[k]) for k in claves) + "}"
    raise TypeError("tipo no serializable: %r" % type(obj))


def sha256_hex(texto):
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def b64url_decode(s):
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * (-len(s) % 4)
    return base64.b64decode(s)


def decodificar_contenido(texto):
    """Interpreta el contenido del QR grande. Devuelve (payload, error)."""
    if texto.startswith("UIF1Z:"):
        try:
            crudo = b64url_decode(texto[6:])
        except (binascii.Error, ValueError) as e:
            return None, "base64 inválido: %s" % e
        try:
            return json.loads(zlib.decompress(crudo).decode("utf-8")), None
        except (zlib.error, UnicodeDecodeError) as e:
            return None, "no se pudo descomprimir (DEFLATE): %s" % e
    if texto.startswith("UIF1R:"):
        try:
            return json.loads(b64url_decode(texto[6:]).decode("utf-8")), None
        except Exception as e:
            return None, "base64/JSON inválido: %s" % e
    return None, "prefijo desconocido (no es un QR de contenido UIF)"


# ──────────────────────────────────────────────────────────────
# Lectura de los QR
# ──────────────────────────────────────────────────────────────


class LectorZXing:
    nombre = "zxingcpp"

    def __init__(self):
        import zxingcpp  # noqa
        self._z = zxingcpp

    def leer(self, imagen):
        out = []
        for r in self._z.read_barcodes(imagen):
            if r.text:
                out.append(r.text)
        return out


class LectorZBarImg:
    """Alternativa: el binario zbarimg (necesita zbar)."""

    nombre = "zbarimg"

    def __init__(self):
        if not shutil.which("zbarimg"):
            raise RuntimeError("zbarimg no está instalado")

    def leer(self, imagen):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
            ruta = tf.name
        try:
            imagen.save(ruta)
            r = subprocess.run(
                ["zbarimg", "-q", "--raw", ruta], capture_output=True, text=True
            )
            return [l for l in r.stdout.splitlines() if l.strip()]
        finally:
            try:
                os.unlink(ruta)
            except OSError:
                pass


def obtener_lector():
    for clase in (LectorZXing, LectorZBarImg):
        try:
            return clase()
        except Exception:
            continue
    return None


class Renderizador:
    """Renderiza páginas de PDF a imágenes PIL."""

    def __init__(self):
        self.modo = None
        try:
            import pypdfium2  # noqa

            self._pdfium = pypdfium2
            self.modo = "pypdfium2"
        except ImportError:
            self._pdfium = None
        if self._pdfium is None and not shutil.which("pdftoppm"):
            raise RuntimeError(
                "Hace falta pypdfium2 (pip install pypdfium2) o poppler (pdftoppm)"
            )

    def paginas(self, ruta_pdf, dpi):
        """Devuelve una lista de imágenes PIL, una por página."""
        out = []
        if self._pdfium is not None:
            doc = self._pdfium.PdfDocument(ruta_pdf)
            for i in range(len(doc)):
                img = doc[i].render(scale=dpi / 72.0).to_pil().convert("RGB")
                out.append(img)
            doc.close()
            return out

        with tempfile.TemporaryDirectory() as tmp:
            prefijo = os.path.join(tmp, "pag")
            subprocess.run(
                ["pdftoppm", "-r", str(dpi), "-png", ruta_pdf, prefijo],
                check=True,
                capture_output=True,
            )
            from PIL import Image

            for nombre in sorted(os.listdir(tmp)):
                if nombre.lower().endswith(".png"):
                    out.append(Image.open(os.path.join(tmp, nombre)).convert("RGB"))
            return out


# ──────────────────────────────────────────────────────────────
# Verificación
# ──────────────────────────────────────────────────────────────

RE_QR_PAGINA = re.compile(r"^(?P<id>[A-Z0-9\-]+)\|p(?P<pag>\d+)/(?P<tot>\d+)\|(?P<hash>[0-9a-f]{16})$")


def verificar(ruta_pdf, dpi=300, exportar=None):
    lector = obtener_lector()
    if lector is None:
        raise RuntimeError(
            "No se encontró ningún lector de QR. Instalá uno:\n"
            "    pip install zxing-cpp\n"
            "o instalá zbar (zbarimg)."
        )
    render = Renderizador()

    informe = {
        "archivo": os.path.abspath(ruta_pdf),
        "dpi": dpi,
        "lector_qr": lector.nombre,
        "renderizador": render.modo,
        "paginas": 0,
        "qr_por_pagina": [],
        "id_formulario": None,
        "hash16": None,
        "hash": None,
        "paginas_declaradas": None,
        "problemas": [],
        "advertencias": [],
        "ok": False,
    }

    imagenes = render.paginas(ruta_pdf, dpi)
    informe["paginas"] = len(imagenes)

    hashes_pagina = {}     # número de página -> hash16 leído
    num_QR = {}            # número de página -> número de página declarado en el QR
    contenido = None       # texto del QR grande
    paginas_sin_qr = []

    for i, img in enumerate(imagenes):
        textos = []
        try:
            textos = lector.leer(img)
        except Exception as e:  # pragma: no cover
            informe["advertencias"].append("página %d: error de lectura (%s)" % (i + 1, e))

        res_pag = {"pagina": i + 1, "qr": []}
        for t in textos:
            m = RE_QR_PAGINA.match(t)
            if m:
                hashes_pagina[i + 1] = m.group("hash")
                num_QR[i + 1] = int(m.group("pag"))
                informe["id_formulario"] = m.group("id")
                informe["hash16"] = m.group("hash")
                informe["paginas_declaradas"] = int(m.group("tot"))
                res_pag["qr"].append({"tipo": "pagina", "texto": t})
            elif t.startswith("UIF1Z:") or t.startswith("UIF1R:"):
                contenido = t
                res_pag["qr"].append({"tipo": "contenido", "texto": t[:40] + "..."})
            else:
                res_pag["qr"].append({"tipo": "desconocido", "texto": t[:80]})
        if not res_pag["qr"]:
            paginas_sin_qr.append(i + 1)
        informe["qr_por_pagina"].append(res_pag)

    # ── páginas ──
    if paginas_sin_qr:
        informe["problemas"].append(
            "páginas sin código QR legible: %s" % ", ".join(str(p) for p in paginas_sin_qr)
        )

    if informe["id_formulario"]:
        total = informe["paginas_declaradas"]
        if total != informe["paginas"]:
            informe["problemas"].append(
                "el PDF tiene %d páginas pero los QR anuncian %d (faltan hojas o hay hojas de más)"
                % (informe["paginas"], total)
            )
        vistos = sorted(hashes_pagina)
        if vistos != list(range(1, len(vistos) + 1)):
            informe["problemas"].append(
                "los QR de página no son correlativos (faltan páginas en el medio)"
            )
        hashes = set(hashes_pagina.values())
        if len(hashes) > 1:
            informe["problemas"].append(
                "las páginas tienen huellas SHA-256 distintas: pertenecen a formularios distintos"
            )
        for p, declarado in sorted(num_QR.items()):
            if declarado != p:
                informe["problemas"].append(
                    "la hoja %d dice ser la página %d: las hojas están fuera de orden o traspapeladas"
                    % (p, declarado)
                )
    else:
        informe["problemas"].append("no se encontró ningún QR de página: no parece un F1 del sistema")

    # ── contenido ──
    if not contenido:
        informe["problemas"].append(
            "no se encontró el QR de contenido (página ANEXO DIGITAL): no se puede verificar el F1 completo"
        )
    else:
        payload, err = decodificar_contenido(contenido)
        if err:
            informe["problemas"].append("el QR de contenido no se pudo leer: %s" % err)
        else:
            informe["payload"] = payload
            h = payload.pop("h", None)
            if not h:
                informe["problemas"].append("el payload del QR no trae la huella 'h'")
            else:
                recalculado = sha256_hex(canonico(payload))
                informe["hash"] = h
                informe["hash_recalculado"] = recalculado
                if recalculado == h:
                    informe["veredicto_hash"] = "OK"
                else:
                    informe["veredicto_hash"] = "ALTERADO"
                    informe["problemas"].append(
                        "el contenido NO coincide con su huella: el formulario fue modificado "
                        "después de generarse (h=%s, recalculado=%s)" % (h[:16], recalculado[:16])
                    )
                if informe["hash16"] and not h.startswith(informe["hash16"]):
                    informe["problemas"].append(
                        "la huella corta de los QR de página (%s) no coincide con la del QR de contenido (%s)"
                        % (informe["hash16"], h[:16])
                    )
            if exportar:
                with open(exportar, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2, sort_keys=True)
                informe["exportado"] = os.path.abspath(exportar)

    informe["ok"] = not informe["problemas"]
    return informe


# ──────────────────────────────────────────────────────────────
# Presentación
# ──────────────────────────────────────────────────────────────


def mostrar(informe):
    print("=" * 74)
    print("VERIFICACIÓN DE INTEGRIDAD — Formulario UIF (F1)")
    print("=" * 74)
    print("Archivo       : %s" % informe["archivo"])
    print("Páginas       : %d  ·  QR leídos con %s a %d dpi" % (
        informe["paginas"], informe["lector_qr"], informe["dpi"]))
    if informe["id_formulario"]:
        print("Formulario ID : %s" % informe["id_formulario"])
        print("Páginas anunc.: %s" % informe["paginas_declaradas"])
        print("Huella corta  : %s  (SHA-256, la misma en todas las páginas)" % informe["hash16"])
    if informe.get("hash"):
        print("Huella total  : %s" % informe["hash"])
    if informe.get("veredicto_hash"):
        print("Veredicto     : %s" % informe["veredicto_hash"])

    print("-" * 74)
    for p in informe["qr_por_pagina"]:
        tipos = ", ".join(q["tipo"] for q in p["qr"]) or "NINGUNO"
        print("  página %2d : %s" % (p["pagina"], tipos))
    print("-" * 74)

    for a in informe["advertencias"]:
        print("AVISO  : %s" % a)
    for p in informe["problemas"]:
        print("PROBLEMA: %s" % p)

    if informe["ok"]:
        print("RESULTADO: OK — el formulario está completo y su contenido no fue alterado.")
    else:
        print("RESULTADO: CON OBSERVACIONES — %d problema(s) detectado(s)." % len(informe["problemas"]))
    if informe.get("exportado"):
        print("Datos del F1 exportados a: %s" % informe["exportado"])
    print("=" * 74)


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Verifica la integridad de un Formulario UIF (F1) a partir de sus QR."
    )
    ap.add_argument("pdf", help="archivo PDF a verificar")
    ap.add_argument("--dpi", type=int, default=300, help="resolución de render (default 300)")
    ap.add_argument("--exportar", metavar="ARCHIVO", help="exporta los datos del F1 a un JSON")
    ap.add_argument("--json", action="store_true", help="salida en JSON")
    args = ap.parse_args(argv)

    if not os.path.isfile(args.pdf):
        print("No existe el archivo: %s" % args.pdf, file=sys.stderr)
        return 2

    try:
        informe = verificar(args.pdf, dpi=args.dpi, exportar=args.exportar)
    except RuntimeError as e:
        print("ERROR: %s" % e, file=sys.stderr)
        return 2
    except Exception as e:  # pragma: no cover
        print("ERROR inesperado: %s" % e, file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(informe, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        mostrar(informe)
    return 0 if informe["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
