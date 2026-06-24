// UIF Inmobiliario — Service Worker v1.3.0
// Sistema de actualizacion automatica desde GitHub

const VERSION = '1.3.0'; // Incrementa esto en cada deploy
const CACHE   = `uif-v${VERSION}`;
const VERSION_URL = './version.json'; // Archivo de control de versiones

// Archivos a pre-cachear en la instalacion
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ════════════════════════════════════════
// INSTALL: pre-cachear assets esenciales
// ════════════════════════════════════════
self.addEventListener('install', event => {
  console.log('[SW] Instalando v' + VERSION);
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // Tomar control inmediatamente sin esperar recarga
      return self.skipWaiting();
    })
  );
});

// ════════════════════════════════════════
// ACTIVATE: limpiar caches viejos y tomar control
// ════════════════════════════════════════
self.addEventListener('activate', event => {
  console.log('[SW] Activando v' + VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key.startsWith('uif-') && key !== CACHE)
          .map(key => {
            console.log('[SW] Eliminando cache viejo:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      // Tomar control de todos los clientes abiertos inmediatamente
      return self.clients.claim();
    })
  );
});

// ════════════════════════════════════════
// FETCH: estrategia por tipo de recurso
// ════════════════════════════════════════
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // version.json: SIEMPRE desde red (nunca desde cache)
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // index.html: network-first (garantiza siempre la ultima version)
  if (url.pathname === '/' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then(response => {
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

  // Resto de assets: cache-first con actualizacion en background
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Actualizar en background (stale-while-revalidate)
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE).then(cache => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      // No esta en cache, traer de red
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

// ════════════════════════════════════════
// MENSAJE: recibir comandos del cliente
// ════════════════════════════════════════
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  }
});

// ════════════════════════════════════════
// CHECK FOR UPDATES: verificar version.json
// ════════════════════════════════════════
async function checkForUpdates() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const latestVersion = data.version;

    if (latestVersion && latestVersion !== VERSION) {
      console.log('[SW] Nueva version disponible:', latestVersion, '(actual:', VERSION + ')');
      // Notificar a todos los clientes
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
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

// Chequear actualizaciones cada 30 minutos
setInterval(checkForUpdates, 30 * 60 * 1000);

// Chequear al activar tambien
self.addEventListener('activate', () => {
  setTimeout(checkForUpdates, 3000);
});

// ════════════════════════════════════════
// SYNC BACKGROUND
// ════════════════════════════════════════
self.addEventListener('sync', event => {
  if (event.tag === 'check-update') {
    event.waitUntil(checkForUpdates());
  }
});
