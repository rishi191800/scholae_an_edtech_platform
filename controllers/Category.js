// importing category schema
const Category = require('../models/Category');
// importing course schema
const Course = require('../models/Course');


// creating a function named createCategory
exports.createCategory = async (req, res) => {
    try {
        // fetching name and description of category
        const {name, description} = req.body;
        // validatig data
        if(!name || !description){
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // create entry in db
        const categoryDetails = await Category.create({name, description});
        // if category unable to create
        if(!categoryDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to create category"
            });
        }
        // all things are done now return res 200
        return res.status(200).json({
            success: true,
            message: "Category created successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to create category",
            error: error.message
        })
    }
}


// creating a function named getAllCategories
exports.getAllCategories = async(req, res) => {
    try {
        // find all categories
        const allCategories = await Category.find({}, {name: true, description: true});
        // if unable to find all categories
        if(!allCategories){
            return res.status(403).json({
                success: false,
                message: "Unable to fetch all categories"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            data: allCategories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get all categories",
            error: error.message
        });
    }
}


// creating a function categoryPageDetails
exports.categoryPageDetails = async(req, res) => {
    try {
        // fetching category id
        const {categoryId} = req.body;
        // validating category id
        if(!categoryId){
            return res.status(401).json({
                success: false,
                message: "category id not found"
            });
        }
        // fetching courses for specific category id
        const categoryCourses = await Category.findById({_id: categoryId}).populate({path: "courses", populate: {path: "subSection"}}).populate('ratingAndReviews').populate({path: "studentsEnrolled", populate: {path: "additionalDetails"}}).exec();
        // validating courses
        if(!categoryCourses){
            return res.status(401).json({
                success : false,
                message :"courses not found based on category"
            });
        }
        // get courses for different category
        const differentCategory = await Category.find({_id: {$ne: categoryId}}).populate('courses').exec();
        // validating courses
        if(!differentCategory){
            return res.status(401).json({
                success: false,
                message: "Unable to fetched different courses"
            });
        }
        // get top selling courses
        // const topSellingCourse = await Course.aggregate([]) TODO
        // validating top selling courses
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "category page details fetched successfully",
            data: {}
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get catetory page details",
            error: error.message
        });
    }
}