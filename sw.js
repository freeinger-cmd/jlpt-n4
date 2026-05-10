const CACHE='jlpt-n4-v1';
const ASSETS=['/jlpt-n4/','/jlpt-n4/index.html','/jlpt-n4/src/style.css','/jlpt-n4/src/data.js','/jlpt-n4/src/app.js','/jlpt-n4/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(res=>{if(!res||res.status!==200||res.type==='opaque')return res;const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));return res;}).catch(()=>caches.match('/jlpt-n4/index.html'));}));});
