const { Order, User } = require('../src/models');

describe('Order Model - PostgreSQL Implementation', () => {
  let testUser;
  
  beforeEach(async () => {
    // Create a test user for order association
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      address: '123 Test Street',
      password: 'hashedpassword123'
    });
  });

  describe('Order Creation', () => {
    it('should create an order with valid data', async () => {
      const orderData = {
        user_id: testUser.id,
        items: [
          { id: 1, name: 'Margherita', price: 12.99, quantity: 2 }
        ],
        delivery_address: '456 Test Ave',
        total_amount: 25.98,
        customer_name: 'Test Customer',
        customer_email: 'customer@test.com'
      };

      const order = await Order.create(orderData);
      
      expect(order.id).toBeDefined();
      expect(order.user_id).toBe(testUser.id);
      expect(order.total_amount).toBe(25.98);
      expect(order.status).toBe('pending');
      expect(order.items).toHaveLength(1);
    });

    it('should fail without required fields', async () => {
      await expect(
        Order.create({ user_id: testUser.id })
      ).rejects.toThrow();
    });
  });

  describe('Order Status Management', () => {
    let testOrder;
    
    beforeEach(async () => {
      testOrder = await Order.create({
        user_id: testUser.id,
        items: [{ id: 1, name: 'Test Pizza', price: 10.00, quantity: 1 }],
        delivery_address: '123 Test St',
        total_amount: 10.00,
        customer_name: 'Test Customer',
        customer_email: 'test@customer.com'
      });
    });

    it('should update status from pending to confirmed', async () => {
      await testOrder.updateStatus('confirmed');
      expect(testOrder.status).toBe('confirmed');
    });

    it('should not allow invalid status transitions', async () => {
      await expect(
        testOrder.updateStatus('delivered')
      ).rejects.toThrow('Invalid status transition');
    });

    it('should check if order can be modified', () => {
      expect(testOrder.canModify()).toBe(true);
      
      // After confirming, should still be modifiable
      testOrder.status = 'confirmed';
      expect(testOrder.canModify()).toBe(true);
      
      // After preparing, should not be modifiable
      testOrder.status = 'preparing';
      expect(testOrder.canModify()).toBe(false);
    });
  });
});