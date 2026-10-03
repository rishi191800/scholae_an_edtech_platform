// importing mongoose for creating models 
const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
// importing email verification template from mail template
const emailVerificationTemplate = require('../mail/templates/emailVerificationTemplate');
// creating OTP Schema schema 
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 300
    },
});

// creating a pre middleware for sending email before creating an entry in database
async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(email, "Verification email from Scholae - An EdTech Platform", emailVerificationTemplate(otp));
        if(mailResponse){
            console.log("Email Send Successfully ", mailResponse);
        }

    } catch (error) {
        console.log(error.message);
        console.log("Unable to send verification email");
        throw error.message
    }
}

OTPSchema.pre("save", async function(){
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
});


// exporting otp schema
module.exports = mongoose.model("OTP", OTPSchema);