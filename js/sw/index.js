
// This will watch for any fetch events that come throught the service worker.
self.addEventListener(fetch, function(e){
    console.log(e.request);
});
