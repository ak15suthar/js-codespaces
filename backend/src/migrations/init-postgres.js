const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing PostgreSQL database...');
    
    // Create users table
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
    console.log('✅ Users table created');
    
    // Create pizzas table
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
    console.log('✅ Pizzas table created');
    
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
    console.log('✅ Orders table created');
    
    // Create order_items table
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
    console.log('✅ Order items table created');
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_pizzas_category ON pizzas(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_pizzas_available ON pizzas(available)');
    console.log('✅ Indexes created');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    
    // Check if admin user exists
    const adminCheck = await query('SELECT * FROM users WHERE email = $1', ['admin@admin.com']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await query(
        'INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5)',
        ['Admin User', 'admin@admin.com', '123 Admin Street', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created (admin@admin.com / password123)');
    }
    
    // Check if pizzas exist
    const pizzaCheck = await query('SELECT COUNT(*) FROM pizzas');
    if (parseInt(pizzaCheck.rows[0].count) === 0) {
      const pizzas = [
        {
          name: 'Margherita',
          ingredients: ['tomato sauce', 'mozzarella', 'basil'],
          price: 12.99,
          category: 'Classic',
          veg: true,
          description: 'Fresh tomatoes, mozzarella, basil',
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'
        },
        {
          name: 'Pepperoni',
          ingredients: ['tomato sauce', 'mozzarella', 'pepperoni'],
          price: 14.99,
          category: 'Classic',
          veg: false,
          description: 'Pepperoni, mozzarella, tomato sauce',
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e'
        },
        {
          name: 'Hawaiian',
          ingredients: ['tomato sauce', 'mozzarella', 'ham', 'pineapple'],
          price: 13.99,
          category: 'Specialty',
          veg: false,
          description: 'Ham, pineapple, mozzarella',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'
        },
        {
          name: 'Vegetarian',
          ingredients: ['tomato sauce', 'mozzarella', 'bell peppers', 'mushrooms', 'onions', 'olives'],
          price: 13.49,
          category: 'Vegetarian',
          veg: true,
          description: 'Bell peppers, mushrooms, onions, olives',
          image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47'
        },
        {
          name: 'BBQ Chicken',
          ingredients: ['BBQ sauce', 'mozzarella', 'grilled chicken', 'red onions'],
          price: 15.99,
          category: 'Specialty',
          veg: false,
          description: 'Grilled chicken, BBQ sauce, red onions',
          image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828'
        },
        {
          name: 'Four Cheese',
          ingredients: ['mozzarella', 'cheddar', 'parmesan', 'gorgonzola'],
          price: 14.49,
          category: 'Classic',
          veg: true,
          description: 'Mozzarella, cheddar, parmesan, gorgonzola',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
        }
      ];
      
      for (const pizza of pizzas) {
        await query(
          `INSERT INTO pizzas (name, ingredients, price, available, image, veg, category, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            pizza.name,
            JSON.stringify(pizza.ingredients),
            pizza.price,
            true,
            pizza.image,
            pizza.veg,
            pizza.category,
            pizza.description
          ]
        );
      }
      console.log(`✅ ${pizzas.length} pizzas added`);
    }
    
    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;