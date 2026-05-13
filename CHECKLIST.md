# ✅ CHECKLIST DE INSTALACIÓN - UIF REMAX CREA PWA

## 📋 Pre-deployment

- [ ] Todos los archivos descargados en tu computadora
- [ ] GitHub cuenta activa
- [ ] Repositorio creado (público o privado)
- [ ] Git instalado en tu computadora

## 🚀 Setup inicial

### 1. Archivos a subir a GitHub:

```
✓ index.html           (ACTUALIZADO - versión con auto-update)
✓ manifest.json        (original)
✓ sw.js               (NUEVO - Service Worker)
✓ version.json        (NUEVO - Control de versiones)
✓ icon-192.png        (original)
✓ icon-512.png        (original)
✓ .gitignore          (NUEVO - opcional)
✓ README.md           (NUEVO - documentación)
```

### 2. Comandos Git:

```bash
# En el directorio de tu proyecto:
git init
git add .
git commit -m "v1.1.0: PWA con sistema de actualización automática"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/FormularioUIF-v1.git
git push -u origin main
```

## 🌐 Activar GitHub Pages

- [ ] Ir a Settings del repositorio
- [ ] Hacer click en Pages (menú lateral)
- [ ] Source: Branch `main` / Folder `/` (root)
- [ ] Click en Save
- [ ] Esperar 1-2 minutos
- [ ] URL generada: `https://TU_USUARIO.github.io/FormularioUIF-v1/`

## ✅ Verificación de funcionamiento

### En navegador desktop:

- [ ] Abrir URL de GitHub Pages
- [ ] Abrir DevTools (F12)
- [ ] No hay errores en consola
- [ ] Application → Service Workers → "activated and is running"
- [ ] Application → Cache Storage → existe "uif-v1.1.0"
- [ ] Probar cerrar pestaña y abrir sin internet → funciona offline

### En móvil (iOS):

- [ ] Abrir Safari
- [ ] Ir a URL de GitHub Pages
- [ ] Botón Compartir → "Añadir a pantalla de inicio"
- [ ] Icono aparece en pantalla principal
- [ ] Abrir app → se abre pantalla completa (sin barra Safari)
- [ ] Probar modo avión → funciona offline

### En móvil (Android):

- [ ] Abrir Chrome
- [ ] Ir a URL de GitHub Pages
- [ ] Aparece banner "Instalar app" o desde menú "Agregar a pantalla de inicio"
- [ ] Icono aparece en pantalla principal
- [ ] Abrir app → splash screen aparece
- [ ] Probar modo avión → funciona offline

## 🔄 Test de actualización

### Primera actualización de prueba:

1. Editar index.html:
   - [ ] Cambiar algo visible (ej: título en topbar)

2. Actualizar version.json:
   ```json
   {
     "version": "1.1.1",  ← Cambiar a 1.1.1
     "date": "2026-05-07",
     "changelog": [
       "Test de sistema de actualización"
     ]
   }
   ```

3. Actualizar sw.js:
   ```javascript
   const VERSION = '1.1.1';  ← Cambiar línea 4
   ```

4. Actualizar index.html:
   ```javascript
   const CURRENT_VERSION = '1.1.1';  ← Buscar y cambiar
   ```

5. Push a GitHub:
   ```bash
   git add .
   git commit -m "v1.1.1: Test de actualización"
   git push
   ```

6. Verificar:
   - [ ] Esperar 2-3 minutos
   - [ ] Abrir app instalada en móvil
   - [ ] Aparece notificación azul de actualización
   - [ ] Mostrar changelog con el mensaje de test
   - [ ] Click en botón "Actualizar"
   - [ ] App se recarga
   - [ ] Cambio visible aplicado

## 🎯 Configuración opcional

### Script de actualización automática:

- [ ] Dar permisos: `chmod +x update-version.sh`
- [ ] Probar: `./update-version.sh 1.1.2 "Nueva prueba"`
- [ ] Verificar que actualiza los 3 archivos automáticamente

### GitHub Actions (opcional):

- [ ] Crear carpeta `.github/workflows/`
- [ ] Copiar archivo `deploy.yml`
- [ ] Push a GitHub
- [ ] Ir a Actions en GitHub → debe aparecer workflow

### Dominio personalizado (opcional):

- [ ] Comprar dominio
- [ ] GitHub Pages → Custom domain
- [ ] Configurar DNS en proveedor:
  ```
  CNAME  @    TU_USUARIO.github.io
  CNAME  www  TU_USUARIO.github.io
  ```

## 🐛 Troubleshooting

### Si Service Worker no se registra:

- [ ] Verificar que URL es HTTPS (GitHub Pages lo es)
- [ ] Revisar consola del navegador (F12)
- [ ] sw.js debe estar en raíz del proyecto
- [ ] Limpiar caché del navegador

### Si no aparece notificación de actualización:

- [ ] Verificar que las 3 versiones coinciden (version.json, sw.js, index.html)
- [ ] Esperar 2-3 minutos después del push
- [ ] Forzar rebuild: `git commit --allow-empty -m "rebuild" && git push`
- [ ] Limpiar caché: DevTools → Application → Clear storage

### Si no funciona offline:

- [ ] DevTools → Application → Service Workers → debe estar "activated"
- [ ] Application → Cache Storage → debe existir caché "uif-v1.1.0"
- [ ] Abrir app → esperar 5 segundos → probar modo avión

## 📊 Métricas de éxito

### Primera instalación:
- ✅ App instalada en dispositivo
- ✅ Funciona offline
- ✅ Splash screen aparece (Android)
- ✅ Icono correcto
- ✅ Colores de tema correctos

### Sistema de actualización:
- ✅ Notificación aparece automáticamente
- ✅ Changelog se muestra correctamente
- ✅ Actualización funciona con un click
- ✅ Nueva versión se aplica correctamente
- ✅ No se pierde información local

## 🎉 ¡Completado!

Si todos los checks están marcados:

✅ Tu PWA está lista para producción
✅ Sistema de actualización automática funcionando
✅ Multiplataforma (iOS, Android, Desktop)
✅ Funciona offline
✅ Fácil de actualizar desde GitHub

## 📞 Contacto

REMAX CREA  
René A. Vera  
CPI 6778 / CSI 5848  
rvera@remax.com.ar

---

**Fecha de creación:** 2026-05-06  
**Versión del sistema:** 1.1.0  
**Sistema PLAFT-FP 2026**
