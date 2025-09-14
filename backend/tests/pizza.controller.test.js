const request = require('supertest');
const express = require('express');
const { Pizza } = require('../src/models');
const pizzaController = require('../src/controllers/pizzaController');

const app = express();
app.use(express.json());
app.get('/api/pizzas', pizzaController.getPizzas);

describe('Pizza Controller - Filter, Sort & Pagination', () => {
  let testPizzas = [];

  beforeEach(async () => {
    // Create test pizzas using PostgreSQL Pizza model
    const pizzaData = [
      { name: 'Margherita', ingredients: ['tomato', 'mozzarella', 'basil'], price: 12.99, available: true, veg: true },
      { name: 'Pepperoni', ingredients: ['tomato', 'mozzarella', 'pepperoni'], price: 15.99, available: true, veg: false },
      { name: 'Vegetarian Supreme', ingredients: ['tomato', 'mozzarella', 'vegetables'], price: 18.99, available: true, veg: true }
    ];

    for (const data of pizzaData) {
      const pizza = await Pizza.create(data);
      testPizzas.push(pizza);
    }
  });

  describe('GET /api/pizzas', () => {
    it('should return all pizzas', async () => {
      const response = await request(app).get('/api/pizzas');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter by vegetarian pizzas', async () => {
      const response = await request(app).get('/api/pizzas?veg=true');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(pizza => {
        expect(pizza.veg).toBe(true);
      });
    });

    it('should sort pizzas by price', async () => {
      const response = await request(app).get('/api/pizzas?sortOrder=asc');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].price).toBeLessThanOrEqual(response.body[i + 1].price);
        }
      }
    });
  });
});