-- Create database if not exists (this runs in the postgres database context)
SELECT 'CREATE DATABASE pizza_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pizza_app')\gexec

-- Connect to pizza_app database
\c pizza_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pizzas table
CREATE TABLE IF NOT EXISTS pizzas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(100),
    is_vegetarian BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    pizza_id INTEGER REFERENCES pizzas(id),
    pizza_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pizzas_category ON pizzas(category);

-- Insert default admin user (password: password123)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@admin.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample pizzas
INSERT INTO pizzas (name, description, price, category, is_vegetarian, image) VALUES
('Margherita', 'Fresh tomatoes, mozzarella, basil', 12.99, 'Classic', true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
('Pepperoni', 'Pepperoni, mozzarella, tomato sauce', 14.99, 'Classic', false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e'),
('Hawaiian', 'Ham, pineapple, mozzarella', 13.99, 'Specialty', false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
('Vegetarian', 'Bell peppers, mushrooms, onions, olives', 13.49, 'Vegetarian', true, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47'),
('BBQ Chicken', 'Grilled chicken, BBQ sauce, red onions', 15.99, 'Specialty', false, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828'),
('Four Cheese', 'Mozzarella, cheddar, parmesan, gorgonzola', 14.49, 'Classic', true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591')
ON CONFLICT DO NOTHING;