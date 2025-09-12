const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  price: Number,
  available: Boolean,
  image: String,
  veg: Boolean // true for veg, false for non-veg
});

module.exports = mongoose.model('Pizza', pizzaSchema);
