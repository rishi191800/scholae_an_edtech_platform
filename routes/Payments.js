// importing express for creating router
const express = require('express');
// creating router
const router = express.Router();

// importing payments controller
const {capturePayment, verifySignature} = require('../controllers/Payments');

// importing middleware 
const {auth, isStudent} = require('../middlewares/auth');

// capture payment only can be accessible for students
router.post('/capturePayment', auth, isStudent, capturePayment);
// verify payment only can be accessible for students
router.post('/verifyPayment', auth, isStudent, verifySignature);

// exporting router
module.exports = router;