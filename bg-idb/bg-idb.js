var dbPromise = idb.open('bg-db', 1, function(upgradeDb) {
    var keyValStore = upgradeDb.createObjectStore('keyVal');
    
    console.log("we have created and put stuff in the database");
});

function makeFetchRequest() {
    const restaurantData = [];
    let dataUrl = 'http://localhost:1337/restaurants';

    fetch(dataUrl).then(function(response) {
        // Lets do something with the response
       if(response.status !== 200) {
        console.log("we made the request, here is what it looks like", response);
       } 
        
    }).catch(function(err){
        console.log("something fucked up");
    })

    return restaurantData
}


dbPromise.then(function(db){
    var tx = db.transaction('keyVal');
    var keyValStore = tx.objectStore('keyVal');
    return keyValStore.get('hello');
}).then(function(val){
    console.log('The value of "hello" is:', val);
});

dbPromise.then(function(db){
    var tx = db.transaction('keyVal', 'readwrite');
    var keyValStore = tx.objectStore('keyVal');
    keyValStore.put('bar', 'foo');
    return tx.complete;
}).then(function(){
    console.log('Added foo:bar to keyval');
});
