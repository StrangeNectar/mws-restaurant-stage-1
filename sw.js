let CACHE_NAME = 'mws-restaurant-stage-v1';
let CACHE_URLS = [
    '/css/styles.css',
    '/data/restaurants.json',
    '/img/1.jpg',
    '/img/10.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/sw/index.js',
    '/index.html',
    '/restaurant.html',
    '/sw.js'
]

// Listens for the initial install of the webpage.
// Here is where we will cache everything for the convenience of the offline user
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll([CACHE_URLS]);
        })
    );
});

// Now that we have cached what we want, lets go ahead and send it out when need be
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(res){
                if(res) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Now we need to delete the previous cache and replace it with the updated proper cache
// This will happen upon the service worker becoming instantiated
self.addEventListener('activate', function(event){
    let cacheWhitelist = ['mws-restaurant-stage-v1', 'mws-restaurant-stage-v2'];

    event.waitUntil(
        caches.keys().the(function(cacheNames){
            return Promise.all(
                cacheNames.map(function(cacheName){
                    if(cacheWhitelist.indexOf(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })        
            );
        })        
    );
});

