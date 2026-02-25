const CACHE = 'admin-v1'
const PRECACHE = ['/admin']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})
