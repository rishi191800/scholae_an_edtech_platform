// importing rating and reviews schema
const RatingAndReviews = require('../models/RatingAndReviews');
// importing user schema
const User = require('../models/User');
// importing course schema
const Course = require('../models/Course');
// importing mongoose for converting string courseId to object 
const mongoose = require('mongoose');



// creating a function create rating 
exports.createRating = async(req, res) => {
    try {
        // fetching rating and reviews data
        const {rating, review, courseId} = req.body;
        // fetching user id
        const {id} = req.user;
        // validating data
        if(!rating || !review || !courseId || !id){
            return res.status(401).json({
                success: false,
                message: "All fields are rerquired"
            });
        }
        // fetching if the user is enrolled in the course or not
        const userEnrolled = await Course.findById({_id: courseId}, {studentsEnrolled: {$elemMatch: {$eq: id}}});
        // validating userEnrolled
        if(!userEnrolled){
            return res.status(401).json({
                success: false,
                message: "User is not enrolled in the course"
            });
        }
        // fetching if user has already reviewd or not
        const reviewDetails = await RatingAndReviews.findOne({user: id, course: courseId});
        // validating reviewDetials
        if(reviewDetails){
            return res.status(400).json({
                success: false,
                message: "user has already reviews the course"
            });
        }
        // create reviews
        const ratingReview = await RatingAndReviews.create({rating, review, user: id, course: courseId});
        // validating rating review
        if(!ratingReview){
            return res.status(401).json({
                success: false,
                message: "Unable to create rating and review"
            });
        }
        // add rating and review in the course details
        const updatedCourseDetails = Course.findByIdAndUpdate({_id: courseId}, {$push: {ratingAndReviews: ratingReview._id}}, {new: true});
        // validating data
        if(!updatedCourseDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to update rating and reviews in course schema"
            });
        }
        // now all things are done return res
        return res.status(200).json({
            success: true,
            message: "Rating and reviews created successfully",
            data: {ratingReview, updatedCourseDetails}
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to create rating",
            error: error.message
        });
    }
}


// creating a function to get average rating 
exports.getAverageRating = async(req, res) => {
    try {
        // fetching course id
        const {courseId} = req.body;
        // validating course id
        if(!courseId){
            return res.status(401).json({
                success: false,
                message: "Course id not found"
            });
        }
        // fetching average rating
        const averageRating = await RatingAndReviews.aggregate([{$match: {course: new mongoose.Types.ObjectId(courseId)}}, {$group: {id: null, averageRating: {$avg: "$rating"}}}]);
        // validating averageRating
        if(!averageRating){
            return res.status(401).json({
                success: false,
                message: "Average rating not found",
                data: averageRating
            });
        }
        // now finaly return res 200
        return res.status(200).json({
            success: true,
            message: "Average rating found successfully",
            data: averageRating
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get average rating",
            error: error.message
        });
    }
}


// creating a function to get all rating and reveiws
exports.getAllRating = async(req, res) => {
    try {
        // fetching all rating and reviews 
        const allRatingAndReviews = await RatingAndReviews.find({}).sort({rating: "desc"}).populate({path: "user", select: "firstName lastName email image",}).populate({path: "course", select: "courseName"}).exec();
        // validating allRatingAndReviews
        if(!allRatingAndReviews){
            return res.status(401).json({
                success: false,
                message: "All Rating and Reviews not found"
            });
        }
        // now return res 200
        return res.status(200).json({
            success : true,
            message: "All rating and reveiws fetched successfully",
            data: allRatingAndReviews
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get all rating",
            error: error.message
        });
    }
}