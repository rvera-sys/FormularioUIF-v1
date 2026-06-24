// UIF Inmobiliario â Service Worker v1.1.0
// Sistema de actualizaciÃ³n automÃ¡tica desde GitHub

const VERSION = '1.3.0'; // Incrementa esto en cada actualizaciÃ³n
const CACHE = `uif-v${VERSION}`;
const VERSION_URL = './version.json'; // Archivo con info de versiÃ³n en GitHub

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

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// INSTALACIÃN
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
self.addEventListener('install', event => {
  console.log('[SW] Instalando versiÃ³n', VERSION);
  
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        return cache.addAll(ASSETS.map(url => 
          new Request(url, { cache: 'reload' })
        ));
      })
      .catch(err => {
        console.warn('[SW] Error en cachÃ© inicial, continuando...', err);
        // Cache mÃ­nimo esencial si falla
        return caches.open(CACHE).then(cache => 
          cache.addAll(['./index.html', './manifest.json', './version.json'])
        );
      })
      .then(() => {
        console.log('[SW] CachÃ© creado exitosamente');
        return self.skipWaiting(); // Activa inmediatamente
      })
  );
});

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// ACTIVACIÃN
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
self.addEventListener('activate', event => {
  console.log('[SW] Activando versiÃ³n', VERSION);
  
  event.waitUntil(
    // Limpiar cachÃ©s antiguos
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE && key.startsWith('uif-'))
            .map(key => {
              console.log('[SW] Eliminando cachÃ© antiguo:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] CachÃ©s antiguos eliminados');
        return self.clients.claim(); // Toma control inmediato
      })
  );
});

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// FETCH - Estrategia de cachÃ©
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // APIs externas: Network-first (con fallback a cachÃ©)
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
  
  // Assets locales: Cache-first (con actualizaciÃ³n en background)
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
        
        // No estÃ¡ en cachÃ©, traer de red
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

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// CHECK UPDATES - Chequeo periÃ³dico de actualizaciones
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    
    console.log('[SW] VersiÃ³n actual:', VERSION, '| VersiÃ³n disponible:', latestVersion);
    
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

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SYNC BACKGROUND - Para cuando vuelve la conexiÃ³n
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
self.addEventListener('sync', event => {
  if (event.tag === 'check-update') {
    event.waitUntil(checkForUpdates());
  }
});
