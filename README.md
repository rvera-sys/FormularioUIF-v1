# 📱 UIF REMAX CREA - Sistema PLAFT-FP 2026

Progressive Web App (PWA) para formulario UIF con sistema de actualización automática multiplataforma desde GitHub.

---

## 🚀 Quick Start

### 1️⃣ Subir a GitHub

```bash
# Si ya tienes el repo clonado:
cd FormularioUIF-v1
git add .
git commit -m "v1.1.0: Sistema de actualización automática"
git push origin main

# Si es la primera vez:
git init
git add .
git commit -m "Initial commit: v1.1.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/FormularioUIF-v1.git
git push -u origin main
```

### 2️⃣ Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. **Source**: Branch `main` / Folder `/ (root)`
4. **Save**
5. Espera 1-2 minutos
6. Tu app estará en: `https://TU_USUARIO.github.io/FormularioUIF-v1/`

### 3️⃣ Instalar en dispositivos

#### 📱 **iOS (iPhone/iPad)**
1. Abre Safari
2. Ve a tu URL de GitHub Pages
3. Botón **Compartir** 📤
4. **"Añadir a pantalla de inicio"**
5. ✅ ¡Listo! Ya tienes la app instalada

#### 🤖 **Android**
1. Abre Chrome
2. Ve a tu URL
3. Aparece banner **"Instalar app"**
4. O desde menú: **"Agregar a pantalla de inicio"**
5. ✅ ¡Instalada!

#### 💻 **Desktop (Chrome/Edge)**
1. Abre tu URL
2. Icono ⊕ en barra de direcciones
3. **"Instalar"**
4. ✅ ¡App instalada!

---

## 📁 Estructura de archivos

```
FormularioUIF-v1/
├── index.html              # Archivo principal (ACTUALIZADO ✓)
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker (NUEVO ✨)
├── version.json            # Control de versiones (NUEVO ✨)
├── icon-192.png            # Icono app
├── icon-512.png            # Icono app
├── README.md               # Este archivo
├── DEPLOYMENT_GUIDE.md     # Guía detallada de deployment
└── .gitignore              # Archivos ignorados por Git
```

---

## 🔄 Cómo actualizar la app

### Paso a paso:

#### 1. **Edita tus archivos**
Haz los cambios que necesites en `index.html`, CSS, etc.

#### 2. **Actualiza `version.json`**
```json
{
  "version": "1.2.0",  // ⬅️ Incrementa esto
  "date": "2026-05-07",
  "changelog": [
    "Agregado nuevo campo de validación",
    "Corregido bug en cálculo de SMVM",
    "Mejoras visuales en móviles"
  ],
  "critical": false,
  "minVersion": "1.0.0"
}
```

#### 3. **Actualiza `sw.js`**
```javascript
// Línea 4 en sw.js
const VERSION = '1.2.0'; // ⬅️ Debe coincidir con version.json
```

#### 4. **Actualiza `index-updated.html`**
```javascript
// Busca esta línea en el código (aprox línea 3890):
const CURRENT_VERSION = '1.2.0'; // ⬅️ Actualizar
```

#### 5. **Sube a GitHub**
```bash
git add .
git commit -m "v1.2.0: Descripción de cambios"
git push origin main
```

#### 6. **¡Automático!** ✨
- GitHub Pages se actualiza en 1-2 minutos
- Los usuarios verán notificación automática
- Pueden actualizar con un click

---

## ✨ Características del sistema de actualización

### 🔔 **Notificación automática**
- Detecta nuevas versiones automáticamente
- Notificación elegante y no intrusiva
- Muestra changelog de novedades
- Botón de actualización con un click

### 💾 **Caché inteligente**
- Funciona 100% offline
- Actualización en background
- Limpieza automática de cachés antiguos
- Estrategia cache-first para velocidad

### 🔄 **Chequeo periódico**
- Verifica actualizaciones cada 30 minutos
- Al abrir la app
- Manualmente con `window.manualCheckUpdate()`

### ⚠️ **Modo crítico**
- Configurar `"critical": true` en `version.json`
- Fuerza actualización inmediata
- Bloquea botón "Más tarde"
- Útil para fixes de seguridad

---

## 🛠️ Comandos útiles

### En consola del navegador (F12):

```javascript
// Chequear actualización manualmente
window.manualCheckUpdate()

// Ver versión actual
localStorage.getItem('uif_last_update_seen')

// Ver Service Worker
navigator.serviceWorker.ready.then(reg => console.log(reg))

// Limpiar toda la caché
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('Caché limpiado');
})

// Ver todas las cachés
caches.keys().then(keys => console.log('Cachés:', keys))
```

---

## 📊 Verificar que todo funciona

### ✅ Checklist:

- [ ] URL de GitHub Pages funciona
- [ ] App se puede instalar en móvil
- [ ] Iconos aparecen correctamente
- [ ] Funciona sin internet (modo offline)
- [ ] Notificación de actualización aparece
- [ ] Actualización funciona con un click
- [ ] Colores de tema correctos (#1a4a8a)

### 🧪 Test de actualización:

1. Instala la app en tu móvil
2. Cambia algo en `index.html` (ej: el título)
3. Incrementa versión en `version.json` y `sw.js`
4. Push a GitHub
5. Espera 2-3 minutos
6. Abre la app instalada
7. Debe aparecer notificación de actualización
8. Click en "Actualizar"
9. Debe recargar y mostrar el cambio

---

## 🐛 Troubleshooting

### Problema: "No veo mi actualización"

**Solución:**
```bash
# Fuerza rebuild en GitHub
git commit --allow-empty -m "Force rebuild"
git push
```

**También:**
- Limpia caché del navegador (Ctrl+Shift+Delete)
- Verifica que `version.json` y `sw.js` tengan la misma versión
- Espera 2-3 minutos para que GitHub Pages actualice

### Problema: "Service Worker no se registra"

**Causas comunes:**
- GitHub Pages debe estar en HTTPS ✓ (automático)
- Archivo `sw.js` debe estar en la raíz ✓
- Navegador debe soportar Service Workers

**Verificar:**
```javascript
// En consola
if ('serviceWorker' in navigator) {
  console.log('✓ Service Worker soportado');
} else {
  console.log('✗ Service Worker NO soportado');
}
```

### Problema: "No funciona offline"

**Verificar:**
1. Abre DevTools (F12)
2. Application → Service Workers
3. Debe aparecer "activated and is running"
4. Application → Cache Storage
5. Debe existir caché "uif-v1.1.0"

**Forzar reinstalación:**
```javascript
// En consola
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  console.log('Service Workers desregistrados');
  location.reload();
});
```

---

## 🔐 Seguridad y privacidad

- ✅ Todo el código corre en el dispositivo del usuario
- ✅ No se envía información a servidores externos
- ✅ Datos guardados localmente en localStorage
- ✅ HTTPS obligatorio (GitHub Pages)
- ✅ Sin tracking ni analytics por defecto

---

## 📱 Compatibilidad

| Platform | Browser | Soporte |
|----------|---------|---------|
| iOS 16+  | Safari  | ✅ Full |
| Android 9+ | Chrome | ✅ Full |
| Windows 10+ | Chrome/Edge | ✅ Full |
| macOS | Safari/Chrome | ✅ Full |
| Linux | Chrome/Firefox | ✅ Full |

---

## 📚 Documentación adicional

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía detallada de deployment
- **[version.json](./version.json)** - Control de versiones
- **[manifest.json](./manifest.json)** - Configuración PWA

---

## 🆘 Soporte

### Recursos:
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

### Contacto REMAX CREA:
- Email: rvera@remax.com.ar
- CPI 6778 / CSI 5848

---

## 📝 Changelog

### v1.2.0 (2026-05-13)
- ✨ Sistema de previsualización y verificación antes de generar PDF
- 📝 Edición directa desde el resumen (botones por sección)
- ⚠️ Alertas de campos faltantes importantes
- 🎨 Modal de confirmación mejorado
- 🔧 Corrección: renombrado _gitignore a .gitignore

### v1.1.0 (2026-05-06)
- ✨ Sistema de actualización automática desde GitHub
- 🔔 Notificaciones de nueva versión disponible
- 💾 Mejoras en sistema de caché offline
- 📱 Optimizaciones para PWA multiplataforma

### v1.0.0 (2026-05-01)
- 🎉 Versión inicial
- Formulario UIF completo
- Generación de PDF
- Sistema de historial

---

## 📄 Licencia

Sistema PLAFT-FP 2026 — REMAX CREA  
Ley 25.246 y modificatorias  
Resolución UIF 43/2024, 207/2025 y 3/2026

---

## ⭐ Tips Pro

### Agregar botón de actualización manual:

En tu HTML, donde quieras el botón:

```html
<button onclick="window.manualCheckUpdate()" style="padding: 10px 20px; background: #1a4a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">
  🔄 Buscar actualizaciones
</button>
```

### Ver estado de sincronización:

```javascript
// Agregar en consola
setInterval(() => {
  navigator.serviceWorker.ready.then(reg => {
    console.log('SW State:', reg.active.state);
  });
}, 5000);
```

### Personalizar notificación:

Edita la función `showUpdateNotification()` en `index.html` para cambiar colores, textos, etc.

---

🚀 **¡Todo listo para producción!**

Tu PWA está configurada para actualizarse automáticamente desde GitHub en todos los dispositivos. Los usuarios siempre tendrán la última versión con solo un click.
