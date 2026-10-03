// importing razorpay for payment
const Razorpay = require('razorpay');
// importing dot env for fetching environement variable
require('dotenv').config();

// creating an instance of the razorpay and export it
exports.instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });
