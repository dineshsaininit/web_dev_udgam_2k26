const express = require('express');
const router = express.Router();
const { getOrders } = require('../controllers/orderController');

// Define route for fetching all orders
router.get('/', getOrders);

module.exports = router;
