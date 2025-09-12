const express = require('express');
const { getOrders, createOrder, getMyOrders, getOrderById } = require('../controllers/orderController.js');
const validateToken = require('../middleware/auth.js');

const router = express.Router();

router.get('/', getOrders);
router.post('/', validateToken, createOrder);

// User's own order history
router.get('/mine', validateToken, getMyOrders);
// User's specific order detail
router.get('/:orderId', validateToken, getOrderById);

module.exports = router;
