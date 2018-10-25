
// This will watch for any fetch events that come throught the service worker.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {

        }, function(err) {
            // If we fail
            console.log('welp that went terribly // didnt register SW // with err: ', err);
        });
    });
}

