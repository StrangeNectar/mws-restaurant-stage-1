class IDBClass {
    static get RESTAURANT_OBJECTSTORE() {
        const restaurantOS = 'restaurantOS';
        return restaurantOS;
    }
   /**
    *   Check to see if idb is capable of running
    */
    static checkForSupport() {
        if (!('indexedDB' in window)) {
            console.error('This browser does not support indexDB!');
            return
        }
    }
   /**
    *   create object store
    */
    static createObjectStore() {

        const restaurantObjectStore = IDBClass.RESTAURANT_OBJECTSTORE; 

        let dbPromise = idb.open('restaurant-Database', 1, function(upgradDb) {
            if (!upgradeDb.objectStoreNames.contains(restaurantObjectStore)) {
                console.log('we created the object store with name: ', restaurantObjectStore);
                upgradDb.createObjectStore(restaurantObjectStore);
            } else {
                console.error('we failed to create the object store');
            }
        })
    }

}
