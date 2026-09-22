const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route to create a new Razorpay order
router.post('/create-order', paymentController.createOrder);

// Route to verify the payment and store details in Neon + Firebase
router.post('/verify-payment', paymentController.verifyPayment);

// Route to record a failed payment attempt
router.post('/save-failed-payment', paymentController.saveFailedPayment);

module.exports = router;

