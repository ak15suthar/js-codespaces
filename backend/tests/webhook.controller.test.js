const request = require('supertest');
const app = require('../src/app');
const { Order, User } = require('../src/models');

describe('Webhook Controller - PostgreSQL Implementation', () => {
  let testOrderId;
  let testUserId;

  beforeEach(async () => {
    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'webhook@test.com',
      address: '123 Webhook St',
      password: 'hashedpassword123'
    });
    testUserId = testUser.id;

    // Create test order
    const testOrder = await Order.create({
      user_id: testUserId,
      items: [{ id: 1, name: 'Test Pizza', price: 10.00, quantity: 1 }],
      delivery_address: '123 Test Street',
      total_amount: 10.00,
      customer_name: 'Test Customer',
      customer_email: 'test@customer.com'
    });
    testOrderId = testOrder.id;
  });

  describe('POST /api/webhook/delivery-update', () => {
    it('should update order status successfully', async () => {
      const webhookData = {
        orderId: testOrderId,
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('processed successfully');
      expect(response.body.newStatus).toBe('confirmed');
    });

    it('should return 404 for non-existent order', async () => {
      const webhookData = {
        orderId: 99999,
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(webhookData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });

    it('should return 400 for missing orderId', async () => {
      const webhookData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(webhookData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing orderId or status');
    });

    it('should return 400 for missing status', async () => {
      const webhookData = {
        orderId: testOrderId
      };

      const response = await request(app)
        .post('/api/webhook/delivery-update')
        .send(webhookData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing orderId or status');
    });
  });
});