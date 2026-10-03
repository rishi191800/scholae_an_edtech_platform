// importing mongoose for creating models 
const mongoose = require('mongoose');
// creating subSection schema 
const subSection = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    timeDuration: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
        trim: true
    }
});

// exporting subSection schema
module.exports = mongoose.model("SubSection", subSection);