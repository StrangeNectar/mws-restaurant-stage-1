/**
 * Common database helper functions.
 */
let dbPromise;

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${ port }/restaurants`;
  }
  /**
   * Create getter for constants.
   */
    static get RESTAURANT_OBJECTSTORE() {
        const restaurantOS = 'restaurantOS';
        return restaurantOS;
    }
   /**
    *   create object store
    */
    static createOS(callback) {

        const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE; 

        return idb.open('restaurant-database', 1, db => { 
            if (!db.objectStoreNames.contains(restaurantObjectStore)) {
                console.log('we created the object store with name: ', restaurantObjectStore);
                db.createObjectStore(restaurantObjectStore);
            } else {
                console.error('we failed to create the object store');
            }
        });
    }
  /**
   * Put restaurants in store
   */

    static getLocalEventData() {

        dbPromise = this.createOS();

        const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE; 

	    return dbPromise.then((db) => {

            if(!db) {
                
               return;

            } else {

                const tx = db.transaction(restaurantObjectStore, 'readonly');
		        const store = tx.objectStore(restaurantObjectStore);

		        return store.getAll();    
            }
        });	
    }    
    
   
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
      // Grab the DB URL
      let DB_URL = DBHelper.DATABASE_URL;

      const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE; 

      DBHelper.getLocalEventData().then((restaurants) => {
        if (restaurants.length > 0) {
            return callback(null, restaurants);
        }

        fetch(DB_URL)
            .then((res) => {
                if(res.ok) {
                    return res.json();
                }
                throw new Error('The network request with fetch failed');
            })
            .then((json) => {
                dbPromise.then((db) => {
                    if(!db) {
                        return callback(null, json);
                    }
                    
                    let tx = db.transaction(restaurantObjectStore, 'readwrite');
                    let store = tx.objectStore(restaurantObjectStore);

                    for (let i = 0; i < 10; i++) {
                       store.add(json[i], i); 
                    }

                });

                callback(null, json);

            }).catch((err) => {
               callback(err, null); 
            });
        });
  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Restaurant alternate image URL.
   */
  static imageAltTextForRestaurant(restaurant) {
    return (`${restaurant.name}`)
  }
  /**
   *  Restaurant aria-label for buttons
   */
   static ariaLabelForRestaurantButton(restaurant) {
    return (`View Details of ${restaurant.name} restaurant`)
   }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

