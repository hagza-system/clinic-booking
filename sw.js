// Service Worker بسيط لخدمة "تثبيت حجزة كتطبيق" على الموبايل.
// مش بيعمل أي كاش لطلبات الـ API (الحجوزات/الإعدادات) عشان البيانات تفضل محدّثة دايمًا -
// غرضه الوحيد إنه يخلي المتصفح يعتبر الصفحة "قابلة للتثبيت" ويشتغل زي تطبيق حقيقي (بدون شريط عنوان المتصفح).
const CACHE_NAME = 'hagza-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // أي طلب لسيرفر الحجز (Supabase) يعدي زي ما هو دايمًا، من غير أي كاش
  if (url.hostname.includes('supabase.co')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
