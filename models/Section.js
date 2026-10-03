// importing mongoose for creating models 
const mongoose = require('mongoose');
// creating section schema 
const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
        trim: true
    },
    sectionDescription: {
        type: String,
        required: true,
        trim: true
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection"
        }
    ],

});

// exporting section schema
module.exports = mongoose.model("Section", sectionSchema);