'user strict';


// This function will register the service worker
// I also found out that the service worker needs to be at the root of the project
// This is important so that the service worker has access to all of the websites assets
function registerServiceWorker() {
    if('serviceWorker' in navigator) {
        // ON load we will get the service worker
        // This should aid in performance on slow networks
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/sw/index.js');
            console.log("WOOT IT WORKED");
        });
    } else {
        console.log("We have failed miserablely");
    }
}

registerServiceWorker();
