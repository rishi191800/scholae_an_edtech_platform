// importing user schema
const User = require('../models/User');
// importing mailsender for sending email on email so that user can change password
const mailSender = require('../utils/mailSender');
// importing bcrypt for password hashing
const bcrypt = require('bcrypt');
// creating a controller for reseting password using token by sending email
exports.resetPasswordToken = async (req, res) => {
    try {
        // fetching email form req.body
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Please enter your email id"
            });
        }
        // checking if user exits or not using this email
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(403).json({
                success: false,
                message: "user doesn't exits"
            });
        }

        // creating unique token for reseting password using crypto (buit-in node module)
        const token = crypto.randomUUID();
        // now update userDetails and add token and resetPasswordExpires in database
        const updatedUserData = await User.findOneAndUpdate({ email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 }, { new: true });
        // if updatedUserData not found
        if (!updatedUserData) {
            return res.status(400).json({
                success: false,
                message: "Unable to update user in database"
            });
        }
        // now generate link to reset password
        const resetPasswordLink = `http://localhost:3000/update-password/${token}`;
        // send mail along with resetPasswordLink
        await mailSender(updatedUserData.email, "Reset Your Password through the given link", `Reset Password Link: ${resetPasswordLink}`);
        // all things are done now return response 200
        return res.status(200).json({
            success: true,
            message: "Reset password link has been send to your registered email id",
            data: resetPasswordLink
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to send reset password token",
            error: error.message
        })
    }
}

// creating a controller for reset password in database
exports.resetPassword = async (req, res) => {
    try {
        // fetching id, password and confirm password form req.body
        const { password, confirmPassword, token } = req.body;
        if (!token || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "All fields are required",
            })
        }
        // matching password and confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "password is not matching"
            });
        }
        // hashing password
        const passwordHashed = await bcrypt.hash(password, 10);
        // if password is unable to hash
        if (!passwordHashed) {
            return res.status(403).json({
                success: false,
                message: "Unable to encrypt the password"
            });
        }
        // fetching user details and update password in database using token
        const updatedUserData = await User.findOneAndUpdate({ token }, { password: passwordHashed }, { new: true });
        // if user data unable to update
        if (!updatedUserData) {
            return res.status(401).json({
                success: false,
                message: "Unable to update password or token has been expired"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Password has been updated successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to reset password",
            error: error.message
        })
    }
}