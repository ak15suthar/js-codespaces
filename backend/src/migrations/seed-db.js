const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Pizza, User } = require('../models');

dotenv.config();

const pizzaNames = [
  'Margherita', 'Pepperoni', 'Hawaiian', 'Veggie Delight', 'BBQ Chicken',
  'Spicy Paneer', 'Cheese Burst', 'Mushroom Magic', 'Tandoori Chicken', 'Farmhouse',
  'Mexican Green Wave', 'Double Cheese', 'Chicken Sausage', 'Peppy Paneer', 'Deluxe Veggie',
  'Peri Peri Chicken', 'Corn & Cheese', 'Italian Supreme', 'Classic Tomato', 'Smoky BBQ Veg'
];
const pizzaImages = ['pizza1.jpeg', 'pizza2.jpeg', 'pizza3.jpeg', 'pizza4.jpeg'];

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const vegIngredients = [
    ['Cheese', 'Tomato', 'Capsicum'],
    ['Paneer', 'Onion', 'Peppers'],
    ['Mushroom', 'Corn', 'Olives'],
    ['Spinach', 'Tomato', 'Cheese'],
    ['Jalapeno', 'Cheese', 'Onion']
  ];
  const nonVegIngredients = [
    ['Chicken', 'Cheese', 'Onion'],
    ['Pepperoni', 'Cheese', 'Tomato'],
    ['Ham', 'Pineapple', 'Cheese'],
    ['Chicken Sausage', 'Peppers', 'Cheese'],
    ['BBQ Chicken', 'Onion', 'Cheese']
  ];
  let pizzas = [];
  // Helper function to determine if pizza is veg based on its name
  function isVegPizza(name) {
    const nonVegKeywords = ['chicken', 'pepperoni'];
    const lowerName = name.toLowerCase();
    return !nonVegKeywords.some(keyword => lowerName.includes(keyword));
  }

  for (let i = 0; i < 40; i++) {
    const baseName = pizzaNames[i % pizzaNames.length];
    const name = baseName + ' ' + Math.floor(Math.random() * 1000);
    const isVeg = isVegPizza(baseName);
    const image = pizzaImages[Math.floor(Math.random() * pizzaImages.length)];
    const ingredients = isVeg
      ? vegIngredients[Math.floor(Math.random() * vegIngredients.length)]
      : nonVegIngredients[Math.floor(Math.random() * nonVegIngredients.length)];
    pizzas.push({ name, image, ingredients, veg: isVeg, price: Math.floor(Math.random() * 400) + 100, available: true });
  }
  for (const pizza of pizzas) {
    await Pizza.findOneAndUpdate(
      { name: pizza.name },
      pizza,
      { upsert: true, new: true }
    );
  }
  await User.findOneAndUpdate(
    { email: 'admin@admin.com' },
    {
      name: 'Admin',
      email: 'admin@admin.com',
      address: '123 Main St',
      password: '$2a$10$xtEfZ20AeXQL1pmR7RgMxOrRXH0Z78wrj07aloMUHbqbycxGBPonG',
      role: 'admin'
    },
    { upsert: true, new: true }
  );
  await mongoose.disconnect();
  console.log('Pizza migration complete!');
}

migrate().catch(e => { console.error(e); process.exit(1); });
