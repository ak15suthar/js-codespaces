const { query, getClient } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.items = data.items || [];
    this.status = data.status || 'pending';
    this.delivery_address = data.delivery_address || data.deliveryAddress;
    this.total_amount = parseFloat(data.total_amount || data.totalAmount || 0);
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status || 'pending';
    this.notes = data.notes;
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
  }

  // Validate status transitions
  static isValidStatusTransition(currentStatus, newStatus) {
    const transitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    return transitions[currentStatus]?.includes(newStatus) || false;
  }

  static calculateEstimatedDelivery(item){
    const baseMin =20;
    const perItemMin = 5;
    const totalQty = (item || []).reduce((s, it) => s + (it.quantity || 0),0);
    const estMin = baseMin + perItemMin + totalQty;
    const estMinDt = new Date(Date.now() + estMin * 60 * 1000);
    return estMinDt;
  }

  static canBeModified(status){
    const modifiable = new Set(['pending','confirmed']);
    return modifiable.has(status);
  }

  // Create a new order with transaction
  static async create(orderData) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const { 
        user_id,
        items = [],
        delivery_address,
        deliveryAddress,
        total_amount,
        totalAmount,
        customer_name,
        customer_email,
        customer_phone,
        payment_method,
        notes,
        status = 'pending'
      } = orderData;
      
      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, status, delivery_address, total_amount,
          customer_name, customer_email, customer_phone,
          payment_method, payment_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          user_id,
          status,
          delivery_address || deliveryAddress,
          total_amount || totalAmount,
          customer_name,
          customer_email,
          customer_phone,
          payment_method,
          'pending',
          notes
        ]
      );
      
      const order = orderResult.rows[0];
      
      // Insert order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (
            order_id, pizza_id, pizza_name, quantity, 
            unit_price, total_price, special_instructions
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            order.id,
            item.id || item.pizza_id,
            item.name || item.pizza_name,
            item.quantity || 1,
            item.price || item.unit_price,
            (item.price || item.unit_price) * (item.quantity || 1),
            item.special_instructions
          ]
        );
      }
      
      await client.query('COMMIT');
      
      // Fetch the complete order with items
      return Order.findById(order.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find order by ID with items
  static async findById(id) {
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    
    const order = new Order(orderResult.rows[0]);
    order.items = itemsResult.rows.map(item => ({
      id: item.pizza_id,
      name: item.pizza_name,
      price: parseFloat(item.unit_price),
      quantity: item.quantity,
      special_instructions: item.special_instructions
    }));
    
    return order;
  }

  // Find orders with filters
  static async find(filter = {}, options = {}) {
    const { 
      page = 1, 
      limit = 10,
      sort = '-created_at'
    } = options;

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Build WHERE conditions
    if (filter.user_id || filter.user) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(filter.user_id || filter.user);
    }

    if (filter.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filter.status);
    }

    if (filter.payment_status) {
      conditions.push(`payment_status = $${params.length + 1}`);
      params.push(filter.payment_status);
    }

    let queryText = 'SELECT * FROM orders';
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    queryText += ` ORDER BY ${sortField} ${sortDirection}`;

    // Add pagination
    queryText += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    
    // Fetch items for each order
    const orders = [];
    for (const row of result.rows) {
      const order = new Order(row);
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = itemsResult.rows.map(item => ({
        id: item.pizza_id,
        name: item.pizza_name,
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        special_instructions: item.special_instructions
      }));
      orders.push(order);
    }
    
    return orders;
  }

  // Update order status
  async updateStatus(newStatus) {
    if (!Order.isValidStatusTransition(this.status, newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newStatus, this.id]
    );
    
    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }
    
    return this;
  }

  // Save/update order
  async save() {
    const result = await query(
      `UPDATE orders 
       SET status = $1, delivery_address = $2, total_amount = $3,
           customer_name = $4, customer_email = $5, customer_phone = $6,
           payment_method = $7, payment_status = $8, notes = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        this.status,
        this.delivery_address,
        this.total_amount,
        this.customer_name,
        this.customer_email,
        this.customer_phone,
        this.payment_method,
        this.payment_status,
        this.notes,
        this.id
      ]
    );
    
    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }
    
    return this;
  }

  // Count orders
  static async countDocuments(filter = {}) {
    const params = [];
    const conditions = [];

    if (filter.user_id || filter.user) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(filter.user_id || filter.user);
    }

    if (filter.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filter.status);
    }

    let queryText = 'SELECT COUNT(*) FROM orders';
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }

  // Check if order can be modified
  canModify() {
    return ['pending', 'confirmed'].includes(this.status);
  }

  // Populate user information
  async populate(field) {
    if (field === 'user' && this.user_id) {
      const User = require('./User.pg');
      this.user = await User.findById(this.user_id);
    }
    return this;
  }

  // Convert to MongoDB-compatible format for backward compatibility
  toObject() {
    return {
      _id: this.id,
      user: this.user_id,
      items: this.items,
      status: this.status,
      deliveryAddress: this.delivery_address,
      totalAmount: this.total_amount,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

// Create tables if they don't exist
const createTables = async () => {
  // Create orders table
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      customer_phone VARCHAR(20),
      delivery_address TEXT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      payment_method VARCHAR(50),
      payment_status VARCHAR(50) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create order_items table
  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      pizza_id INTEGER NOT NULL,
      pizza_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      special_instructions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes
  await query(`
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id, createdAt)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, createdAt)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(createdAt)
  `);
};

createTables.meth

// Initialize tables on module load
createTables().catch(console.error);

module.exports = Order;