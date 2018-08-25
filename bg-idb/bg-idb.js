(function() {
    'use strict';
    
    // Declaring global vars
    let restaurantDataUrl = 'http://localhost:1337/restaurants/';
    let restaurantObjectStore = 'restaurantOS';

    if(!('indexedDB' in window)) {
        console.log('This browser does not support IndexDB');
        return;
    }

    var dbPromise = idb.open('restaurantData-1', 1, function(upgradeDb) {

        console.log('creating a new object store');

        if(!upgradeDb.objectStoreNames.contains(restaurantObjectStore)) {
						var restaurantOS = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        }
        // Create more object stores here
    });

    // lets catch this promise .then add some data to it
    dbPromise.then(function(db){
        var tx = db.transaction(restaurantObjectStore, 'readwrite');
        var store = tx.objectStore(restaurantObjectStore);
        var items = {
            name: 'sandwich',
            price: 4.99,
            description: 'A very tasty sandwich'
        }; 
        //let data = fetch(restaurantDataUrl).then(function(response){
        //    items = response.json();
        //}).catch(function(err){
        //    console.log('Our Fetch request for restaurant data has failed: ', err);
        //});
        
        // Once we have populated items with restaurant data we can then add them to the store
				
				tx.oncomplete = function(event) {
					console.log('The transaction has completed');
				}

				tx.onerror = function(event) {
					console.log('this sucks')
				}

        store.add(items, 'id');
        return tx.complete;
    }).then(function() {
        console.log('The items have been added to the object store');
    }).catch(function() {
        console.log('The items have NOT been added to the store');
    }); 

})();
