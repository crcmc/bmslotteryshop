/**
 * 보물섬 복권방 — 최소 Service Worker
 * 네트워크 프록시 없음. 설치 자격(PWA install criteria)만 충족시키기 위해 존재.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* pass-through */ });
