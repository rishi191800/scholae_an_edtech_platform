// importing mailSender for sending email
const mailSender = require("../../../../../Downloads/studynotion-edtech-project-main/server/utils/mailSender");
// importing contact us email template
const {contactUsEmail} = require('../mail/templates/contactFormEmail');


// creating function contactUs
exports.contactUs = async(req, res) => {
    try {
        // fetching contact us data
        const {firstName, lastName, email, countryCode, phoneNumber, message} = req.body;
        // validating data
        if(!firstName || !lastName || !email || !countryCode || !phoneNumber || !message){
            return res.status(401).json({
                success: false,
                message: "All feilds are required"
            });
        }
        // sending email
        const mailResponse = await mailSender(email, "You data send successfully", contactUsEmail(email, firstName, lastName, message, phoneNumber, countryCode));
        // validating mailResponse
        if(!mailResponse){
            return res.status(401).json({
                success: false,
                message: "Unable to send email"
            });
        }
        // now all things are done return res 200
        return res.status(200).json({
            success: true,
            message: "Email send successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error unable to get contact us data",
            error: error.message
        })
    }
}