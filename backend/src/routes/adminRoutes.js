const express = require('express');
const admin = require('../middleware/admin.js');
const { getAllOrders } = require('../controllers/adminController.js');

const router = express.Router();

router.get('/orders', admin, getAllOrders);

module.exports = router;
