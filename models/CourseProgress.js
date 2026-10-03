// importing mongoose for creating schema
const mongoose = require('mongoose');
// creating courseProgress schema
const courseProgress = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection"
        }
    ]
});

// exporting models
module.exports = mongoose.model("CourseProgress", courseProgress);