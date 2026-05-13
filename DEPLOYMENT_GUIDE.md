# 🚀 Guía de Deployment - UIF REMAX CREA PWA

## 📋 Índice
1. [Configuración inicial de GitHub](#configuración-inicial)
2. [Activar GitHub Pages](#activar-github-pages)
3. [Actualizar la aplicación](#actualizar-la-aplicación)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Testing multiplataforma](#testing-multiplataforma)

---

## 🔧 Configuración inicial

### 1. Subir archivos a GitHub

```bash
# Clonar tu repositorio
git clone https://github.com/TU_USUARIO/FormularioUIF-v1.git
cd FormularioUIF-v1

# Agregar archivos
git add .
git commit -m "Setup: PWA con sistema de auto-actualización"
git push origin main
```

### 2. Estructura de archivos necesaria

```
FormularioUIF-v1/
├── index.html           # Tu archivo principal
├── manifest.json        # Configuración PWA
├── sw.js               # Service Worker (NUEVO)
├── version.json        # Control de versiones (NUEVO)
├── icon-192.png        # Icono app
├── icon-512.png        # Icono app
├── README.md           # Documentación
└── .gitignore          # (opcional)
```

---

## 🌐 Activar GitHub Pages

### Método 1: Desde la interfaz web (Recomendado)

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona:
   - Branch: `main` (o `master`)
   - Folder: `/ (root)`
5. Click en **Save**
6. Espera 1-2 minutos
7. Tu app estará en: `https://TU_USUARIO.github.io/FormularioUIF-v1/`

### Método 2: GitHub Actions (Avanzado)

Crear archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy PWA to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          cname: tu-dominio.com  # Opcional: si tienes dominio propio
```

---

## 🔄 Actualizar la aplicación

### Cada vez que hagas cambios:

#### 1. **Modificar tus archivos** (index.html, estilos, etc.)

#### 2. **Actualizar version.json**

```json
{
  "version": "1.2.0",  // ⬅️ Incrementar versión
  "date": "2026-05-06",
  "changelog": [
    "Agregado campo de email secundario",
    "Corregido bug en validación de CUIT",
    "Mejoras visuales en pantalla de resumen"
  ],
  "critical": false,     // true = obliga actualización inmediata
  "minVersion": "1.0.0"  // Versión mínima compatible
}
```

#### 3. **Actualizar VERSION en sw.js**

```javascript
// En sw.js línea 4
const VERSION = '1.2.0'; // ⬅️ Debe coincidir con version.json
```

#### 4. **Commit y push**

```bash
git add .
git commit -m "v1.2.0: Nuevas funcionalidades"
git push origin main
```

#### 5. **Automático** ✨

- GitHub Pages se actualiza automáticamente (1-2 min)
- Los usuarios verán notificación de nueva versión
- Pueden actualizar con un click

---

## 📱 Testing multiplataforma

### **iOS (Safari)**

1. Abre Safari en iPhone/iPad
2. Ve a: `https://TU_USUARIO.github.io/FormularioUIF-v1/`
3. Click en botón **Compartir** (📤)
4. Selecciona **"Añadir a pantalla de inicio"**
5. La app se instala como app nativa

**Verificar:**
- Icono aparece en pantalla de inicio
- Abre en pantalla completa (sin barra Safari)
- Funciona offline

### **Android (Chrome)**

1. Abre Chrome en Android
2. Ve a: `https://TU_USUARIO.github.io/FormularioUIF-v1/`
3. Aparecerá banner "Instalar app"
4. O desde menú: **"Agregar a pantalla de inicio"**

**Verificar:**
- Icono aparece en pantalla de inicio
- Splash screen al abrir
- Funciona offline

### **Desktop (Chrome/Edge)**

1. Abre Chrome o Edge
2. Ve a la URL
3. Icono ⊕ aparece en barra de direcciones
4. Click para instalar

**Verificar:**
- App se abre en ventana separada
- Aparece en lista de aplicaciones del sistema
- Funciona offline

### **Testing de actualizaciones**

1. Cambia algo en index.html
2. Actualiza version.json y sw.js
3. Push a GitHub
4. Espera 1-2 minutos
5. Abre la app instalada
6. Debe aparecer notificación de actualización

---

## 🛠️ Comandos útiles

### Ver estado de instalación

```javascript
// En consola del navegador (F12)
navigator.serviceWorker.ready.then(reg => {
  console.log('SW registrado:', reg);
  console.log('Scope:', reg.scope);
});
```

### Forzar actualización manual

```javascript
// En consola del navegador
window.manualCheckUpdate();
```

### Limpiar caché

```javascript
// En consola del navegador
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('Caché limpiado');
});
```

### Ver todas las cachés

```javascript
caches.keys().then(keys => console.log('Cachés:', keys));
```

---

## 🎨 Personalización

### Cambiar colores de tema

En `manifest.json`:
```json
{
  "background_color": "#1a4a8a",  // Color de splash screen
  "theme_color": "#1a4a8a"        // Color de barra superior
}
```

### Cambiar iconos

Reemplaza `icon-192.png` y `icon-512.png` con tus iconos personalizados.

**Requisitos:**
- Formato PNG
- Fondo opaco (no transparente para maskable)
- Diseño centrado con padding 10-20%

---

## 🔐 Dominio personalizado (Opcional)

### Con dominio propio:

1. Compra dominio (ej: uif-remax.com)
2. En GitHub Pages settings, agrega en **Custom domain**
3. Configura DNS en tu proveedor:

```
CNAME    @         TU_USUARIO.github.io
CNAME    www       TU_USUARIO.github.io
```

4. Actualiza `start_url` en manifest.json:

```json
{
  "start_url": "https://uif-remax.com/index.html"
}
```

---

## 📊 Analytics (Opcional)

Agregar antes de `</head>` en index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🐛 Troubleshooting

### "No se ve mi actualización"

1. Fuerza actualización en GitHub: push vacío
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push
   ```

2. Limpia caché del navegador
3. Verifica que version.json y sw.js tengan la misma versión

### "Service Worker no se registra"

- Verifica consola del navegador (F12)
- GitHub Pages debe estar en HTTPS
- Archivo sw.js debe estar en la raíz

### "No funciona offline"

- Verifica que sw.js se haya instalado correctamente
- Revisa que todos los assets estén en ASSETS array
- Prueba con DevTools > Application > Service Workers

---

## 📝 Checklist de deployment

- [ ] Archivos subidos a GitHub
- [ ] GitHub Pages activado
- [ ] URL funciona en navegador
- [ ] PWA instala correctamente en móvil
- [ ] Funciona offline
- [ ] Sistema de actualización testeado
- [ ] Iconos se ven correctamente
- [ ] Colores de tema correctos

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa consola del navegador (F12)
2. Verifica Application > Service Workers en DevTools
3. Comprueba que GitHub Pages esté activo
4. Testea en modo incógnito

---

## 🚀 Workflow recomendado

```bash
# Desarrollo
1. Edita archivos localmente
2. Prueba en navegador (abre index.html)
3. Incrementa versión en version.json y sw.js
4. Git add + commit + push
5. Espera 1-2 min
6. Testea en dispositivo real
7. ✨ Usuarios reciben notificación automática

# ¡Listo para producción! 🎉
```
