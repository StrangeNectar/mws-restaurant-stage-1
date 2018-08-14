
// This will watch for any fetch events that come throught the service worker.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // If we succeed 
            console.log('Welp that went well // registered SW // we had a scope of: ', registration.scope);

        }, function(err) {
            // If we fail
            console.log('welp that went terribly // didnt register SW // with err: ', err);
        });
    });
}

