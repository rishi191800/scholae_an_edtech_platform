// importing nodemail to send mail
const nodemailer = require('nodemailer');
// importing dotenv config for fetching environment variable
require('dotenv').config();

// creating a function to send email
const mailSender = async(email, title, body) => {
    try {
        // creating transporter 
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass : process.env.MAIL_PASS
            },
            secure: false
        })

        const info = await transporter.sendMail({
            from: "Scholae - An EdTech Platform || by Rishikesh Kumar refrences CodeHelp",
            to: email,
            subject: title,
            html: body,
        })

        console.log(info.response);
        return info;
    } catch (error) {
        console.log(error.message);
        console.log("Unable to send mail")
    }
}

// exporting mailSender
module.exports = mailSender;