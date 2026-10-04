// importing jwt for authentication and authorization
const jwt = require('jsonwebtoken');
// importing dotenv for environment variable
require('dotenv').config();
// importing user schema for identificaton wheather user is admin or instructor or studnet
const User = require('../models/User');


// creating a middleware for auth 
exports.auth = async(req, res, next) => {
    try {
        // fetching token from cookie, body, or Authorization header
        const token = req.cookies?.token 
            || req.body?.token 
            || req.header("Authorization")?.replace("Bearer ", "");
        // if token is missing
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorised user"
            });
        }

        // verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            // inserting decode in the user
            req.user = decode;
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                    success: false, 
                    message: "Unable to decode or verify token",
                    error: error.message
                });
        }

        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}


// creating a middleware for isStudent
exports.isStudent = async (req, res, next) => {
    try {
        // fetching user details using payload which has already been passed in the req.body while log in
        if(req.user.role !== "Student"){
            return res.status(401).json({
                success: false,
                message: "This is a procted route for student only"
            })
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified, please try again",
            error: error.message
        })
    }
}

// creating a middleware for isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        // fetching user details using payload which has already been passed in the req.body while log in
        if(req.user.role !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is a procted route for instructor only"
            })
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified, please try again",
            error: error.message
        })
    }
}

// creating a middleware for isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        // fetching user details using payload which has already been passed in the req.body while log in
        if(req.user.role !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is a procted route for admin only"
            })
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified, please try again",
            error: error.message
        })
    }
}