(function() {
    'use strict';
    
    // Declaring global vars
    let restaurantDataUrl = 'http://localhost:1337/restaurants/';
    let restaurantObjectStore = 'restaurantOS';
    const restaurantKey = 'id';

    if(!('indexedDB' in window)) {
        console.log('This browser does not support IndexDB');
        return;
    }

    const dbPromise = idb.open('restaurant-store', 1, upgradeDb => {

        console.log('creating a new object store, with name: ' + restaurantObjectStore);

        if(!upgradeDb.objectStoreNames.contains(restaurantObjectStore)) {
						var restaurantOS = upgradeDb.createObjectStore(restaurantObjectStore);
        }
        // Create more object stores here
    });

    // Declaring our keyvalue store 
    const idbKeyVal = {
      get(key) {
        return dbPromise.then(db => {
            return db.transaction(restaurantObjectStore)
              .objectStore(restaurantObjectStore).get(key);
        });
      },

      set(key, val) {
				dbPromise.then(function(db){
					var tx = db.transaction(restaurantObjectStore, 'readwrite');
					var store = tx.objectStore(restaurantObjectStore);
					store.add(key, val);
				})				
      },
      
      delete(key) {
        return dbPromise.then(db =>{
            const tx = db.transaction(restaurantObjectStore, 'readwrite');
            tx.objectStore(restaurantObjectStore).delete(key);
            return tx.complete;
        });
      },

      keys() {
        return dbPromise.then(db => {
            const tx = db.transaction(restaurantObjectStore);
            const keys = [];
            const store = tx.objectStore(restaurantObjectStore);

            (store.iterateKeyCursor || store.iterateCursor).call(store, cursosr => {
                if(!cursor) return;
                keys.push(cursor.key);
                cursor.continue();
            });

            return tx.complete.then(() => keys);
        });
      }
    }
    
    
    /*
     *  @DESCRIPTION: Uses the fetch api to gather restaurant data from the restaurant api by a restaurant id.
     *  @PARAMS:      Takes a restaurant id number that corresponds to the sequential json response data
     *    -TYPE:      INTEGER 
     *  @RETURNS:     Returns the relevant JSON Data
     *  @AUTHOR: BENJAMIN BLUE GRONEMAN
     *  @AUTHOR-EMAIL: bbg0714@cwc.edu
     *
     * */
    

    fetch(restaurantDataUrl)
      .then(status)
      .then(json)
      .then(addRestaurantDataToIDB)
      .catch(function(error){

        console.log('Request failed', error);

      });

		function addRestaurantDataToIDB(data) {
        // TODO: add restaurant data to IDB
        for (let i = 0; i < 10; i++) { 
        	idbKeyVal.set(data[i], i); 
        }
    }

		function status(response) {
			if (response.status >= 200 && response.status < 300) {
          
				return Promise.resolve(response);

			} else {

				return Promise.reject(new Error(response.statusText));

			}
		}

		function json(response) {

			return response.json();

		}

})();
