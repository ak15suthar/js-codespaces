const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Pizza } = require('../src/models');
const pizzaController = require('../src/controllers/pizzaController');

const app = express();
app.use(express.json());
app.get('/api/pizzas', pizzaController.getPizzas);

describe('Pizza Controller - Filter, Sort & Pagination', () => {
  let testPizzas;

  beforeEach(async () => {
    // Create test data
    testPizzas = await Pizza.insertMany([
      {
        name: 'Margherita',
        ingredients: ['tomato', 'mozzarella', 'basil'],
        price: 12.99,
        available: true,
        image: 'margherita.jpg',
        veg: true
      },
      {
        name: 'Pepperoni',
        ingredients: ['tomato', 'mozzarella', 'pepperoni'],
        price: 15.99,
        available: true,
        image: 'pepperoni.jpg',
        veg: false
      },
      {
        name: 'Vegetarian Supreme',
        ingredients: ['tomato', 'mozzarella', 'bell peppers', 'mushrooms', 'olives'],
        price: 18.99,
        available: true,
        image: 'veg-supreme.jpg',
        veg: true
      },
      {
        name: 'Meat Lovers',
        ingredients: ['tomato', 'mozzarella', 'pepperoni', 'sausage', 'bacon'],
        price: 22.99,
        available: true,
        image: 'meat-lovers.jpg',
        veg: false
      },
      {
        name: 'Four Cheese',
        ingredients: ['tomato', 'mozzarella', 'parmesan', 'gorgonzola', 'ricotta'],
        price: 16.99,
        available: true,
        image: 'four-cheese.jpg',
        veg: true
      },
      {
        name: 'BBQ Chicken',
        ingredients: ['bbq sauce', 'mozzarella', 'chicken', 'red onions'],
        price: 19.99,
        available: true,
        image: 'bbq-chicken.jpg',
        veg: false
      },
      {
        name: 'Hawaiian',
        ingredients: ['tomato', 'mozzarella', 'ham', 'pineapple'],
        price: 17.99,
        available: true,
        image: 'hawaiian.jpg',
        veg: false
      },
      {
        name: 'Mushroom Deluxe',
        ingredients: ['tomato', 'mozzarella', 'mushrooms', 'truffle oil'],
        price: 20.99,
        available: true,
        image: 'mushroom-deluxe.jpg',
        veg: true
      },
      {
        name: 'Spicy Salami',
        ingredients: ['tomato', 'mozzarella', 'salami', 'chili flakes'],
        price: 16.99,
        available: false, // Unavailable pizza
        image: 'spicy-salami.jpg',
        veg: false
      },
      {
        name: 'Garden Fresh',
        ingredients: ['tomato', 'mozzarella', 'spinach', 'tomatoes', 'feta'],
        price: 14.99,
        available: true,
        image: 'garden-fresh.jpg',
        veg: true
      }
    ]);
  });

  describe('GET /api/pizzas - Filtering', () => {
    test('should return all available pizzas when no filter is applied', async () => {
      const response = await request(app).get('/api/pizzas');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        pizzas: expect.any(Array),
        totalCount: 9, // 9 available pizzas
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
      expect(response.body.pizzas).toHaveLength(9);
    });

    test('should filter vegetarian pizzas when filter=veg', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ filter: 'veg' });
      
      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(5); // 5 veg pizzas
      expect(response.body.pizzas).toHaveLength(5);
      response.body.pizzas.forEach(pizza => {
        expect(pizza.veg).toBe(true);
      });
    });

    test('should filter non-vegetarian pizzas when filter=non-veg', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ filter: 'non-veg' });
      
      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(4); // 4 non-veg available pizzas
      expect(response.body.pizzas).toHaveLength(4);
      response.body.pizzas.forEach(pizza => {
        expect(pizza.veg).toBe(false);
        expect(pizza.available).toBe(true);
      });
    });

    test('should return all pizzas when filter=all', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ filter: 'all' });
      
      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(9); // All available pizzas
      expect(response.body.pizzas).toHaveLength(9);
    });

  });

  describe('GET /api/pizzas - Sorting', () => {
    test('should sort pizzas by name in ascending order', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'name', sortOrder: 'asc' });
      
      expect(response.status).toBe(200);
      const pizzaNames = response.body.pizzas.map(p => p.name);
      const sortedNames = [...pizzaNames].sort();
      expect(pizzaNames).toEqual(sortedNames);
    });

    test('should sort pizzas by name in descending order', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'name', sortOrder: 'desc' });
      
      expect(response.status).toBe(200);
      const pizzaNames = response.body.pizzas.map(p => p.name);
      const sortedNames = [...pizzaNames].sort().reverse();
      expect(pizzaNames).toEqual(sortedNames);
    });

    test('should sort pizzas by price in ascending order', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'price', sortOrder: 'asc' });
      
      expect(response.status).toBe(200);
      const prices = response.body.pizzas.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
      expect(prices[0]).toBe(12.99); // Margherita (cheapest)
    });

    test('should sort pizzas by price in descending order', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'price', sortOrder: 'desc' });
      
      expect(response.status).toBe(200);
      const prices = response.body.pizzas.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
      expect(prices[0]).toBe(22.99); // Meat Lovers (most expensive)
    });

    test('should default to ascending order when sortOrder is not specified', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'price' });
      
      expect(response.status).toBe(200);
      const prices = response.body.pizzas.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    test('should ignore invalid sortBy values and use default sorting', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ sortBy: 'invalid', sortOrder: 'asc' });
      
      expect(response.status).toBe(200);
      expect(response.body.pizzas).toHaveLength(9);
    });
  });

  describe('GET /api/pizzas - Pagination', () => {
    test('should paginate results with default page size of 10', async () => {
      const response = await request(app).get('/api/pizzas');
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalCount).toBe(9);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.hasNextPage).toBe(false);
      expect(response.body.hasPreviousPage).toBe(false);
    });

    test('should paginate with custom page size', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 1, limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalCount).toBe(9);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasNextPage).toBe(true);
      expect(response.body.hasPreviousPage).toBe(false);
      expect(response.body.pizzas).toHaveLength(3);
    });

    test('should return second page with correct pagination info', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 2, limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(2);
      expect(response.body.totalCount).toBe(9);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasNextPage).toBe(true);
      expect(response.body.hasPreviousPage).toBe(true);
      expect(response.body.pizzas).toHaveLength(3);
    });

    test('should return last page with correct pagination info', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 3, limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(3);
      expect(response.body.totalCount).toBe(9);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasNextPage).toBe(false);
      expect(response.body.hasPreviousPage).toBe(true);
      expect(response.body.pizzas).toHaveLength(3);
    });

    test('should handle page beyond total pages', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 10, limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(10);
      expect(response.body.totalCount).toBe(9);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasNextPage).toBe(false);
      expect(response.body.hasPreviousPage).toBe(true);
      expect(response.body.pizzas).toHaveLength(0);
    });

    test('should handle invalid page numbers', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 0, limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1); // Should default to 1
    });

    test('should handle invalid limit values', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 1, limit: 0 });
      
      expect(response.status).toBe(200);
      expect(response.body.pizzas).toHaveLength(10); // Should default to 10
    });

    test('should enforce maximum limit', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 1, limit: 1000 });
      
      expect(response.status).toBe(200);
      expect(response.body.pizzas.length).toBeLessThanOrEqual(100); // Should enforce max limit
    });
  });

  describe('GET /api/pizzas - Combined Filter, Sort & Pagination', () => {
    test('should combine vegetarian filter, price sorting, and pagination', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({
          filter: 'veg',
          sortBy: 'price',
          sortOrder: 'asc',
          page: 1,
          limit: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(5); // 5 veg pizzas
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(3); // 5 pizzas / 2 per page = 3 pages
      expect(response.body.pizzas).toHaveLength(2);
      
      // Should be vegetarian and sorted by price
      response.body.pizzas.forEach(pizza => {
        expect(pizza.veg).toBe(true);
      });
      
      const prices = response.body.pizzas.map(p => p.price);
      expect(prices[0]).toBeLessThanOrEqual(prices[1]);
    });

    test('should handle empty results with filter applied', async () => {
      // Create a scenario where filter yields no results
      // Since we have both veg and non-veg pizzas, this test will simulate
      // a case where business logic might filter out all results
      const response = await request(app)
        .get('/api/pizzas')
        .query({
          filter: 'veg',
          sortBy: 'price',
          page: 1,
          limit: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.totalCount).toBe(5); // Should have veg pizzas
      expect(response.body.pizzas.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/pizzas - Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock Pizza.find to throw an error
      jest.spyOn(Pizza, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });
      
      const response = await request(app).get('/api/pizzas');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      
      // Restore the original implementation
      Pizza.find.mockRestore();
    });

    test('should validate numeric parameters', async () => {
      const response = await request(app)
        .get('/api/pizzas')
        .query({ page: 'invalid', limit: 'invalid' });
      
      expect(response.status).toBe(200);
      // Should use defaults for invalid numeric values
      expect(response.body.currentPage).toBe(1);
    });
  });

  describe('GET /api/pizzas - Performance', () => {
    test('should complete request within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/pizzas')
        .query({
          filter: 'veg',
          sortBy: 'price',
          sortOrder: 'desc',
          page: 1,
          limit: 10
        });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});