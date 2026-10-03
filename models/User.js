// importing mongoose for creating models schema
const mongoose = require('mongoose');
// creating a user schema 
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
        default: "Student"
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    image: {
        type: String,
        required: true,
        trim: true
    },
    token: {
        type: String,
        trim: true,
    },
    resetPasswordExpires: {
        type: Date,
        expires: 300
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress"
        }
    ]
});

// exporting models
module.exports = mongoose.model('User', userSchema);