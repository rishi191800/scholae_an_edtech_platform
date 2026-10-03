// importing mongoose for create a function to connect the databse to the server
const mongoose = require('mongoose');
// import dotenv config for fetching environment variable 
require('dotenv').config();

// fetching databse url form environment variable
const databaseUrl = process.env.DATABASE_URL;
const connectToDB = () => {
    mongoose.connect(databaseUrl).then(() => {
        console.log("Database connected successfully");
    }).catch((error) => {
        console.log(error.message);
        console.log("Unable to connect to database");
        process.exit(1);
    })
}

module.exports = connectToDB;