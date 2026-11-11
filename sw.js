const CACHE = 'ilsang-nihongo-v3';
const AUDIO_CACHE = 'ilsang-nihongo-audio-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== AUDIO_CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // 녹음 파일: 한 번 들은 건 저장해 두고 다음부터 바로 꺼내 씀
  if (url.pathname.includes('/audio/')) {
    e.respondWith(caches.open(AUDIO_CACHE).then(c => c.match(e.request, {ignoreSearch:true}).then(hit => hit || fetch(e.request).then(r => { if (r.ok && r.status === 200) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  // 나머지: 인터넷이 되면 최신본, 안 되면 저장본
  e.respondWith(fetch(e.request, {cache: 'no-store'}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
});
