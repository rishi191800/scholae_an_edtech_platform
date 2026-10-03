// importing mongoose for creating models 
const mongoose = require('mongoose');
// creating category schema 
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }
    ],

});

// exporting category schema
module.exports = mongoose.model("Category", categorySchema);