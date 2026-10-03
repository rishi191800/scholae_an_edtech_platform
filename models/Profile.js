// importing mongoose for creating models 
const mongoose = require('mongoose');
// creating profile schema 
const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    dateOfBirth: {
        type: String,
        trim: true
    },
    about: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: Number,
        trim: true,
    },
    countryCode: {
        type: String,
        require: true,
        trim: true,
        default : "+91"
    }
});

// exporting profile schema
module.exports = mongoose.model("Profile", profileSchema);