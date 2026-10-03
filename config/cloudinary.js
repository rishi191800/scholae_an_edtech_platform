// importing cloudinary 
const cloudinary = require('cloudinary').v2;
// importing dotenv for fetching environemt variable
require('dotenv').config();

// exporting cloudinary connect function
exports.cloudinaryConnect = async() => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key : process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET
        });
    } catch (error) {
        console.log(error);
        console.log("Unable to connect cloudinary ", error.message);
    }
}