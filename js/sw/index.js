
// This will watch for any fetch events that come throught the service worker.
if('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('Woot it worked! Service worker is registered.', registration.scope);
    }, function(err) {
      console.log('Oh no! Our service worker failed!', err);
    });
  });
}


