const express = require('express');
const { getPizzas, createPizza } = require('../controllers/pizzaController.js');

const router = express.Router();

router.get('/', getPizzas);
router.post('/', createPizza);

module.exports = router;
