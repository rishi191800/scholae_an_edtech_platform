// importing cloudinary for uploading video
const cloudinary = require('cloudinary').v2;

// creating function to upload video 
exports.uploadVideoToCloudinary = async (file, folder, hegiht, quality) => {
    try {
        // creting options
        const options = {file, folder};
        // if height is passed in the paramerter than include it in the options
        if(hegiht){
            options.hegiht = hegiht;
        }
        // if quality is passed in the parameter than include it in the options
        if(quality){
            options.quality = quality;
        }
        // VVI include resource_type auto in the options for detecting video type for cloudinary
        options.resource_type = "auto";
        // now return the video to the server
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    } catch (error) {
        console.log(error);
        console.log("Error while uploading video ", error.message);
    }
}