// importing User schema 
const User = require('../models/User');
// import otp-generator for generating otp 
const otpGenerator = require('otp-generator');
// import otp schma
const OTP = require('../models/OTP');
// importing bcrypt for hashing password
const bcrypt = require('bcrypt');
// importing jwt for authentication and autherization
const jwt = require('jsonwebtoken');
// importing user profile schema
const Profile = require('../models/Profile');
// importing mailSender to send email
const mailSender = require('../utils/mailSender');

// Creating a controller for send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(404).json({
                success: false,
                message: "Please enter your email id"
            });
        }
        const userDetails = await User.findOne({ email: email });
        if (userDetails) {
            return res.status(401).json({
                success: false,
                message: "User already exits",
            });
        };

        // generate otp 
        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("otp generated ", otp);
        // checking otp is unique or not in database
        const otpData = await OTP.findOne({ otp: otp });
        if (otpData) {
            return res.status(401).json({
                success: false,
                message: "OTP is not unique please try again after new minutes"
            });
        }

        // creating otp data for saving in database only for 5 mins
        const otpPayload = { email, otp };
        // creating an entry in database
        const newOTPData = await OTP.create(otpPayload);
        console.log("Otp entry created in db ", newOTPData);
        if (!newOTPData) {
            return res.status(500).json({
                success: false,
                message: "Unable to save otp in database"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Otp generated and saved successfully in db",
            data: otp
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to send Otp error in send otp constroller",
            error: error.message
        })
    }
}


// Creating a controller for sign up
exports.signUp = async (req, res) => {
    try {
        // fetching all details of user
        const { firstName, lastName, email, accountType, password, confirmPassword, otp } = req.body;
        // if anyone of the required fields are not provied
        if (!firstName || !lastName || !email || !accountType || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }
        // if password and confirm password is not matching
        if ((password.length != confirmPassword.length) && (password !== confirmPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password is not matching"
            });
        }
        // checing if user already registered
        const userData = await User.findOne({ email: email });
        if (userData) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        // fetching otp from otp schema
        const otpData = await OTP.find({ email }).sort({createdAt: -1});
        console.log("Otp data is[0] ", otpData[0]);
        if (otpData == null || otpData[0].length == 0) {
            return res.status(400).json({
                success: false,
                message: "Otp expired please try again"
            });
        }

        // matching both user otp and db otp;
        if (otpData[0].otp != otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
        }

        // checking otp is expired or not
        // TODO: solve it later 
        // if(otpData[0].createdAt < Date.now()){
        //     return res.status(401).json({
        //         success: false,
        //         message: "Otp expired, please try again"
        //     });
        // }

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            return res.status(401).json({
                success: false,
                message: "Unable to hashed password"
            });
        }
        // creating user profile dummy data, user can update this is their setting
        const userProfile = await Profile.create({ gender: null, dateOfBirth: null, about: null, phoneNumber: null });
        if (!userProfile) {
            return res.status(400).json({
                success: false,
                message: "Unable to create user profile dummy data"
            });
        }
        // creating user image with firstName and lastName letter of image
        const image = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        // creating user entry in the database
        const newUserData = await User.create({ firstName, lastName, email, password: hashedPassword, accountType, additionalDetails: userProfile._id, image });
        if (!newUserData) {
            return res.status(400).json({
                success: false,
                message: "Unable to create user, please try again."
            });
        }
        // finaly return success res
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: newUserData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error unble to sign up",
            error: error.message
        })
    }
}


// Creating a controller for Log in
exports.logIn = async (req, res) => {
    try {
        // fetching user email and password form req.body
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        // fetching if user is registered or not
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }
        

        // if user registered than match the password
        const comparePassword = await bcrypt.compare(password, userData.password);
        if (comparePassword == false) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // create payload and passing in the token 
        const payload = { email: userData.email, id: userData._id, role: userData.accountType };
        // creating jwt token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // adding token to the userData note:- this token is only passing or addding in the userData not in the database
        userData.token = token;
        // removing password from the userData note:- removing password only form the object named userData not from database
        userData.password = undefined;

        // creating options for cookie
        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 100),
            httpOnly: true
        }
        // creating cookie and setting token to the cookie
        return res.cookie("token", token, options).status(200).json({
            success: true,
            message: "User logged in successfully",
            user: userData,
            token
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error while log in",
            error: error.message
        })
    }
}


// Creating a controller for change password 
exports.changePassword = async (req, res) => {
    try {
        // fetching data from req.body
        const {oldPassword, newPassword, confirmNewPassword, id} = req.body;
        if(!oldPassword || !newPassword || !confirmNewPassword || !id){
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        // compare newPassword and confirmNewPassword
        if(newPassword !== confirmNewPassword){
            return res.status(401).json({
                success: false,
                message: "Password is not matching"
            });
        }

        // fetchig user details from the db
        const userDetails = await User.findById({_id: id});
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found, please log in"
            });
        }

        // if user found than compare the password of the user form the db
        const passwordCompare = await bcrypt.compare(oldPassword, userDetails.password);
        if(passwordCompare == false){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // now hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        if(!hashedPassword){
            return res.status(400).json({
                success: false,
                message: "Some error occured while hashing the password",
            });
        }

        // now everything is done save the encrypted password in the db
        const finalUserData = await User.findByIdAndUpdate({_id: id}, {password: hashedPassword}, {new: true});
        if(!finalUserData){
            return res.status(400).json({
                success: false,
                message: "some error occured while updating the password"
            });
        }

        // send update password email
        const mail = mailSender(finalUserData.email, "Your password has been changed successfully", "Password changed successfully");
        if(!mail){
            res.status(401).json({
                success: false,
                message: "unable to send email of changing the password"
            });
        }

        // every thing is done now return success true response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            user: finalUserData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while changing the password",
            error: error.message
        });
    }
}
