let jsonData = makeFetchRequest(); 

var dbPromise = idb.open('bg-db', 2, function(upgradeDb) {
    switch(upgradeDb.oldVersion) {
        case 0:
            var keyValStore = upgradeDb.createObjectStore('keyVal');
            keyValStore.put(jsonData, "restaurantData");
            console.log("Restaurant Data added to DB");
        case 1: 
            upgradeDb.createObjectStore("value", "key");
    }
});

function makeFetchRequest() {
    const restaurantData = [];
    let dataUrl = 'http://localhost:1337/restaurants';

    fetch(dataUrl).then(function(response) {
        // Lets do something with the response
       if(response.status !== 200) {
        restaurantData = restaurantData.push(response)
        console.log("we made the request, here is what it looks like", response, restaurantData);
       } 
        
    }).catch(function(err){
        console.log("something fucked up", err);
    })

    return restaurantData
}

// Read restaurant data from the DB
dbPromise.then(function(db){
    var tx = db.transaction('keyVal');
    var keyValStore = tx.objectStore('keyVal');
    return keyValStore.get('restaurantData');
}).then(function(val){
    console.log('The value of "restaurantData" is: ', val);
});

dbPromise.then(function(db){
    var tx = db.transaction('keyVal', 'readwrite');
    var keyValStore = tx.objectStore('keyVal');
    keyValStore.put('bar', 'foo');
    return tx.complete;
}).then(function(){
    console.log('Added foo:bar to keyval');
});
