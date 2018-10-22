let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoic3RyYW5nZW5lY3RhciIsImEiOiJjamlvcTdsdzcwMWVtM3ZycWd6NGFrbmowIn0.GyI5P23LCVPGHTI7oRpd4A',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = DBHelper.imageAltTextForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
/**
 *  Checks to see wether the element has the information we need from it
 *  Checks to see if the element data is valid
 *  @param {element}
 *  @return {bool}
 */
const isValidElement = element => {
  return element.name && element.value;
}

/**
 *  Handle the form submission and convert the data to JSON
 *  @param {HTMLFormControlsCollection}
 *  @return {object}
 */
const formToJSON_deconstructed = elements => {

  const formReducer = (data, element) => {
  
    // add the current field to our data object
    if (isValidElement(element)) {

      data[element.name] = element.value;
     
    }

    console.log(JSON.stringify(data));

    return data;

  }
  
  const reducerInitialValue = {};

  console.log('initial `data` value:', JSON.stringify(reducerInitialValue));

  const formData = [].reduce.call(elements, formReducer, reducerInitialValue);

  return formData;
}

/**
 *  Handle the form submission and convert the data to JSON
 *  @param {event}
 *  @return {void}
 */
const handleFormSubmit = () => {
  // We want to avoid the default action of a form submission
  event.preventDefault();

  // Lets build up our post body
  const restaurantID = getParameterByName('id');
  const name = document.getElementById('name').value;
  const reviewRating = document.getElementById('rating').value;
  const comments = document.getElementById('message').value;

  // The key names for this object need to match what is expected by:
  // createReviewHTML
  const postBody = {
    date: new Date(),
    // We have to parse our string
    restaurant_id: parseInt(restaurantID),
    // We have to parse our string
    rating: parseInt(reviewRating),
    name,
    comments
  };
  
  // Send this data to our helper function
  // This will post the data to the api
  DBHelper.postRestaurantReview(postBody);
  // We also want the data to be posted to the page live
  updateReviews(postBody);
  // Lets be sure to reset the form without a page interuption
  document.querySelector('form').reset();
}

updateReviews = review => {

  const reviews_container = document.querySelector('#reviews-container');
  const ul = document.querySelector('#reviews-list');
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  reviews_container.appendChild(ul);

}

/* Lets listen for that sweet form submission */
const form = document.querySelector('form');

form.addEventListener('submit', handleFormSubmit);


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
