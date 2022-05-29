// Aakanksha to code the user registration module

const userLib = require("./userLib");

// initiates database
const MongoClient = require('mongodb').MongoClient;
const url = "insert database url"

// initiates bot
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
// token in seperate .env file
const token = process.env.TOKEN;

// creates new bot
const bot = new TelegramBot(token, {
    polling: true
});

// initiates cache
const NodeCache = require( "node-cache" );
const userRegCache = new NodeCache({stdTTL: 600});

// saves the last question asked to a particular user to the cache
function save_to_userReg_cache(telegramUserId, lastQuestion) {
    obj = lastQuestion
    userRegCache.set(telegramUserId, obj)
}

// retrieve the last asked question for a given user from the cache
function find_last_question(telegramUserId) {
    const last_question = userRegCache.get(telegramUserId)
    userRegCache.take(telegramUserId)
    return last_question
}

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

// for debugging
bot.on("polling_error", console.log);

// when a user sends a text starting with /reply, the bot retrieves the last asked question from cache, sets the relevant user attribute and asks the next question
bot.onText(/\/reply/, (msg, match) => {
    // retrieve telegram user id and chat id
    const userName = msg.from.username;
    const chatId = msg.chat.id;
    // retrieve text of message excluding /reply
    const [first, ...rest] = match.input.split(' ')
    const msg_text = rest.join(' ')
    // saves last question asked to this user to a local variable last_q
    let last_q = find_last_question(userName)
    // saves name and asks for donor / recipient
    if (last_q === userLib.ask_name) {
        setUserAttribute({"name": msg_text},userName)
        bot.sendMessage(chatId, userLib.ask_status)
        save_to_userReg_cache(userName, userLib.ask_status)
    }
    // saves donor / recipient and phone number
    else if (last_q === userLib.ask_status) {
        if (msg_text == "1") {
            setUserAttribute({"status": "donor"},userName)
            bot.sendMessage(chatId, userLib.ask_address) 
            save_to_userReg_cache(userName, userLib.ask_address) }
        else if (msg_text == "2") {
            setUserAttribute({"status": "recipient"},userName)
            bot.sendMessage(chatId, userLib.ask_address) 
            save_to_userReg_cache(userName, userLib.ask_address)}
        else {
            bot.sendMessage(chatId, userLib.ask_status_clarify)
            save_to_userReg_cache(userName, userLib.ask_status)}
        }
    // saves address and asks for pincode
    else if (last_q === userLib.ask_address) {
        setUserAttribute({"address": msg_text},userName)
        bot.sendMessage(chatId, userLib.ask_pincode)
        save_to_userReg_cache(userName, userLib.ask_pincode)
    }
    // saves pincode and asks for phone number
    else if (last_q === userLib.ask_pincode) {
        if (msg_text.length === 6 && msg_text.match(/^[0-9]+$/) != null) {
            setUserAttribute({"pincode": msg_text},userName)
            bot.sendMessage(chatId, userLib.ask_phone)
            save_to_userReg_cache(userName, userLib.ask_phone)}
        else {
            bot.sendMessage(chatId, userLib.ask_pincode_clarify)
            save_to_userReg_cache(userName, userLib.ask_pincode)}}
    // saves phone number and completes registration process
    else if (last_q === userLib.ask_phone) {
        if (msg_text.length === 12 && msg_text.match(/^[0-9]+$/) != null) {
            setUserAttribute({"phoneNumber": msg_text},userName)
            bot.sendMessage(chatId, userLib.msg_successful_reg) }
        else {
            bot.sendMessage(chatId, userLib.ask_phone_clarify)
            save_to_userReg_cache(userName, userLib.ask_phone)}
    }
    // if there is no last question for that user, the cache must have been cleared (ttl is passed), so the user must restart
    else if (last_q === undefined) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            const dbo = db.db("enter db name");
            dbo.collection("users").deleteOne({"telegramUserId": userName}, function(err, res) {
                if (err) throw err;
                db.close();
            })
        })
        bot.sendMessage(chatId, userLib.msg_timeout)
    }
    })


// when a user sends a text starting with /start, the bot collects their telegram user name and chat id, as well as calling the checkUserNew function
 bot.onText(/\/start/, (msg) => {
    const userName = msg.from.username;
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hi there!');
    bot.sendMessage(chatId, 'Just a moment please! Processing...')
    checkUserNew(userName, chatId)
    })