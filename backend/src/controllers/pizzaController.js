const { Pizza } = require("../models");

const getPizzas = async (req, res) => {
  const pizzas = await Pizza.find();
  res.json(pizzas);
};

const createPizza = async (req, res) => {
  const pizza = new Pizza(req.body);
  await pizza.save();
  res.status(201).json(pizza);
};

module.exports = {
  getPizzas,
  createPizza,
};
