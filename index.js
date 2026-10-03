// importing express to create a server
const express = require('express');
// importing function connectToDB so that mongoose can connect to the server
const connectToDB = require('./config/database');
// importing dotenv config for using enviroment variable
require('dotenv').config();
// importing user Route
const userRoutes = require('./routes/User');
// importing payment Route
const paymentRoute = require('./routes/Payments');
// importing profile Route
const profileRoute = require('./routes/Profile');
// importing course route
const courseRoute = require('./routes/Course');
// importing cloudinary connect 
const {cloudinaryConnect} = require('./config/cloudinary');
// importing cors
const cors = require('cors');
// importing express file uploader for uploading file 
const fileUploader = require('express-fileupload');
// importing cookie-parser to parse the cookie
const cookieParser = require('cookie-parser');

// creating an instance of express 
const app = express();
// fetching environment variable for port 
const port  = process.env.PORT || 4000;

// adding express json middleware
app.use(express.json());
// adding cookieParser middleware
app.use(cookieParser());
// adding cors middleware
app.use(cors({origin: `http://localhost:5173`, credentials: true}));
// adding file uploader middleware
app.use(fileUploader({useTempFiles: true, tempFileDir: "/tmp/"}));

// connect to cloudinary
cloudinaryConnect();

// auth base routes
app.use("/api/v1/auth", userRoutes);
// profile base routes
app.use("/api/v1/profile", profileRoute);
// course base routes
app.use("/api/v1/course", courseRoute);
// payment base routes
app.use("/api/v1/payment", paymentRoute);
 

// creating default route
app.get("/", (req, res) => {
    res.send("Your server is up and running");
});

// connecting to database
connectToDB()

// Listning on port 
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})