var restaurauntIDB = (function() {
    'use strict';
    
    // Declaring global vars
    let restaurantDataUrl = 'http://localhost:1337/restaurants/';
    let restaurantObjectStore = 'restaurantOS';
    
    const restaurantKey = 'id';
    
    // Gather necessary DOM elems
    const container = document.getElementById('restaurant-list');
    const dataSavedMessage = document.getElementById('data-saved');
    const saveErrorMessage = document.getElementById('save-error');
    const noDataMessage = document.getElementById('no-data');
    const offlineMessage = document.getElementById('offline');

    if(!('indexedDB' in window)) {
        console.log('This browser does not support IndexDB');
        return;
    }

    loadContentFromNetworkInit();

    function loadContentFromNetworkInit() {
        getRestaurantData()
        .then(dataFromNetwork => {
            //updateUI(dataFromNetwork);
            saveEventDataLocally(dataFromNetwork)
            .then(() => {
                setLastUpdate(new Date());
                messageDataSaved(); 
            }).catch(err => {
                messageSaveError();
                console.warn(err);
            });
        }).catch(err => {
            console.log('Network Requests have now failed, you are definetely offline');
            getLocalEventData()
            .then(offlineData => {
                if(!offlineData.length) {
                    messageNoData();
                } else {
                    messageOffline();
                    //updateUI(offlineData);
                } 
            });
        });
    }

    const dbPromise = idb.open('restaurant-store', 1, upgradeDb => {
	if (!upgradeDb.objectStoreNames.contains('events')) {
	  const restaurantOS = upgradeDb.createObjectStore(restaurantObjectStore);
	}
    });

    // Declaring our keyvalue store 
    const idbKeyVal = {
      get(key) {
        return dbPromise.then(db => {
            return db.transaction(restaurantObjectStore)
              .objectStore(restaurantObjectStore).get(key);
        });
      },
      
      getAll() {
       if (!('indexeDB' in window)) {return null;}
        return dbPromise.then(db => {
            const tx = db.transaction(restaurantObjectStore, 'readonly');
            const store = tx.objectStore(restaurantObjectStore);
            return store.getAll();
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
    function getRestaurantData() {
        return fetch(restaurantDataUrl)
                .then(status)
                .then(json)
                .then(addRestaurantDataToIDB)
                .catch(function(error){

                console.log('Request failed', error);
        });
    }
    
    function updateUI(events) {
        events.forEach(event => {
            const item = 
            `
                <li>
                    <img class="restaurant-img" src="${event.photograph}.jpg"
                    <h2>${event.name}<h2>
                    <p>${event.neighborhood}</p>
                    <p>${event.address}</p>
                    <a aria-label="view details of ${event.name} restaurant" href="./restaurant.html?id=${event.id}>View Details</a>
                </li>    
            `
            container.insertAdjacentHTML('beforeend', item);
        }) 
    }

    function setLastUpdate() {
        localStorage.setItem('lastUpdated', date);
    }

    function messageDataSaved() {
        const lastUpdated = getLastUpdated();
        if(lastUpdated) {dataSavedMessage.textContent += ' on ' + lastUpdated;}
        dataSavedMessage.style.display = 'block';
    }

    function getLastUpdated() {
        return localStorage.getItem('lastUpdated');
    }

    function messageSaveError() {
        // aler the user
        saveErrorMessage.style.display = 'block';
    }

    function getLocalEventData() {
        return dbPromise.then(db => {
            const tx = db.transaction(restaurantObjectStore, 'readonly');
            const store = tx.objectStore(restaurantObjectStore);
            return store.getAll();
        });
    }

    function messageNoData() {
        noDataMessage.style.display = 'block';
    }
    
    function messageOffline() {
        const lastUpdated = getLastUpdated();
        if (lastUpdated) {
            offlineMessage.textContent += ' last fetched server data: ' + lastUpdated;
        }
        offlineMessage.style.display = 'block';
    }
    
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
