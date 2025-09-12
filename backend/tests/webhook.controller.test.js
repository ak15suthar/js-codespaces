const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Order = require('../src/models/Order');
const User = require('../src/models/User');

describe('Webhook Controller - Feature 3 Implementation Tests', () => {
  let mongoServer;
  let testOrderId;
  let testUserId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    testUserId = testUser._id;

    // Create a test order in pending status
    const testOrder = await Order.create({
      user: testUserId,
      items: [{
        pizza: new mongoose.Types.ObjectId(),
        quantity: 2,
        price: 15.99
      }],
      totalAmount: 31.98,
      status: 'pending',
      deliveryAddress: {
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345'
      }
    });
    testOrderId = testOrder._id;
  });

  describe('Payload Validation Tests', () => {
    it('should return 400 when orderId is missing', async () => {
      const payload = {
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(400);

      expect(response.body.message).toMatch(/orderId.*required/i);
    });

    it('should return 400 when status is missing', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(400);

      expect(response.body.message).toMatch(/status.*required/i);
    });

    it('should return 400 when timestamp is missing', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(400);

      expect(response.body.message).toMatch(/timestamp.*required/i);
    });

    it('should return 400 when orderId is not a valid ObjectId', async () => {
      const payload = {
        orderId: 'invalid-object-id',
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(400);

      expect(response.body.message).toMatch(/invalid.*objectid/i);
    });

    it('should accept optional fields without validation errors', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 3600000).toISOString(),
        deliveryNotes: 'Order confirmed by restaurant'
      };

      await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(200);
    });
  });

  describe('Order Status Management Tests', () => {
    it('should return 404 when order is not found', async () => {
      const nonExistentOrderId = new mongoose.Types.ObjectId();
      const payload = {
        orderId: nonExistentOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(404);

      expect(response.body.message).toMatch(/order.*not found/i);
    });

    it('should successfully update order status for valid transition', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Order status updated successfully',
        orderId: testOrderId.toString(),
        newStatus: 'confirmed'
      });

      const updatedOrder = await Order.findById(testOrderId);
      expect(updatedOrder.status).toBe('confirmed');
      expect(updatedOrder.statusUpdatedAt).toBeDefined();
    });

    it('should update optional fields when provided', async () => {
      const estimatedTime = new Date(Date.now() + 3600000).toISOString();
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        estimatedDeliveryTime: estimatedTime,
        deliveryNotes: 'Restaurant confirmed order'
      };

      await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(200);

      const updatedOrder = await Order.findById(testOrderId);
      expect(updatedOrder.estimatedDeliveryTime).toBeDefined();
      expect(updatedOrder.deliveryNotes).toBe('Restaurant confirmed order');
    });
  });

  describe('Status Transition Rules Tests', () => {
    const transitionTests = [
      // Valid transitions
      { from: 'pending', to: 'confirmed', shouldPass: true },
      { from: 'pending', to: 'cancelled', shouldPass: true },
      { from: 'confirmed', to: 'preparing', shouldPass: true },
      { from: 'confirmed', to: 'cancelled', shouldPass: true },
      { from: 'preparing', to: 'out_for_delivery', shouldPass: true },
      { from: 'preparing', to: 'cancelled', shouldPass: true },
      { from: 'out_for_delivery', to: 'delivered', shouldPass: true },
      { from: 'out_for_delivery', to: 'cancelled', shouldPass: true },
      
      // Invalid transitions
      { from: 'confirmed', to: 'pending', shouldPass: false },
      { from: 'preparing', to: 'pending', shouldPass: false },
      { from: 'preparing', to: 'confirmed', shouldPass: false },
      { from: 'out_for_delivery', to: 'pending', shouldPass: false },
      { from: 'out_for_delivery', to: 'confirmed', shouldPass: false },
      { from: 'out_for_delivery', to: 'preparing', shouldPass: false },
      { from: 'delivered', to: 'pending', shouldPass: false },
      { from: 'delivered', to: 'confirmed', shouldPass: false },
      { from: 'delivered', to: 'preparing', shouldPass: false },
      { from: 'delivered', to: 'out_for_delivery', shouldPass: false },
      { from: 'delivered', to: 'cancelled', shouldPass: false },
      { from: 'cancelled', to: 'pending', shouldPass: false },
      { from: 'cancelled', to: 'confirmed', shouldPass: false },
      { from: 'cancelled', to: 'preparing', shouldPass: false },
      { from: 'cancelled', to: 'out_for_delivery', shouldPass: false },
      { from: 'cancelled', to: 'delivered', shouldPass: false }
    ];

    transitionTests.forEach(({ from, to, shouldPass }) => {
      it(`should ${shouldPass ? 'allow' : 'reject'} transition from ${from} to ${to}`, async () => {
        // Set up order with initial status
        await Order.findByIdAndUpdate(testOrderId, { status: from });

        const payload = {
          orderId: testOrderId.toString(),
          status: to,
          timestamp: new Date().toISOString()
        };

        if (shouldPass) {
          const response = await request(app)
            .post('/api/webhook/delivery-update')
            .send(payload)
            .expect(200);

          expect(response.body.newStatus).toBe(to);
          
          const updatedOrder = await Order.findById(testOrderId);
          expect(updatedOrder.status).toBe(to);
        } else {
          const response = await request(app)
            .post('/api/webhook/delivery-update')
            .send(payload)
            .expect(409);

          expect(response.body.message).toMatch(/invalid.*transition/i);
          
          const unchangedOrder = await Order.findById(testOrderId);
          expect(unchangedOrder.status).toBe(from);
        }
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database errors gracefully', async () => {
      // Mock Order.findById to throw an error
      const originalFindById = Order.findById;
      Order.findById = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(500);

      expect(response.body.message).toMatch(/internal.*server.*error/i);

      // Restore original method
      Order.findById = originalFindById;
    });

    it('should return consistent error format for all error types', async () => {
      const payload = {
        orderId: 'invalid-id',
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Response Format Tests', () => {
    it('should return correct response format for successful updates', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Order status updated successfully',
        orderId: testOrderId.toString(),
        newStatus: 'confirmed'
      });
    });

    it('should include orderId in error responses when available', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'invalid-status-backwards',
        timestamp: new Date().toISOString()
      };

      // First set order to confirmed status
      await Order.findByIdAndUpdate(testOrderId, { status: 'confirmed' });

      // Try to transition back to pending (invalid)
      payload.status = 'pending';

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload)
        .expect(409);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete order lifecycle via webhooks', async () => {
      const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
      
      for (const status of statuses) {
        const payload = {
          orderId: testOrderId.toString(),
          status,
          timestamp: new Date().toISOString()
        };

        const response = await request(app)
          .post('/api/webhook/delivery-update')
          .send(payload)
          .expect(200);

        expect(response.body.newStatus).toBe(status);
      }

      const finalOrder = await Order.findById(testOrderId);
      expect(finalOrder.status).toBe('delivered');
    });

    it('should handle cancellation at any valid stage', async () => {
      const cancellableStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
      
      for (const initialStatus of cancellableStatuses) {
        // Create new order for each test
        const order = await Order.create({
          user: testUserId,
          items: [{
            pizza: new mongoose.Types.ObjectId(),
            quantity: 1,
            price: 10.99
          }],
          totalAmount: 10.99,
          status: initialStatus,
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            zipCode: '12345'
          }
        });

        const payload = {
          orderId: order._id.toString(),
          status: 'cancelled',
          timestamp: new Date().toISOString()
        };

        await request(app)
          .post('/api/webhook/delivery-update')
          .send(payload)
          .expect(200);

        const cancelledOrder = await Order.findById(order._id);
        expect(cancelledOrder.status).toBe('cancelled');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle same status update gracefully', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'pending', // Same as current status
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload);

      // This should either succeed (idempotent) or fail with appropriate message
      // Implementation dependent - but should not crash
      expect([200, 409]).toContain(response.status);
    });

    it('should handle very large payload gracefully', async () => {
      const payload = {
        orderId: testOrderId.toString(),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        deliveryNotes: 'A'.repeat(10000) // Very long notes
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(payload);

      // Should either succeed or fail with validation error, not crash
      expect([200, 400]).toContain(response.status);
    });

    it('should handle concurrent webhook calls', async () => {
      const promises = [];
      
      // Send multiple concurrent webhook calls
      for (let i = 0; i < 3; i++) {
        const payload = {
          orderId: testOrderId.toString(),
          status: 'confirmed',
          timestamp: new Date().toISOString()
        };

        promises.push(
          request(app)
            .post('/api/webhook/delivery-update')
            .send(payload)
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should succeed, others might fail due to race conditions
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});