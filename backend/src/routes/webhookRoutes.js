const express = require('express');
const { deliveryUpdate } = require('../controllers/webhookController.js');

const router = express.Router();

router.post('/delivery-update', deliveryUpdate);

module.exports = router;
