// importing dotenv for fetching environment variable
require('dotenv').config();
// importing course schema
const Course = require('../models/Course');
// importing Section schema
const Section = require('../models/Section');
// importing subSeciton schema
const SubSection = require('../models/SubSection');
// importing user schema
const User = require('../models/User');
// importing category schema
const Category = require('../models/Category');
// importing upload image to cloudinary 
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const { response } = require('express');
const RatingAndReviews = require('../models/RatingAndReviews');


// creating function to create course
exports.createCourse = async (req, res) => {
    try {
        // fetching course data
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;
        // fetching user id 
        const { id } = req.user;
        // fetching coruse thumbnailImage
        const { thumbnailImage } = req.files;
        // validating data
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnailImage || !category || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        // fetching instructor details so that in course seciton i can add instructor id
        const instructorDetails = await User.findById({ _id: id });
        // validating instructor details and the account belongs to instructor or not
        if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
            return response.status(401).json({
                success: false,
                message: "Instructor not found"
            });
        }
        // fetching category details, note - the actual category which is recieved in the body is id not actual category value for further details see course schema.
        const categoryDetails = await Category.findById({ _id: category });
        // validating categorydetails
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid category or category not found"
            });
        }
        // upload thumbnail image to cloudinary
        const uploadDetails = await uploadImageToCloudinary(thumbnailImage, process.env.CLOUDINARY_FOLDER);
        console.log("upload details are ", uploadDetails);
        // validating uploadDetails
        if (!uploadDetails) {
            return res.status(400).json({
                success: false,
                message: "Unable to upload image"
            });
        }
        // creating entry of course in the database
        const courseDetails = await Course.create({ courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price, thumbnail: uploadDetails.secure_url, category: categoryDetails._id })
        // validating courseDetails
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Unable to create course"
            });
        }
        // add course to the instructor account course section
        const updatedInstructorDetails = await User.findByIdAndUpdate({ _id: id }, { $push: { courses: courseDetails._id } }, { new: true }).populate({path: "courses", populate: {path: "courseContent", populate: {path: "subSection"}}}).exec();
        // validating updatedInstructor details
        if (!updatedInstructorDetails) {
            return res.status(401).json({
                success: false,
                message: "Unable to add course in instructor course section"
            });
        }
        // update category schema (add course in the category schema)
        const updatedCategoryDetails = await Category.findByIdAndUpdate({ _id: category }, { $push: { courses: courseDetails._id } }, { new: true }).populate('courses').exec();
        // validating updatedCategory details
        if (!updatedCategoryDetails) {
            return res.status(401).json({
                success: false,
                message: "Unable to course in category courses section"
            });
        }
        // all things are done now return res 200
        return res.status(200).json({
            success: true,
            message: "Courese created successfully",
            data: { updatedInstructorDetails, courseDetails, updatedCategoryDetails }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to create coruse",
            error: error.message
        })
    }
}


// creating a function to edit course 
exports.editCourse = async (req, res) => {
    try {
        // fetching course data
        const { courseName, courseDescription, whatYouWillLearn, price, category, courseId } = req.body;
        // fetching user id 
        const { id } = req.user;
        // fetching coruse thumbnailImage
        const { thumbnailImage } = req.files;
        // validating data
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnailImage || !category || !id || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        // fetching instructor details so that in course seciton i can add instructor id
        const instructorDetails = await User.findById({ _id: id });
        // validating instructor details and the account belongs to instructor or not
        if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
            return response.status(401).json({
                success: false,
                message: "Instructor not found"
            });
        }
        // fetching category details, note - the actual category which is recieved in the body is id not actual category value for further details see course schema.
        const categoryDetails = await Category.findById({ _id: category });
        // validating categorydetails
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid category or category not found"
            });
        }
        // upload thumbnail image to cloudinary
        const uploadDetails = await uploadImageToCloudinary(thumbnailImage, process.env.CLOUDINARY_FOLDER);
        console.log("upload details are ", uploadDetails);
        // validating uploadDetails
        if (!uploadDetails) {
            return res.status(400).json({
                success: false,
                message: "Unable to upload image"
            });
        }
        // updating entry of course in the database
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId }, { courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price, thumbnail: uploadDetails.secure_url, category: categoryDetails._id })
        // validating updatedCourseDetails
        if (!updatedCourseDetails) {
            return res.status(400).json({
                success: false,
                message: "Unable to update course"
            });
        }
        // all things are done now return res 200
        return res.status(200).json({
            success: true,
            message: "Courese updated successfully",
            data: { updatedCourseDetails }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error, Unable to update course",
            error: error.message
        });
    }
}


// creating function to get all courses
exports.getAllCourses = async (req, res) => {
    try {
        // fetching all courses from the database
        const allCoursesDetails = await Course.find({}, { courseName: true, courseDescription: true, instructor: true, thumbnail: true, price: true, ratingAndReviews: true, studentsEnrolled: true }).populate('instructor').exec();
        // validating all courses details
        if (!allCoursesDetails) {
            return res.status(401).json({
                success: false,
                message: "Unable to fetched courses"
            });
        }
        // return res 200
        return res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            data: allCoursesDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get all courses",
            error: error.message
        });
    }
}


// creating a function to getCourseDetials 
exports.getCourseDetails = async (req, res) => {
    try {
        // fetching courseId from req.body
        const { courseId } = req.body;
        // validating course id
        if (!courseId) {
            return res.status(401).json({
                success: false,
                message: "Course id not available"
            });
        }
        // fetching course Details
        const courseDetails = await Course.findById({ _id: courseId }).populate({ path: "instructor", populate: { path: "addtionalDetails" } }).populate("category").populate('ratingAndReviews').populate({ path: "courseContent", populage: { path: "subSection" } }).exec();
        // validating courseDetails
        if (!courseDetails) {
            return res.status(401).json({
                succcess: false,
                message: "Course not found"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Course fetched successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get all courses",
            error: error.message
        });
    }
}


// create a function to delete course
exports.deleteCourse = async (req, res) => {
    try {
        // fetching courseId
        const { courseId } = req.body;
        // validating course id
        if (!courseId) {
            return res.status(401).json({
                success: false,
                message: "Course id not found"
            });
        }
        // fetching coruseDetails
        const courseDetails = await Course.findById({ _id: courseId }).populate({ path: "courseContent", populate: { path: "subSection" } }).populate("ratingAndReviews").populate('studentsEnrolled').exec();
        // validating courseDetails
        if (!courseDetails) {
            return res.status(401).json({
                success: false,
                message: "Course not found"
            });
        }
        // finding all section length of the course
        const courseContentLength = courseDetails.courseContent.length;
        // fetching sectionDetails using loop 
        for (let index = 0; index < courseContentLength; index++) {
            const sectionDetails =  await Section.findById({ _id: courseDetails.courseContent[index]._id });
            // validating sectionDetails
            if (!sectionDetails) {
                return res.status(401).json({
                    success: false,
                    message: "Unable to fetch section details"
                });
            }
            // finding subSection length
            const subSectionLenght = sectionDetails.subSection.length;
            for(let i = 0; i < subSectionLenght; i++){
                // fetching subsection and delete sub section
                await SubSection.findByIdAndDelete({_id: sectionDetails.subSection[i]._id});
            }
            // now delete section also
            await Section.findByIdAndDelete({_id: sectionDetails._id});
        }
        // finding studentEnrolled length
        const studentsEnrolledLength = courseDetails.studentsEnrolled.length;
        // now unenroll all the student from the course
        for(let index = 0; index < studentsEnrolledLength; index++){
            const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseDetails[index]._id}, {$pop: {studentsEnrolled: courseDetails.studentsEnrolled[index]}}, {new: true});
            // validating updatedCoruseDetails
            if(!updatedCourseDetails){
                return res.status(401).json({
                    success: false,
                    message : "Unable to unenroll students fromn the course"
                });
            }
        }
        // finding rating and reviews length
        const ratingAndReviewsLegnth = courseDetails.ratingAndReviews.legnth;
        // deleting rating and reviews
        for(let index = 0; index < ratingAndReviewsLegnth; index++){
            await RatingAndReviews.findByIdAndDelete({_id: courseDetails.ratingAndReviews[index]._id});
        }
        // now finaly delete course
        const deletedCourseDetails = await Course.findByIdAndDelete({_id: courseId});
        // validating deletedCourseDetails
        // TODO: pending compele while tesing 

        //now finaly return res 200
        return res.status(200).json({
            success: false,
            message: "Course delete successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to delete course",
            error: error.message
        });
    }
}