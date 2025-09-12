const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Pizza = require('../src/models/Pizza');

describe('Order Model - Engineering Assessment', () => {
  let testUser, testPizza1, testPizza2;

  beforeEach(async () => {
    // Setup test data
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      address: '123 Test St',
      password: 'password123'
    });

    testPizza1 = await Pizza.create({
      name: 'Margherita',
      ingredients: ['tomato', 'mozzarella', 'basil'],
      price: 12.99,
      available: true,
      veg: true
    });

    testPizza2 = await Pizza.create({
      name: 'Pepperoni',
      ingredients: ['tomato', 'mozzarella', 'pepperoni'],
      price: 15.99,
      available: true,
      veg: false
    });
  });

  // =================================================================
  // LEVEL 1: BASIC SCHEMA VALIDATION (Junior Engineer - 50-60%)
  // =================================================================
  describe('Level 1: Basic Schema Validation', () => {
    test('should require user reference', async () => {
      const orderData = {
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      
      expect(error).toBeTruthy();
      expect(error.errors.user).toBeTruthy();
    });

    test('should require items array', async () => {
      const orderData = {
        user: testUser._id,
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    test('should validate status enum values', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        status: 'invalid_status',
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      
      expect(error).toBeTruthy();
      expect(error.errors.status).toBeTruthy();
    });

    test('should have default status as pending', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      expect(order.status).toBe('pending');
    });

    test('should require deliveryAddress', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }]
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      
      expect(error).toBeTruthy();
      expect(error.errors.deliveryAddress).toBeTruthy();
    });
  });

  // =================================================================
  // LEVEL 2: BUSINESS LOGIC VALIDATION (Mid-level Engineer - 70-80%)
  // =================================================================
  describe('Level 2: Business Logic Validation', () => {
    test('should calculate totalAmount correctly from items', async () => {
      const orderData = {
        user: testUser._id,
        items: [
          { 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 2 
          },
          { 
            id: testPizza2._id, 
            name: testPizza2.name, 
            price: testPizza2.price, 
            quantity: 1 
          }
        ],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await order.save();

      const expectedTotal = (testPizza1.price * 2) + testPizza2.price;
      expect(order.totalAmount).toBe(expectedTotal);
    });

    test('should validate items array is not empty', async () => {
      const orderData = {
        user: testUser._id,
        items: [],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    test('should validate item quantities are positive', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 0 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    test('should validate delivery address is not empty', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        deliveryAddress: ''
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    test('should enforce minimum order amount', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: 0.01, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      // Should either validate minimum amount or allow small orders
      await expect(order.save()).resolves.toBeTruthy();
    });
  });

  // =================================================================
  // LEVEL 3: DATA INTEGRITY & CONSTRAINTS (Advanced Engineer - 85-90%)
  // =================================================================
  describe('Level 3: Data Integrity & Constraints', () => {
    test('should preserve item prices when pizza price changes', async () => {
      const originalPrice = testPizza1.price;
      
      const order = await Order.create({
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: originalPrice,
          quantity: 1
        }],
        deliveryAddress: '123 Test St'
      });

      // Change pizza price
      testPizza1.price = 20.00;
      await testPizza1.save();

      // Order should still have original price
      const savedOrder = await Order.findById(order._id);
      expect(savedOrder.items[0].price).toBe(originalPrice);
    });

    test('should validate status transition rules', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        status: 'pending',
        deliveryAddress: '123 Test St'
      });

      // Valid transition: pending -> confirmed
      order.status = 'confirmed';
      await expect(order.save()).resolves.toBeTruthy();

      // Invalid transition: confirmed -> pending
      order.status = 'pending';
      await expect(order.save()).rejects.toThrow();

      // Invalid transition: confirmed -> delivered (skipping preparing)
      order.status = 'delivered';
      await expect(order.save()).rejects.toThrow();
    });

    test('should prevent order modification after certain statuses', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        status: 'delivered',
        deliveryAddress: '123 Test St'
      });

      // Should prevent modification of delivered orders
      order.items.push({ 
        id: testPizza2._id, 
        name: testPizza2.name, 
        price: testPizza2.price, 
        quantity: 1 
      });
      await expect(order.save()).rejects.toThrow();
    });

    test('should handle multiple items with same pizza', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [
          { 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 2 
          },
          { 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 1 
          }
        ],
        deliveryAddress: '123 Test St'
      });

      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(testPizza1.price * 3);
    });
  });

  // =================================================================
  // LEVEL 4: EDGE CASES & SECURITY (Senior Engineer - 90-95%)
  // =================================================================
  describe('Level 4: Edge Cases & Security', () => {
    test('should handle extremely large order quantities', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 999999
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      // Should either handle gracefully or reject with proper error
      await expect(order.save()).rejects.toThrow(/quantity.*too large/i);
    });

    test('should handle malformed delivery addresses gracefully', async () => {
      const malformedAddresses = [
        '', // Empty
        'a'.repeat(1000), // Too long
        '<script>alert("xss")</script>', // XSS attempt
        null, // Null
      ];

      for (const address of malformedAddresses) {
        const orderData = {
          user: testUser._id,
          items: [{ 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 1 
          }],
          deliveryAddress: address
        };

        const order = new Order(orderData);
        await expect(order.save()).rejects.toThrow();
      }
    });

    test('should handle XSS in item names', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: xssPayload, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await order.save();
      
      // Name should be sanitized or stored as-is (depending on requirements)
      const savedOrder = await Order.findById(order._id);
      expect(savedOrder.items[0].name).toBe(xssPayload); // Or sanitized version
    });

    test('should handle decimal precision in prices', async () => {
      const orderData = {
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: 12.999, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      };

      const order = new Order(orderData);
      await order.save();

      // Should handle decimal precision appropriately
      expect(order.totalAmount).toBeCloseTo(12.999, 2);
    });
  });

  // =================================================================
  // LEVEL 5: PERFORMANCE & SCALABILITY (Expert Engineer - 95%+)
  // =================================================================
  describe('Level 5: Performance & Scalability', () => {
    beforeEach(async () => {
      // Create test data for performance tests
      const users = await User.create([
        { name: 'User 1', email: 'user1@test.com', address: '123 St', password: 'pass' },
        { name: 'User 2', email: 'user2@test.com', address: '456 St', password: 'pass' }
      ]);

      const orders = [];
      for (let i = 0; i < 100; i++) {
        orders.push({
          user: users[i % 2]._id,
          items: [{ 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 1 
          }],
          status: ['pending', 'confirmed', 'delivered'][i % 3],
          deliveryAddress: '123 Test St',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Spread over days
        });
      }
      await Order.create(orders);
    });

    test('should efficiently query orders by user', async () => {
      const startTime = Date.now();
      
      const userOrders = await Order.find({ user: testUser._id });
      
      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(100); // Should be fast with proper indexing
      expect(userOrders).toHaveLength(0); // testUser has no orders in this dataset
    });

    test('should efficiently query orders by status', async () => {
      const startTime = Date.now();
      
      const pendingOrders = await Order.find({ status: 'pending' });
      
      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(100);
      expect(pendingOrders.length).toBeGreaterThan(0);
    });

    test('should efficiently query orders by date range', async () => {
      const startTime = Date.now();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recentOrders = await Order.find({
        createdAt: { $gte: sevenDaysAgo }
      });
      
      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(100);
      expect(recentOrders.length).toBeGreaterThan(0);
    });

    test('should have appropriate indexes for common queries', async () => {
      const indexes = await Order.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      // Should have indexes on commonly queried fields
      expect(indexNames.some(name => name.includes('user'))).toBeTruthy();
      expect(indexNames.some(name => name.includes('status'))).toBeTruthy();
      expect(indexNames.some(name => name.includes('createdAt'))).toBeTruthy();
    });

    test('should handle large datasets without memory issues', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Stream through all orders instead of loading all at once
      const cursor = Order.find({}).cursor();
      let count = 0;
      
      for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        count++;
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(count).toBeGreaterThan(0);
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  // =================================================================
  // INSTANCE METHODS TESTS
  // =================================================================
  describe('Instance Methods', () => {
    test('should check if order can be modified', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        status: 'pending',
        deliveryAddress: '123 Test St'
      });

      expect(order.canBeModified()).toBe(true);

      order.status = 'delivered';
      await order.save();
      expect(order.canBeModified()).toBe(false);
    });

    test('should calculate estimated delivery time', async () => {
      const order = await Order.create({
        user: testUser._id,
        items: [{ 
          id: testPizza1._id, 
          name: testPizza1.name, 
          price: testPizza1.price, 
          quantity: 1 
        }],
        deliveryAddress: '123 Test St'
      });

      const estimatedTime = order.calculateEstimatedDelivery();
      expect(estimatedTime).toBeInstanceOf(Date);
      expect(estimatedTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  // =================================================================
  // STATIC METHODS TESTS
  // =================================================================
  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create([
        {
          user: testUser._id,
          items: [{ 
            id: testPizza1._id, 
            name: testPizza1.name, 
            price: testPizza1.price, 
            quantity: 1 
          }],
          status: 'pending',
          deliveryAddress: '123 Test St'
        },
        {
          user: testUser._id,
          items: [{ 
            id: testPizza2._id, 
            name: testPizza2.name, 
            price: testPizza2.price, 
            quantity: 1 
          }],
          status: 'delivered',
          deliveryAddress: '123 Test St'
        }
      ]);
    });

    test('should find orders by user with pagination', async () => {
      const orders = await Order.findByUserPaginated(testUser._id, 1, 10);
      expect(orders).toHaveLength(2);
    });

    test('should get order statistics', async () => {
      const stats = await Order.getOrderStats();
      expect(stats).toBeInstanceOf(Array);
      expect(stats.length).toBeGreaterThan(0);
    });
  });
});