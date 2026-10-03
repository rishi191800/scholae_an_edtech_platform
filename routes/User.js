// importing express to create router
const express = require('express');
// creating router
const router = express.Router();

// importing auth controllers
const {logIn, signUp, sendOTP, changePassword} = require('../controllers/Auth');

// importing resetPasswrod controllers
const {resetPasswordToken, resetPassword} = require('../controllers/ResetPassword');

// importing middleware
const {auth} = require('../middlewares/auth');


// -------------------------- routes for login, signup and authentication --------------------------
// route for login open routes
router.post('/login', logIn);
// route for signup open routes
router.post('/signup', signUp);
// route for sending otp open routes
router.post('/sendotp', sendOTP);
// route for changing password only for those who are logged in
router.post('/changePassword', auth, changePassword);


// -------------------------- routes for reset password --------------------------
// routes for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);
// routes for rest password
router.post('/reset-password', resetPassword);


// exprting router
module.exports = router;