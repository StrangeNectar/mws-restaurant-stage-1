(function () {
    // IndexedDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
        dbVersion = 1.0;

    // Create/open database
    var request = indexedDB.open("restaurantFiles", dbVersion),
        db,
        createObjectStore = function (dataBase) {
            // Create an objectStore
            console.log("Creating objectStore")
            dataBase.createObjectStore("restaurants");
        },

        getJsonFile = function () {
            // Create XHR
            var xhr = new XMLHttpRequest();

            xhr.open("GET", "http://localhost:1337/restaurants", true);
            // Set the responseType to JSON
            xhr.responseType = "json";

            xhr.addEventListener("load", function () {
                if (xhr.status === 200) {
                    console.log("Restaurant Data Recieved");
                    
                    // Blob as response
                    json = xhr.response;
                    console.log("JSON Data: " + json);

                    // Put the received blob into IndexedDB
                    putRestaurantDataInDb(json);
                }
            }, false);
            // Send XHR
            xhr.send();
        },

        putRestaurantDataInDb = function (json) {
            console.log("Putting restaurant data in IndexedDB");

            // Open a transaction to the database
            var transaction = db.transaction(["restaurants"], IDBTransaction.READ_WRITE);

            // Put the json into the dabase
            var put = transaction.objectStore("restaurants").put(json, "json");

            // Retrieve the file that was just stored
            transaction.objectStore("restaurants").get("json").onsuccess = function (event) {
                var jsonFile = event.target.result;
                console.log("Got json!" + jsonFile);

                // Get window.URL object
                var URL = window.URL || window.webkitURL;

                // Create and revoke ObjectURL
                var jsonURL = URL.createObjectURL(jsonFile);

                // Revoking ObjectURL
                URL.revokeObjectURL(jsonURL);
            };
        };

    request.onerror = function (event) {
        console.log("Error creating/accessing IndexedDB database");
    };

    request.onsuccess = function (event) {
        console.log("Success creating/accessing IndexedDB database");
        db = request.result;

        db.onerror = function (event) {
            console.log("Error creating/accessing IndexedDB database");
        };
        
        // Interim solution for Google Chrome to create an objectStore. Will be deprecated
        if (db.setVersion) {
            if (db.version != dbVersion) {
                var setVersion = db.setVersion(dbVersion);
                setVersion.onsuccess = function () {
                    createObjectStore(db);
                    getJsonFile();
                };
            }
            else {
                getJsonFile();
            }
        }
        else {
            getJsonFile();
        }
    }
    
    // For future use. Currently only in latest Firefox versions
    request.onupgradeneeded = function (event) {
        createObjectStore(event.target.result);
    };
})();
