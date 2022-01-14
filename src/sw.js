const CACHE_NAME = 'turtlemay-cashier';
const urlsToCache = ['/', ...serviceWorkerOption.assets];

self.addEventListener('install', event => {
	self.skipWaiting();
	event.waitUntil(cacheResources(CACHE_NAME));
});

self.addEventListener('fetch', event => {
	event.respondWith(getResource(event.request));
});

/** @param {string} cacheName */
async function cacheResources(cacheName) {
	await caches.delete(cacheName);
	const cache = await caches.open(cacheName);
	await cache.addAll(urlsToCache);
}

/** @param {Request} request */
async function getResource(request) {
	const cache = await caches.open(CACHE_NAME);

	/** @type {Response | undefined} */
	let fetchRes;

	try {
		fetchRes = await fetch(request);
	} catch (error) {
	}

	if (fetchRes && fetchRes.ok) {
		cache.add(request.url);
		return fetchRes;
	}

	return await cache.match(request);
}
