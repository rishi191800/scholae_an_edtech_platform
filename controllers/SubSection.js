// importing subSection schema
const SubSection = require('../models/SubSection');
// importing section schema
const Section = require('../models/Section');
// importing upload video to cloudinary for uploading video 
const { uploadVideoToCloudinary } = require('../utils/videoUploader');
// importing dotenv for fetching environemnt variable
require('dotenv').config();


// creating function to create subSection
exports.createSubSection = async(req, res) => {
    try {
        // fetching sub section data
        const {title, description, timeDuration, sectionId} = req.body;
        // fetching video from the req.files.video
        const {video} = req.files;
        // validating data
        if(!title || !description || !timeDuration || !video || !sectionId){
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // uploading video to the cloudinary
        const uploadedVideo = await uploadVideoToCloudinary(video, process.env.CLOUDINARY_FOLDER);
        console.log("upload video details ", uploadedVideo);
        // validating uploaded video
        if(!uploadedVideo){
            return res.status(401).json({
                success: false,
                message: "Unable to upload video"
            });
        }
        // create subsection entry in the database
        const subSectionDetails = await SubSection.create({title, description, timeDuration, videoUrl: uploadedVideo.secure_url});
        // validating subsecton details
        if(!subSectionDetails){
            return res.status(401).json({
                success: false, 
                message: "Unable to upload video"
            });
        }
        // now update section along with the subsecton entry in the section database
        const updatedSectionDetails = await Section.findByIdAndUpdate({_id: sectionId}, {$push: {subSection: subSectionDetails._id}}, {new: true}).populate('subSection').exec();
        // validating updatedSectionDetails
        if(!updatedSectionDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to update subsection id in the section database"
            });
        }
        // all things are done now return res 200
        return res.status(200).json({
            success: true, 
            message: "Sub section created successfully",
            data: {subSectionDetails, updatedSectionDetails}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to create sub section",
            error : error.message
        });
    }
}


// creating function to update subSection
exports.updateSubSection = async(req, res) => {
    try {
        // fetching sub section data
        const {title, description, timeDuration, subSectionId} = req.body;
        // fetching video from the req.files.video
        const {video} = req.body;
        // validating data
        if(!title || !description || !timeDuration || !video || !subSectionId){
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // uploading video to the cloudinary
        const uploadedVideo = await uploadVideoToCloudinary(video, process.env.CLOUDINARY_FOLDER);
        console.log("upload video details ", uploadedVideo);
        // validating uploaded video
        if(!uploadedVideo){
            return res.status(401).json({
                success: false,
                message: "Unable to upload video"
            });
        }
        // update subsection entry in the database
        const subSectionDetails = await SubSection.findByIdAndUpdate({_id: subSectionId}, {title, description, timeDuration, videoUrl: uploadedVideo.secure_url}, {new: true});
        // validating subsecton details
        if(!subSectionDetails){
            return res.status(401).json({
                success: false, 
                message: "Unable to upload video"
            });
        }
        // all things are done now return res 200
        return res.status(200).json({
            success: true, 
            message: "Sub section updated successfully",
            data: {subSectionDetails}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to update sub section",
            error : error.message
        });
    }
}


// creating function to delete subSection
exports.deleteSubSection = async(rea, res) => {
    try {
        // fetching subSection id and sectionId
        const {subSectionId, sectionId} = req.body;
        // validating data
        if(!subSectionId || !sectionId){
            return res.status(401).json({
                success: false,
                message: "sub section id or section id is not available"
            });
        }
        // do i need this ? think of that pop subsection id from the section schema
        const updatedSectionDetails = await Section.findByIdAndUpdate({_id: sectionId}, {$pop: {subSection: subSectionId}}, {new: true}).populate('subSection').exec();
        // validating updatedSection details
        if(!updatedSectionDetails){
            return res.status(401).json({
                success: false, 
                message: "Unable to delete sub section id from section details"
            });
        }
        // delete sub section from the schema
        await SubSection.findByIdAndDelete({_id: subSectionId});
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Sub section deleted successfully",
            data: updatedSectionDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to delete sub section",
            error : error.message
        });
    }
}