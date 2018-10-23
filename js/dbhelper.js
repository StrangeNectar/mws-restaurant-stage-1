  /**
 * Common database helper functions.
 */
let dbPromise;

class DBHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${ port }/restaurants`;
  }
  /**
   * DB Reviews URL.
   */
  static get DB_REVIEWS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${ port }/reviews`;
  }

  /**
   * Create getter for constants.
   */
  static get RESTAURANT_OBJECTSTORE() {
    const restaurantOS = 'restaurants';
    return restaurantOS;
  }

  /**
   * Create getter reviews object store.
   */
  static get REVIEWS_OBJECTSTORE() {
    const restaurantReviewOS = 'reviews';
    return restaurantReviewOS;
  }
    
  /**
   * Create getter for constants.
   */
  static get RESTAURANT_DB_NAME() {
    const DB_NAME = 'restaurant-database';
    return DB_NAME;
  }

  /**
    * Open our Review Database
    */
  static openDB() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open(DBHelper.RESTAURANT_DB_NAME, 1, function(upgradeDb) {
      switch(upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id',
            autoIncrement: true
          });
        case 1:
          upgradeDb.createObjectStore('reviews', {
            keyPath: 'id',
            autoIncrement: true
          }).createIndex('restaurant', 'restaurant_id');
      }
    });
  }
  
   /**
    *   create object store
    */
    //static createOS(callback) {

        //const restaurantReviewOS = DBHelper.REVIEWS_OBJECTSTORE; 
        //const restaurantOS = DBHelper.RESTAURANT_OBJECTSTORE;

        //return idb.open(DBHelper.RESTAURANT_DB_NAME, 1, db => { 
            //if (!db.objectStoreNames.contains(restaurantReviewOS)) {
              //console.log('we created the object store with name: ', restaurantReviewOS);
              //db.createObjectStore(restaurantReviewOS);
              //db.createObjectStore(restaurantOS);
            //} else {
              //console.error('we failed to create the object store');
            //}
        //});
    //}

    /**
     * Put restaurants in store
     */
    static getLocalEventData() {

      dbPromise = this.openDB();

      const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE; 

	    return dbPromise.then((db) => {
        if(!db) {
           return;
        } else {
          const tx = db.transaction(restaurantObjectStore, 'readonly');
          const store = tx.objectStore(restaurantObjectStore);

          return store.getAll()
            .then(function(restaurants) {
              return restaurants; 
            });
        }
      });	
    }    
  /**
   * Put restaurants in store
   */
  static putDataInDB(data) {
    let restaurants = data;
    const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE;

    DBHelper.openDB().then(function(db) {
      if(!db) return;

      let tx = db.transaction(restaurantObjectStore, 'readwrite');
      let store = tx.objectStore(DBHelper.RESTAURANT_OBJECTSTORE);

      restaurants.forEach(function(restaurant) {
        store.put(restaurant);
      });

      // We want to delete old entries
      store.openCursor(null, "prev").then(function(cursor) {
        return cursor.advance(15);
      }).then(function removeRemainder(cursor) {
        if (!cursor) return;
        cursor.delete();
        return cursor.continue().then(removeRemainder);
      });
    });
  }
    
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const DB_URL = DBHelper.DATABASE_URL;
    const restaurantObjectStore = DBHelper.RESTAURANT_OBJECTSTORE;
    
    DBHelper.getLocalEventData().then(restaurants => {
      if(restaurants.length === 0) {
        fetch(`${DB_URL}`).then(res =>  {
          if(res.ok) {
            return res.json();
          }
          throw new Error('Ooops our fetch failed');
        }).then(data => {
          const restaurants = data;
          DBHelper.putDataInDB(restaurants);
          callback(null, restaurants);
        }).catch(e => {
          callback(e, null);
        });
      } else {
        callback(null, restaurants);
      }
    }); 
  }
   
  /**
   *  Gets the reviews from the db and then updates the db if needed.
   */
  static getReviews(restaurauntID) {
    return fetch(`${DBHelper.DB_REVIEWS_URL}?restaurant_id=${restaurauntID}`)
      .then(res => res.json())
      .then(thisRestaurantReviews => {
        DBHelper.openDB(restaurauntID).then(db => {
          // if we don't have a db
          if (!db) return;

          // Otherwise we have the DB so lets interact with it
          const tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');
          
          if (thisRestaurantReviews.constructor === Array) {
            thisRestaurantReviews.forEach(review => store.put(thisRestaurantReviews));
          } else {
            store.put(thisRestaurantReviews);
          }
        });
        return Promise.resolve(thisRestaurantReviews);
      }).catch(e => {
        return DBHelper.openDB().then(db => {
          if (!db) {
            console.log("our db is in a state of: ", db);
          } else {
            const store = db.transaction('reviews').objectStore('reviews');
            const index = store.index('restaurant');
            return index.getAll(restaurauntID);
          } 
        });
      });
  }; 
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
  /**
   * Allows the ability to favorite a restaurant
   *
   */
  static setRestaurantAsFavorite(restaurauntID, isFavoriteRestaurant) {
    fetch(`${DBHelper.DATABASE_URL}${restaurauntID}/?is_favorite=${isFavoriteRestaurant}`, {
      method: 'put',
    }).then(() => {
      idb.open(DBHelper.RESTAURANT_DB_NAME, 1, function(upgradeDb) {
        
      })
    }) 
  }

  /**
   * Method that will take our reivew form data an post it to our api as JSON.
   */
  static postRestaurantReview(reviewBody) {
    const tempReview = {
      name: 'tempReview',
      data: reviewBody,
      object_type: 'review',
    };

    if (!navigator.onLine) {
      DBHelper.syncDB(tempReview);
      return;
    }

    const { reviewName, reviewRating, reviewComment, restaurant_id } = reviewBody; 
    const thisReview = { reviewName, reviewRating, reviewComment, restaurant_id };

    // now that we have the data lets post the review to our server
    fetch(DBHelper.DB_REVIEWS_URL, {
      method: 'post',
      body: JSON.stringify(thisReview),
      headers: new Headers({
        'Content-Type': 'application/json',
      })
    }).then(res => {
      return res.json();
    });
  }
  
  /*
    * This function will be sure to catch reviews posted when offline.
    * Then it will  be sure to post them once the application is back online by:
    * saving the review in localstorage
    * Hehe JS is cool, eh?
    * */
  static syncDB(reviewBody) {
    localStorage.setItem('review', JSON.stringify(reviewBody.data));
    
    window.addEventListener('online', function() {
      const reviewData = JSON.parse(localStorage.getItem('review'));
      const offlineLabels = Array.prototype.slice.call(document.querySelectorAll('.restaurant-review-is__offline'));
      offlineLabels.forEach(element => element.remove());
      if (reviewBody.name === 'tempReview') DBHelper.postRestaurantReview(review.data);
      localStorage.removeItem('review');
    });
  }

  /**
   * This will ensure that our data doesn't get lost into nothingness.
   * Like it was before.
   * This should keep it alive after the form submission
   */
  //static synchronizeData(reviewBody) {
    //localStorage.setItem('review', JSON.stringify(reviewBody.data));
    
    //window.addEventListener('online', () => {
      //const reviewData = JSON.parse(localStorage.getItem('review'));
      //const offlineLabels = Array.prototype.slice.call(document.querySelectorAll('.
   // })
 // }

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

