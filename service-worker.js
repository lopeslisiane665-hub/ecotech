const CACHE_NAME = 'ecotech-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Evento de Instalação: Cacheamento de Recursos Estruturais (App Shell)
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando Novo Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pré-cacheando App Shell com sucesso.');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Força a ativação imediata ignorando o estado 'waiting' (Abordado na Aula 3)
  self.skipWaiting();
});

// Evento de Ativação: Limpeza de Caches Obsoletos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando Worker e limpando caches antigos...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Garante o controle das páginas imediatamente
  return self.clients.claim();
});

// Evento Fetch: Estratégia Cache-First com Fallback de Rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[Service Worker] Fornecendo recurso do cache:', event.request.url);
        return cachedResponse;
      }
      
      console.log('[Service Worker] Buscando na rede:', event.request.url);
      return fetch(event.request).catch(() => {
        console.error('[Service Worker] Falha na rede e recurso indisponível no cache.');
      });
    })
  );
});

// Evento Push: Recebimento de Mensagens do Servidor (FCM/VAPID) (Abordado na Aula 2)
self.addEventListener('push', event => {
  console.log('[Service Worker] Evento de Push recebido.');
  
  let data = { title: 'Alerta EcoTech', body: 'Nova atualização de sustentabilidade!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});