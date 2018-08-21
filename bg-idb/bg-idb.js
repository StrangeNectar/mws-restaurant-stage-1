(function() {
    'use strict';

    if(!('indexedDB' in window)) {
        console.log('This browser does not support IndexDB');
        return;
    }

    var dbPromise = idb.open('restaurantData-1', 1, function(upgradeDb) {
        console.log('creating a new object store');
        if(!upgradeDb.objectStoreNames.contains('restaurantOS')) {
            upgradeDb.createObjectStore('restaurantOS', {keyPath: 'id'});
        }
        // Create more object stores here
    });

    // lets catch this promise .then add some data to it
    dbPromise.then(function(db){
        var tx = db.transaction('restaurantOS', 'readwrite');
        var store = tx.objectStore('restaurantOS');
        var items = []; 
        gatherRestaurantData();
        console.log('Welp we made it to the promise then function')
    }) 
    
    // Lets get the data we need
    function gatherRestaurantData() {
        for(var i = 0; i < 10; i++) {
            let dataurl = `http://localhost:1337/restaurants/${i}` 
            data = fetch(dataurl);
            console.log(data);
            return data;
        }
    };
})();
