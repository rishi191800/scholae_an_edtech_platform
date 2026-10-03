// importing mongoose for creating models 
const mongoose = require('mongoose');
// creating rating and reviews schema 
const ratingAndReviews = new mongoose.Schema({
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        require: true,
        trim: true
    },
    course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Course",
            index: true,
        },
});

// exporting rating and reviews schema
module.exports = mongoose.model("RatingAndReviews", ratingAndReviews);