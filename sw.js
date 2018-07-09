
// Listens for the initial install of the webpage.
self.addEventListener('install', function(event) {
    // Here is what will happen upon initial install of the serverworker/cache
});

// This listens for when the is a fetch event
// We should be able to use this for when we reach out for external scripts
// Or the images, because they are dynamic in nature so we can improve perforance here 
//self.addEventListener('fetch', function(event) {
//  event.respondWith(
//    caches.match(event.request)
//      .then(function(response) {
//        if(response) {
//          return response;
//        }
//        console.log(event.request);
//      }
//      )
//  )    
//})


// Listens for the initial install of the webpage.
// Here is where we will cache everything for the convenience of the offline user
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/'
            ]);
        })
    );
});
