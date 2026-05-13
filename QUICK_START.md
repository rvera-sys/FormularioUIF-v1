# 🚀 GUÍA RÁPIDA - 5 MINUTOS PARA ESTAR ONLINE

## 📦 PASO 1: Preparar archivos

Tienes estos 11 archivos descargados:

```
✓ index.html              → Tu app (actualizada con auto-update)
✓ manifest.json           → Configuración PWA
✓ sw.js                   → Service Worker (actualización automática)
✓ version.json            → Control de versiones
✓ icon-192.png            → Icono pequeño
✓ icon-512.png            → Icono grande
✓ .gitignore             → (opcional)
✓ README.md               → Documentación completa
✓ DEPLOYMENT_GUIDE.md     → Guía detallada
✓ CHECKLIST.md            → Checklist de verificación
✓ update-version.sh       → Script de actualización
✓ .github/workflows/      → GitHub Actions (opcional)
```

---

## 🌐 PASO 2: Subir a GitHub (Primera vez)

### Opción A: Desde la terminal (Recomendado)

```bash
# 1. Ve a la carpeta donde están tus archivos
cd ruta/a/tu/carpeta/FormularioUIF-v1

# 2. Inicializa Git
git init

# 3. Agrega todos los archivos
git add .

# 4. Haz el primer commit
git commit -m "v1.1.0: PWA con sistema de actualización automática"

# 5. Crea la rama main
git branch -M main

# 6. Conecta con tu repositorio de GitHub
# (Reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/FormularioUIF-v1.git

# 7. Sube todo a GitHub
git push -u origin main
```

### Opción B: Desde GitHub.com (Interfaz web)

1. Ve a https://github.com/new
2. Nombre del repositorio: `FormularioUIF-v1`
3. Público o Privado (como prefieras)
4. **NO** marcar "Add README"
5. Click "Create repository"
6. Arrastra todos tus archivos a la página
7. Click "Commit changes"

---

## ⚙️ PASO 3: Activar GitHub Pages (2 clicks)

1. **Ve a tu repositorio en GitHub**
   ```
   https://github.com/TU_USUARIO/FormularioUIF-v1
   ```

2. **Click en "Settings"** (arriba a la derecha)

3. **En el menú lateral izquierdo → Click en "Pages"**

4. **En "Source":**
   - Branch: `main`
   - Folder: `/ (root)`

5. **Click en "Save"**

6. **¡Listo!** Espera 1-2 minutos

Tu app estará en:
```
https://TU_USUARIO.github.io/FormularioUIF-v1/
```

---

## 📱 PASO 4: Instalar en tu teléfono

### iPhone / iPad (Safari):

1. Abre Safari
2. Ve a: `https://TU_USUARIO.github.io/FormularioUIF-v1/`
3. Click botón **Compartir** 📤 (abajo en el centro)
4. Scroll y selecciona **"Añadir a pantalla de inicio"**
5. Click **"Añadir"**
6. ✅ ¡App instalada!

### Android (Chrome):

1. Abre Chrome
2. Ve a: `https://TU_USUARIO.github.io/FormularioUIF-v1/`
3. Aparece banner: **"Instalar app"**
4. Click **"Instalar"**
5. O desde menú ⋮ → **"Agregar a pantalla de inicio"**
6. ✅ ¡App instalada!

### Desktop (Chrome/Edge):

1. Abre tu URL
2. Mira la barra de direcciones → icono ⊕ o 💻
3. Click en el icono
4. Click **"Instalar"**
5. ✅ ¡App instalada!

---

## 🔄 PASO 5: Primera actualización (test)

### Método automático (recomendado):

```bash
# Dar permisos al script (solo la primera vez)
chmod +x update-version.sh

# Actualizar a versión 1.1.1
./update-version.sh 1.1.1 "Test del sistema de actualización"
```

**¡Listo!** El script actualiza todo automáticamente y sube a GitHub.

### Método manual:

```bash
# 1. Editar version.json
# Cambiar: "version": "1.1.0" → "version": "1.1.1"

# 2. Editar sw.js (línea 4)
# Cambiar: const VERSION = '1.1.0'; → const VERSION = '1.1.1';

# 3. Editar index.html (buscar CURRENT_VERSION)
# Cambiar: const CURRENT_VERSION = '1.1.0'; → const CURRENT_VERSION = '1.1.1';

# 4. Subir cambios
git add .
git commit -m "v1.1.1: Test de actualización"
git push origin main
```

### Verificar actualización:

1. Espera 2-3 minutos
2. Abre la app instalada en tu móvil
3. Debe aparecer notificación azul: **"✨ Nueva versión disponible"**
4. Click en **"🚀 Actualizar"**
5. La app se recarga
6. ✅ ¡Actualización exitosa!

---

## 💡 COMANDOS ÚTILES

### Ver estado de Git:
```bash
git status
```

### Ver historial:
```bash
git log --oneline
```

### Actualizar versión rápido:
```bash
./update-version.sh 1.2.0 "Nuevas funcionalidades agregadas"
```

### Forzar rebuild en GitHub:
```bash
git commit --allow-empty -m "Force rebuild"
git push
```

### Ver todas las versiones:
```bash
git tag
```

---

## 🎯 PRÓXIMAS ACTUALIZACIONES

Cada vez que quieras actualizar:

1. **Edita** tus archivos (HTML, CSS, JS)
2. **Actualiza** version.json (incrementa número)
3. **Actualiza** sw.js (mismo número de versión)
4. **Actualiza** index.html (mismo número de versión)
5. **Push** a GitHub:
   ```bash
   git add .
   git commit -m "v1.X.X: Descripción de cambios"
   git push
   ```
6. **Automático:** Usuarios reciben notificación en 2-3 min

O usa el script:
```bash
./update-version.sh 1.2.0 "Descripción de tus cambios"
```

---

## ✅ VERIFICACIÓN FINAL

### Todo funciona si:

- ✅ URL de GitHub Pages se abre correctamente
- ✅ App se instala en tu móvil
- ✅ Funciona sin internet (modo avión)
- ✅ Notificación de actualización aparece
- ✅ Actualización se aplica con un click

---

## 🆘 PROBLEMAS COMUNES

### "No puedo hacer git push"

**Solución:**
```bash
# Configurar tu identidad (solo primera vez)
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"

# Si pide autenticación, usa Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens
```

### "GitHub Pages no funciona"

**Solución:**
1. Verifica que el repositorio sea público (o tengas GitHub Pro)
2. Settings → Pages → verifica que Source esté en "main" y "/ (root)"
3. Espera 5 minutos y refresca

### "Service Worker no se instala"

**Solución:**
1. Abre DevTools (F12) → Console
2. Debe decir: "[APP] Service Worker registrado"
3. Si hay error, verifica que la URL sea HTTPS
4. GitHub Pages es automáticamente HTTPS ✓

---

## 🎉 ¡TERMINADO!

Tu PWA está lista y actualizada con:

✅ Sistema de actualización automática  
✅ Notificaciones elegantes  
✅ Funciona offline  
✅ Multiplataforma (iOS, Android, Desktop)  
✅ Fácil de actualizar desde GitHub  

**URL de tu app:**
```
https://TU_USUARIO.github.io/FormularioUIF-v1/
```

---

## 📚 Documentación completa

- **README.md** - Documentación general
- **DEPLOYMENT_GUIDE.md** - Guía técnica detallada
- **CHECKLIST.md** - Lista de verificación completa

---

**Sistema PLAFT-FP 2026 — REMAX CREA**  
René A. Vera · CPI 6778 / CSI 5848  
rvera@remax.com.ar
