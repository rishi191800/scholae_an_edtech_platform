// importing section schema
const Section = require('../models/Section');
// importing subSection schema
const SubSection = require('../models/SubSection');
// importing course schema
const Course = require('../models/Course');


// creating function to create section
exports.createSection = async (req, res) => {
    try {
        // fetching section data
        const {sectionName, sectionDescription, courseId} = req.body;
        // validating data
        if(!sectionName || !sectionDescription || !courseId){
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // create section entry in database
        const sectionDetails = await Section.create({sectionName, sectionDescription});
        // validating sectionDetails
        if(!sectionDetails){
            return res.status(401).json({
                success: false,
                messge: "Unable to create section"
            });
        }
        // now add section id in course schema
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseId}, {$push: {courseContent: sectionDetails._id}}, {new: true}).populate({path: "courseContent", populate: {path: "subSection"}}).exec();
        // validating updateCourseDetails
        if(!updatedCourseDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to add section in course courseContent section"
            });
        }
        // all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data: {updatedCourseDetails, sectionDetails}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to create section",
            error: error.message
        })
    }
}


// creating function to update section
exports.updateSection = async(req, res) => {
    try {
        // fetching section data to update it
        const {sectionName, sectionDescription, sectionId} = req.body;
        // validating data
        if(!sectionName || !sectionDescription || !sectionId){
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }
        // fetching section details and update in database
        const updatedSectionDetails = await Section.findByIdAndUpdate({_id: sectionId}, {sectionName, sectionDescription}, {new: true});
        // validating updatedSectionDetails
        if(!updatedSectionDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to update section"
            });
        }
        // all things are done return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: updatedSectionDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to update section",
            error: error.message
        })
    }
}


// creating function to delte section
exports.deleteSection = async(req, res) => {
    try {
        // fetching sectionId
        const {sectionId, courseId} = req.body; // does sectionId can tbe fetched from req.body or req.params verify it 
        // validating section id
        if(!sectionId || !courseId){
            return res.status(401).json({
                success: false,
                message: "section is not available"
            });
        }
        // fetching section details so that all subsectoin can be removed from the database
        const sectionDetails = await Section.findById({_id: sectionId}).populate('subSection').exec();
        // validating sectiondetails
        if(!sectionDetails){
            return res.status(401).json({
                success: false,
                message: "Section not found"
            });
        }
        // finding the length of the subsection for traversing through for loop
        const subSectionLength = sectionDetails.subSection.length;
        // is it good or bad or even does it need this
        for(let index = 0; index < subSectionLength; index++){
            // fetching subsection and delete them
            const subSectionDetails = await SubSection.findByIdAndDelete({_id: sectionDetails.subSection[index]});
            // validating subsection details
            if(!subSectionDetails){
                return res.status(401).json({
                    success: false,
                    message: "Unable to delete sub section"
                });
            }
        }
        // delete section id form course but i think it doesn't need to do but..... let's go for it
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseId}, {$pop: {courseContent: sectionId}}, {new: true}).populate('courseContent').exec();
        // validating updatedCoruseDetails
        if(!updatedCourseDetails){
            return res.status(401).json({
                success: false,
                message: "Unable to remove section from the course"
            });
        }
        // now final thing to delete the section 
        const updatedSectionDetails = await Section.findByIdAndDelete({_id: sectionId});
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: {updatedCourseDetails, updatedSectionDetails}
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to delete section",
            error: error.message
        })
    }
} 