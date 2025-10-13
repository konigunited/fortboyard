// Service Worker для кэширования
const CACHE_NAME = 'fort-boyard-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/birthday.html',
    '/corporate.html',
    '/class-trip.html',
    '/graduation.html',
    '/contacts.html'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Установка...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Кэширование файлов');
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.log('Service Worker: Ошибка кэширования', err);
            })
    );

    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активация...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Удаление старого кэша', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );

    return self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    // Игнорируем не-GET запросы
    if (event.request.method !== 'GET') return;

    // Игнорируем chrome-extension и другие протоколы
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный ответ, если есть
                if (response) {
                    // Обновляем кэш в фоне
                    fetch(event.request).then((freshResponse) => {
                        if (freshResponse && freshResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, freshResponse);
                            });
                        }
                    }).catch(() => {
                        // Сетевая ошибка, используем кэш
                    });

                    return response;
                }

                // Если в кэше нет, запрашиваем из сети
                return fetch(event.request)
                    .then((response) => {
                        // Проверяем валидность ответа
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Клонируем ответ для кэширования
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Возвращаем offline страницу если есть
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('Service Worker: Кэш очищен');
        });
    }
});
