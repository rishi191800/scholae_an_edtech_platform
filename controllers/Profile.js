// importing profile schema
const Profile = require('../models/Profile');
// importing user schema
const User = require('../models/User');
// importing course schema
const Course = require('../models/Course');
// importing upload image to cloudinary for uploading profile picture
const { uploadImageToCloudinary } = require('../utils/imageUploader');
// importing dotenv config for accessing environement variable
require('dotenv').config();


// creating a function to update profile schema
exports.updateProfile = async (req, res) => {
    try {
        // fetching profile data
        const { gender, dateOfBirth = "", about = "", phoneNumber, countryCode } = req.body;
        // fetching user id
        const { id } = req.user;
        // validating data
        if (!gender || !phoneNumber || !id) {
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // first fetching user dtails so that profile details can be found
        const userDetails = await User.findById({ _id: id }).populate('additionalDetails').exec();
        // validating user dtails
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        // fetching profile details and update it
        const updatedProfileDetails = await Profile.findByIdAndUpdate({ _id: userDetails.additionalDetails._id }, { gender, dateOfBirth, about, phoneNumber, countryCode }, { new: true });
        // validating updatedProfielDetails
        if (!updatedProfileDetails) {
            return res.status(401).json({
                success: false,
                message: "Unable to update profile"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: { userDetails, updatedProfileDetails }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to update profile",
            error: error.message
        });
    }
}


// creating a function to delete user profile
exports.deleteProfile = async (req, res) => {
    try {
        // fetching user id
        const { id } = req.user;
        // validating user id
        if (!id) {
            return res.status(401).json({
                success: false,
                message: "user id not found"
            });
        }
        // fetching user details for delete profile, courses and courseProgress first after that delete user form the schema note- this is my point of view
        const userDetails = await User.findById({ _id: id }).populate('additonalDetails').exec().populate('courses').exec().populate('courseProgress').exec();
        // validating userDetails
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // now delete user Profile (additonal Details)
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails._id });
        // now find the length of the courses if available
        const courseLength = userDetails.courses.length;
        // traversing the array of the courses
        for (let index = 0; index < courseLength; index++) {
            // fetching courses note - first unenrolled the student from the course section
            const courseDetails = await Course.findByIdAndUpdate({ _id: userDetails.courses[index] }, { $pop: { studentsEnrolled: userDetails._id } }, { new: true }).populate('courses').exec().populate('studentsEnrolled').exec();
            // validating courseDetails
            if (!courseDetails) {
                return res.status(401).json({
                    success: false,
                    message: "Unable to delete user form the enrolled courses"
                });
            }
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to delete user profile",
            error: error.message
        });
    }
}


// creating a function to update profile picture
exports.updateProfilePicture = async (req, res) => {
    try {
        // fetching user id
        const { id } = req.user;
        // fetching image file from req.files.profilePicture
        const profilePicture = req.files.profilePicture;
        console.log(profilePicture);
        // validating data
        if (!profilePicture || !id) {
            return res.status(401).json({
                success: false,
                message: "all fields are required",
                data: {profilePicture, id}
            });
        }
        // uploading profile picture to cloudinary
        const uploadedProfilePicture = await uploadImageToCloudinary(profilePicture, process.env.CLOUDINARY_FOLDER, 1000, 1000);
        // validating upload profile picture
        if (!uploadedProfilePicture) {
            return res.status(401).json({
                success: false,
                message: "Unable to upload profile picture"
            });
        }
        // updating user details 
        const updatedUserDetails = await User.findByIdAndUpdate({ _id: id }, { image: uploadedProfilePicture.secure_url }, { new: true });
        // validating updated user details
        if (!updatedUserDetails) {
            return res.status(400).json({
                success: false,
                message: "User can't be updated right now"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: updatedUserDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "internal server error, Unable to update profile picture",
            error: error.message
        });
    }
}


// creating funciton to get all user details 
exports.getAllUserDetials = async (req, res) => {
    try {
        // fetching user id 
        const { id } = req.user;
        // validating user id
        if (!id) {
            return res.status(401).json({
                success: false,
                message: "user id not found"
            });
        }
        // fetching user details
        const userDetails = await User.findById({ _id: id }).populate({path: "additionalDetails"}).populate({path: "courses", populate: {path: "courseContent", populate: {path: "subSection"}}}).exec();
        // validating user details
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: userDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get all user details",
            error: error.message
        });
    }
}