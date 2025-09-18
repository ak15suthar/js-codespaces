const { query } = require("../config/database");
const bcrypt = require("bcryptjs");

const initDatabase = async () => {
  try {
    console.log("🚀 Initializing PostgreSQL database...");

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
    console.log("✅ Users table created");

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
    console.log("✅ Pizzas table created");

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
    console.log("✅ Orders table created");

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
    console.log("✅ Order items table created");

    // Create indexes
    await query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
    await query(
      "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)"
    );
    await query(
      "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)"
    );
    await query(
      "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)"
    );
    await query(
      "CREATE INDEX IF NOT EXISTS idx_pizzas_category ON pizzas(category)"
    );
    await query(
      "CREATE INDEX IF NOT EXISTS idx_pizzas_available ON pizzas(available)"
    );
    console.log("✅ Indexes created");

    // Seed initial data
    console.log("🌱 Seeding initial data...");

    // Check if admin user exists
    const adminCheck = await query("SELECT * FROM users WHERE email = $1", [
      "admin@admin.com",
    ]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await query(
        "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5)",
        [
          "Admin User",
          "admin@admin.com",
          "123 Admin Street",
          hashedPassword,
          "admin",
        ]
      );
      console.log("✅ Admin user created (admin@admin.com / password123)");
    }

    // Check if regular user exists
    const userCheck = await query("SELECT * FROM users WHERE email = $1", [
      "user@user.com",
    ]);
    if (userCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await query(
        "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5)",
        [
          "Regular User",
          "user@user.com",
          "456 User Avenue",
          hashedPassword,
          "user",
        ]
      );
      console.log("✅ Regular user created (user@user.com / password123)");
    }

    // Check if pizzas exist
    const pizzaCheck = await query("SELECT COUNT(*) FROM pizzas");
    if (parseInt(pizzaCheck.rows[0].count) === 0) {
      // Dynamic pizza seeding (40 pizzas)
      const pizzaNames = [
        "Margherita",
        "Pepperoni",
        "Hawaiian",
        "Veggie Delight",
        "BBQ Chicken",
        "Spicy Paneer",
        "Cheese Burst",
        "Mushroom Magic",
        "Tandoori Chicken",
        "Farmhouse",
        "Mexican Green Wave",
        "Double Cheese",
        "Chicken Sausage",
        "Peppy Paneer",
        "Deluxe Veggie",
        "Peri Peri Chicken",
        "Corn & Cheese",
        "Italian Supreme",
        "Classic Tomato",
        "Smoky BBQ Veg",
      ];
      const pizzaImages = [
        "pizza1.jpeg",
        "pizza2.jpeg",
        "pizza3.jpeg",
        "pizza4.jpeg",
      ];
      const vegIngredients = [
        ["Cheese", "Tomato", "Capsicum"],
        ["Paneer", "Onion", "Peppers"],
        ["Mushroom", "Corn", "Olives"],
        ["Spinach", "Tomato", "Cheese"],
        ["Jalapeno", "Cheese", "Onion"],
      ];
      const nonVegIngredients = [
        ["Chicken", "Cheese", "Onion"],
        ["Pepperoni", "Cheese", "Tomato"],
        ["Ham", "Pineapple", "Cheese"],
        ["Chicken Sausage", "Peppers", "Cheese"],
        ["BBQ Chicken", "Onion", "Cheese"],
      ];
      function isVegPizza(name) {
        const nonVegKeywords = ["chicken", "pepperoni"];
        const lowerName = name.toLowerCase();
        return !nonVegKeywords.some((keyword) => lowerName.includes(keyword));
      }
      const pizzas = [];
      for (let i = 0; i < 50; i++) {
        const baseName = pizzaNames[i % pizzaNames.length];
        const name = baseName + " " + Math.floor(Math.random() * 1000);
        const isVeg = isVegPizza(baseName);
        const image =
          pizzaImages[Math.floor(Math.random() * pizzaImages.length)];
        const ingredients = isVeg
          ? vegIngredients[Math.floor(Math.random() * vegIngredients.length)]
          : nonVegIngredients[
              Math.floor(Math.random() * nonVegIngredients.length)
            ];
        const price = (Math.floor(Math.random() * 400) + 100) / 10; // 10.0 to 49.9
        const category = isVeg ? "Vegetarian" : "Non-Vegetarian";
        const description = `${baseName} pizza with ${ingredients.join(", ")}`;
        pizzas.push({
          name,
          ingredients,
          price,
          image,
          veg: isVeg,
          category,
          description,
        });
      }
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
            pizza.description,
          ]
        );
      }
      console.log(`✅ ${pizzas.length} pizzas added`);
    }

    console.log("🎉 Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
