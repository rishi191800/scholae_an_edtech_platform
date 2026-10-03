// importing express for creating routes
const express = require('express');

// creating router
const router = express.Router();

// importing course controllers
const {createCourse, getAllCourses, editCourse, getCourseDetails, deleteCourse} = require('../controllers/Course');

// importing category controllers
const {createCategory, getAllCategories, categoryPageDetails} = require('../controllers/Category');

// importing section controllers
const {createSection, updateSection, deleteSection} = require('../controllers/Section');

// importing subSection controllers
const {createSubSection, updateSubSection, deleteSubSection} = require('../controllers/SubSection');

// importing rating controllers
const {createRating, getAverageRating, getAllRating} = require('../controllers/RatingAndReviews');

// imorting middleware for authorization
const {auth, isStudent, isInstructor, isAdmin} = require('../middlewares/auth');


// -------------------------- courses routes --------------------------
// create course only can be created by instructor
router.post('/createCourse', auth, isInstructor, createCourse);
// edit course only can be edited by instructor
router.post('/editCourse', auth, isInstructor, editCourse);
// add section only can be added by instructor
router.post('/addSection', auth, isInstructor, createSection);
// update section only can be updated by instructor
router.post('/updateSection', auth, isInstructor, updateSection);
// delete section only can be deleted by instructor
router.post('/deleteSection', auth, isInstructor, deleteSection);
// create sub section only can be created by instructor
router.post('/createSubSection', auth, isInstructor, createSubSection);
// update sub section only can be updated by instructor
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
// delete sub section only can be deleted by instructor
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);
// get instructor course details only when user is an instructor
// router.get('/getInstructorCourse', auth, isInstructor, getInstructorCourse); 
// get all courses
router.get('/getAllCourses', getAllCourses);
// get course details
router.post('/getCourseDetails', getCourseDetails);
// Get full course details for a Specific Courses
// router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// To Update Course Progress
// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// To get Course Progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)
// delete course only can be deleted by instructor
router.delete('/deleteCourse', auth, isInstructor, deleteCourse);

// -------------------------- category routes (Only for admin) --------------------------
// create category only can be created by admin
router.post('/createCategory', auth, isAdmin, createCategory);
// get all categories open route (accessible for all)
router.get('/getAllCategories', getAllCategories);
// get category page details open route (accessible for all)
router.post('/getCategoryPageDetails', categoryPageDetails);

// -------------------------- rating and reviews routes --------------------------
// create rating only can be created by student
router.post('/createRating', auth, isStudent, createRating);
// get average rating open route (accessible for all)
router.get('/getAverageRating', getAverageRating);
// get reviews open route (accessible for all)
router.get('/getReviews', getAllRating);

// exporting router
module.exports = router;