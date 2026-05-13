// UIF Inmobiliario — Service Worker v1.1.0
// Sistema de actualización automática desde GitHub

const VERSION = '1.2.1'; // Incrementa esto en cada actualización
const CACHE = `uif-v${VERSION}`;
const VERSION_URL = './version.json'; // Archivo con info de versión en GitHub

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './version.json',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// ═══════════════════════════════════════════════════════════════
// INSTALACIÓN
// ═══════════════════════════════════════════════════════════════
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión', VERSION);
  
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        return cache.addAll(ASSETS.map(url => 
          new Request(url, { cache: 'reload' })
        ));
      })
      .catch(err => {
        console.warn('[SW] Error en caché inicial, continuando...', err);
        // Cache mínimo esencial si falla
        return caches.open(CACHE).then(cache => 
          cache.addAll(['./index.html', './manifest.json', './version.json'])
        );
      })
      .then(() => {
        console.log('[SW] Caché creado exitosamente');
        return self.skipWaiting(); // Activa inmediatamente
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// ACTIVACIÓN
// ═══════════════════════════════════════════════════════════════
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión', VERSION);
  
  event.waitUntil(
    // Limpiar cachés antiguos
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE && key.startsWith('uif-'))
            .map(key => {
              console.log('[SW] Eliminando caché antiguo:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Cachés antiguos eliminados');
        return self.clients.claim(); // Toma control inmediato
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// FETCH - Estrategia de caché
// ═══════════════════════════════════════════════════════════════
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // APIs externas: Network-first (con fallback a caché)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cachear si es exitoso
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // version.json: SIEMPRE desde red para detectar actualizaciones
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Assets locales: Cache-first (con actualización en background)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          // Actualizar en background
          fetch(event.request).then(response => {
            if (response.ok) {
              caches.open(CACHE).then(cache => cache.put(event.request, response));
            }
          }).catch(() => {});
          
          return cached;
        }
        
        // No está en caché, traer de red
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
  );
});

// ═══════════════════════════════════════════════════════════════
// CHECK UPDATES - Chequeo periódico de actualizaciones
// ═══════════════════════════════════════════════════════════════
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return;
    
    const data = await response.json();
    const latestVersion = data.version;
    
    console.log('[SW] Versión actual:', VERSION, '| Versión disponible:', latestVersion);
    
    if (latestVersion !== VERSION) {
      // Notificar a todos los clientes
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: latestVersion,
          changelog: data.changelog || []
        });
      });
    }
  } catch (err) {
    console.warn('[SW] Error verificando actualizaciones:', err);
  }
}

// Chequear actualizaciones cada hora
setInterval(checkForUpdates, 60 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════
// SYNC BACKGROUND - Para cuando vuelve la conexión
// ═══════════════════════════════════════════════════════════════
self.addEventListener('sync', event => {
  if (event.tag === 'check-update') {
    event.waitUntil(checkForUpdates());
  }
});
