// importing razorpay instance already created in congig
const { instance } = require('../config/razorpay');
// importing course schema
const Course = require('../models/Course');
// importing user schema
const User = require('../models/User');
// importing mail sender
const mailSender = require('../utils/mailSender');
// importing course enrollment mail template
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
// importing mongoose to convert user id from string to object
const { default: mongoose } = require('mongoose');


// creating a function to catpuring the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // fetching courseId and userId
        const { courseId } = req.body;
        const { id } = req.user;
        // validating courseId and user id
        if (!courseId || !id) {
            return res.status(401).json({
                success: false,
                message: "course id or user id not found"
            });
        }
        // fetching course is valid or not
        const courseDetails = await Course.findById({ _id: courseId });
        // validating courseDetails
        if (!courseDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid course or course not found"
            });
        }
        // if the user id is in string then convert it into object type
        const userId = new mongoose.Types.ObjectId(id);
        // check if the user has already purchased the course or not
        const alreadyPurchased = await courseDetails.studentsEnrolled.includes(userId);
        // validating already purchased
        if (alreadyPurchased) {
            return res.status(400).json({
                success: false,
                message: "User already have purchased the coruse"
            });
        }
        // now create order
        const amount = courseDetails.price * 100;
        const currency = "INR";
        const notes = { id, courseId };
        const options = {
            amount,
            currency,
            reciept: Math.random(Date.now()).toString(),
            notes
        }
        // proceed to payment
        try {
            const paymentDetails = await instance.orders.create(options);
            console.log("Payment details are ", paymentDetails);
        } catch (error) {
            console.log(error);
            return res.status(403).json({
                success: false,
                message: "Payment failure",
                error: error.message
            });
        }
        // all things are done return res 200
        return res.status(200).json({
            success: true, 
            message: "Payment captured",
            data: {paymentDetails, courseDetails, orderId: paymentDetails.id}
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error Unable to capture payments",
            error: error.message
        })
    }
}


// creating a funciton to verify signature so that the payemnt was done by actual student and enrolled into the courses
exports.verifySignature = async(req, res) => {
    try {
        // fetching webhook secret from environement variable
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        // fetching hashed signature from the req.headers which is set by razorpay during payment captured
        const signature = req.headers['x-razorpay-signature']
        // validating webhook secret and signature 
        if(!webhookSecret || !signature){
            return res.status(401).json({
                success: false,
                message: "signature missing"
            });
        }
        // now need to compare webhook secret and signature but signature is in hashed form so it cannot be convert back to the key so what i think, hashed the webhooksecret and than compare it with signature 
        
        // trying to hashed the webhook secret
        const hashedWebHook = await crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
        // validating hashedWebHook
        if(!hashedWebHook){
            return res.status(401).json({
                success: false,
                message: "unable to hashed key"
            });
        }
        // now match the both key
        if(hashedWebHook !== signature){
            return res.status(401).json({
                success: false,
                message: "Signature is not matching"
            });
        }
        // fetching userid and course id from razorypay notes which i have already passed during payment capture 
        const {courseId, id} = req.body.payload.payment.entity.notes;
        // validating data
        if(!courseId || !id){
            return res.status(401).json({
                success: false,
                message: "coruseId or user id not found"
            });
        }
        // fetch the course and enroll the student in the course
        const courseDetails = await Course.findByIdAndUpdate({_id: courseId}, {$push: {studentsEnrolled: id}}, {new: true});
        // validating courseDetails
        if(!courseDetails){
            return res.status(401).json({
                success: false,
                message: "Student unable to enroll into the courses"
            });
        }
        // now add the courses into the student courses section
        const updatedUserDetails = await User.findByIdAndUpdate({_id: id}, {$push: {courses: courseDetails._id}}, {new: true});
        // validating data
        if(!updatedUserDetails){
            return res.status(401).json({
                success: false,
                message: "courses cannot be added in the user details"
            });
        }
        // now send enrolled mail to the student
        const mailResponse = await mailSender(updatedUserDetails.email, "You have successfully purchased the course", courseEnrollmentEmail);
        // validating mail response
        if(!mailResponse){
            return res.status(401).json({
                success: false,
                message: "Unable to send course enrollment email"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "You have successfully purchased the coruse and enrolled the course",
            dat: {courseDetails, updatedUserDetails, paymentDetails}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error Unable to capture payments",
            error: error.message
        })
    }
}