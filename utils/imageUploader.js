// importing cloudinary for uploading image
const cloudinary = require('cloudinary').v2;

// creating function to upload image to cloudinary 
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        // creating options 
        const options = {folder};
        // if height is passed in the parameter than include it in the options
        if(height){
            options.height = height;
        }
        // if quality is passed in the parameter than include in the options
        if(quality){
            options.quality = quality;
        }
        // VVI - set resouce type = auto so that cloudinary can auto detect the file type
        options.resource_type = "auto";
        // now return the cloudinary.uploader.upload
        return await cloudinary.uploader.upload(file.tempFilePath, options)
    } catch (error) {
        console.log(error);
        console.log("Unable to upload image", error.message)
    }
}