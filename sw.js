// Service worker: guarda o site no navegador para funcionar sem internet.
// Estratégia: tenta a rede primeiro (pega sempre a versão mais nova) e,
// se estiver sem internet, usa a cópia salva. A fonte do Google fica em cache.
// Ao mudar os arquivos do site, aumente CACHE_VERSION.
const CACHE_VERSION = "physicslab-v7";

const FILES = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./js/navigation.js",
    "./js/utils.js",
    "./js/data/guides.js",
    "./js/data/formulas.js",
    "./js/physics/circuits.js",
    "./js/physics/magnetism.js",
    "./js/physics/induction.js",
    "./js/physics/electrostatics.js",
    "./js/physics/capacitors.js",
    "./js/features/theory.js",
    "./js/features/calculator.js",
    "./js/features/exercises.js",
    "./js/features/classroom.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(FILES))
            .then(() => self.skipWaiting())
    );
});

// Apaga caches de versões antigas
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

    // Fonte: usa a cópia salva se existir; senão baixa e guarda
    if (isFont) {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
                return response;
            }))
        );
        return;
    }

    if (url.origin !== self.location.origin) return;

    // Arquivos do site: rede primeiro, cópia salva se estiver offline
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
                }
                return response;
            })
            .catch(() => caches.match(request, { ignoreSearch: true })
                .then(cached => cached || caches.match("./index.html")))
    );
});
