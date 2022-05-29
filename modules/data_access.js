//Aakanksha to code for database related functions

//all relevant functions can be copied into the other modules for usage

/*code for check if a user is new - function names checkUserNew, welcome_back, new_user_data_collection 
telegramUserId and chatId are parameters for all three functions. These are extracted from messages sent by the user.
*/

// checks if the user is new - if they are, it initiates the user data collection process, otherwise it sends a welcome back message
function checkUserNew(telegramUserId, chatId) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("enter db name");
        // check if a user with this telegram user id exists in the database
        dbo.collection("users").find({"telegramUserId": telegramUserId}).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            if (result.length === 0) {
                new_user_data_collection(telegramUserId, chatId)
            }
            else{
                welcome_back(telegramUserId, chatId)
            }
    });
}); 
}

// is called when a user is not new
function welcome_back(telegramUserId, chatId) {
    bot.sendMessage(chatId, 'Welcome back!')
} 

// is called when user is new to start the data collection process
function new_user_data_collection(telegramUserId, chatId) {
    bot.sendMessage(chatId, userLib.msg_init_reg)
    logNewUser({"telegramUserId": telegramUserId})
    save_to_userReg_cache(telegramUserId, userLib.ask_name)
} 

/*code to save a new users details - function names logNewUser, setUserAttribute 
all the data points needed are collected from messages sent over chatbot system
*/

// creates a new record for a user in the users collection of the database
function logNewUser(user_info) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("enter db name");
        dbo.collection("users").insertOne(user_info, function(err, res) {
            if (err) throw err;
            db.close();
        });
	});
};

// adds or updates a given user attribute (name / address / phone number) to their corresponding record in the database
function setUserAttribute(user_attribute, telegramUserId) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("enter db name");
        dbo.collection("users").updateOne({"telegramUserId": telegramUserId}, {$set: user_attribute}, function(err, res) {
            if (err) throw err;
            db.close();
        })
	});
};


/* code to lock orders - function names lockToOrdersCollection, LockOrder
orderDetails is a parameter for LockOrder. It is an object with the attributes listingid, donor_userid, and recipient_userid
these must be provided when it's called from the request_food module
*/

// declaring function to log order object to database
function lockToOrdersCollection(order_to_lock) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("enter db name");
        dbo.collection("orders").insertOne(order_to_lock, function(err, res) {
            if (err) throw err;
            db.close();
        });
	});
};

// declaring function to take order details and create order object
function lockOrder(orderDetails) {
    const details_to_database = {}
    details_to_database.listing_id = orderDetails.listingid;
    details_to_database.donor_userid = orderDetails['donor_userid'];
    details_to_database.recipient_userid = orderDetails['recipient_userid'];
    details_to_database.status = 'locked';
    lockToOrdersCollection(details_to_database);
};

/* code to save food listing - function names locktoListingsCollection, saveFoodListing
foodDetails is a parameter for saveFoodListing. It is an object with the attributes donor_userid, food_item, quantity and last_available_time
these must be provided when it's called from the add_food module
*/

// declaring function to log listing object to database
function lockToListingsCollection(listing_to_lock) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        const dbo = db.db("enter db name");
        dbo.collection("listings").insertOne(order_to_lock, function(err, res) {
            if (err) throw err;
            db.close();
        });
	});
};

// declaring function to take food listing details and create listing object
function saveFoodListing(foodDetails) {
    const details_to_database = {}
    details_to_database[donor_userid] = foodDetails[donor_userid];
    details_to_database[food_item] = foodDetails[food_item];
    details_to_database.quantity = foodDetails.quantity;
    details_to_database[last_available_time] = foodDetails[last_available_time];

    lockToListingsCollection(details_to_database);
};

/* code to query for listings - function name searchListing
input is a parameter for searchListing. It must be a pincode which must be provided when it's called from the search_food module
as it's an async/await function, you need to use an async/await function when accessing it in the search_food module 
*/

async function searchListing(input) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }
    try {
        const db = client.db("enter db name");
        let collection = db.collection("listings");
        let query = { pincode: input }
        let res = await collection.find(query).toArray();
        return res;
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}
