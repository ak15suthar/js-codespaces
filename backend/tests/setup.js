const { query, getClient } = require('../src/config/database');

// Test database setup for PostgreSQL
beforeAll(async () => {
  // Create test tables if they don't exist
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      address VARCHAR(500),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS pizzas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      ingredients TEXT DEFAULT '[]',
      price DECIMAL(10, 2) NOT NULL,
      available BOOLEAN DEFAULT true,
      image VARCHAR(500),
      veg BOOLEAN DEFAULT false,
      category VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      pizza_id INTEGER,
      pizza_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      special_instructions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Clean up after each test
afterEach(async () => {
  // Clean test data in proper order (due to foreign key constraints)
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM pizzas');
  await query('DELETE FROM users');
});

// Clean up after all tests
afterAll(async () => {
  // Optional: Drop test tables or close connections
  // For now, we'll just ensure clean state
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM pizzas');
  await query('DELETE FROM users');
});