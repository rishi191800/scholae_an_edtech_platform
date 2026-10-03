// importing express for creating router
const express = require('express');
// creating router
const router = express.Router();

// importing profile controllers
const {updateProfile, getAllUserDetials, deleteProfile, updateProfilePicture} = require('../controllers/Profile');

// importing middleware 
const {auth} = require('../middlewares/auth');


// -------------------------- profile routes --------------------------
// update profile only for those who are already logged in 
router.put('/updateProfile', auth, updateProfile);
// get user details only for those who are already logged in 
router.get('/getUserDetails', auth, getAllUserDetials);
// delete profile only for those who are already logged in
router.delete('/deleteProfile', auth, deleteProfile);
// update profile picture only for those who are already logged in
router.put('/updateProfilePicture', auth, updateProfilePicture);


// exporting router
module.exports = router; 