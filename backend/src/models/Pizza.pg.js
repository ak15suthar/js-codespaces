const { query } = require('../config/database');

class Pizza {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.ingredients = data.ingredients;
    this.price = parseFloat(data.price);
    this.available = data.available !== undefined ? data.available : true;
    this.image = data.image;
    this.veg = data.veg !== undefined ? data.veg : false;
    this.category = data.category;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new pizza
  static async create(pizzaData) {
    const { 
      name, 
      ingredients = [], 
      price, 
      available = true, 
      image, 
      veg = false,
      category,
      description 
    } = pizzaData;
    
    const result = await query(
      `INSERT INTO pizzas (name, ingredients, price, available, image, veg, category, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, JSON.stringify(ingredients), price, available, image, veg, category, description]
    );
    
    const pizza = result.rows[0];
    pizza.ingredients = JSON.parse(pizza.ingredients || '[]');
    return new Pizza(pizza);
  }

  // Find all pizzas with filters and pagination
  static async find(filter = {}, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sortOrder = 'asc',
      available,
      veg,
      category,
      minPrice,
      maxPrice
    } = { ...filter, ...options };

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Build WHERE conditions
    if (available !== undefined) {
      conditions.push(`available = $${params.length + 1}`);
      params.push(available);
    }

    if (veg !== undefined) {
      conditions.push(`veg = $${params.length + 1}`);
      params.push(veg);
    }

    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (minPrice !== undefined) {
      conditions.push(`price >= $${params.length + 1}`);
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      conditions.push(`price <= $${params.length + 1}`);
      params.push(maxPrice);
    }

    let queryText = 'SELECT * FROM pizzas';
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    queryText += ` ORDER BY price ${sortDirection}, name ASC`;

    // Add pagination
    queryText += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    
    return result.rows.map(row => {
      row.ingredients = JSON.parse(row.ingredients || '[]');
      return new Pizza(row);
    });
  }

  // Find pizza by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM pizzas WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const pizza = result.rows[0];
    pizza.ingredients = JSON.parse(pizza.ingredients || '[]');
    return new Pizza(pizza);
  }

  // Find one pizza by filter
  static async findOne(filter) {
    const conditions = [];
    const params = [];

    if (filter.name) {
      conditions.push(`name = $${params.length + 1}`);
      params.push(filter.name);
    }

    if (filter.id) {
      conditions.push(`id = $${params.length + 1}`);
      params.push(filter.id);
    }

    let queryText = 'SELECT * FROM pizzas';
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' LIMIT 1';

    const result = await query(queryText, params);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const pizza = result.rows[0];
    pizza.ingredients = JSON.parse(pizza.ingredients || '[]');
    return new Pizza(pizza);
  }

  // Update pizza
  async save() {
    const result = await query(
      `UPDATE pizzas 
       SET name = $1, ingredients = $2, price = $3, available = $4, 
           image = $5, veg = $6, category = $7, description = $8, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        this.name, 
        JSON.stringify(this.ingredients), 
        this.price, 
        this.available,
        this.image, 
        this.veg, 
        this.category, 
        this.description, 
        this.id
      ]
    );
    
    if (result.rows.length > 0) {
      const pizza = result.rows[0];
      pizza.ingredients = JSON.parse(pizza.ingredients || '[]');
      Object.assign(this, pizza);
    }
    
    return this;
  }

  // Delete pizza
  async remove() {
    await query('DELETE FROM pizzas WHERE id = $1', [this.id]);
  }

  // Count pizzas
  static async countDocuments(filter = {}) {
    const params = [];
    const conditions = [];

    if (filter.available !== undefined) {
      conditions.push(`available = $${params.length + 1}`);
      params.push(filter.available);
    }

    if (filter.veg !== undefined) {
      conditions.push(`veg = $${params.length + 1}`);
      params.push(filter.veg);
    }

    if (filter.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(filter.category);
    }

    let queryText = 'SELECT COUNT(*) FROM pizzas';
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }

  // Update many pizzas
  static async updateMany(filter, update) {
    const setClause = [];
    const params = [];

    // Build SET clause
    if (update.available !== undefined) {
      setClause.push(`available = $${params.length + 1}`);
      params.push(update.available);
    }

    if (update.price !== undefined) {
      setClause.push(`price = $${params.length + 1}`);
      params.push(update.price);
    }

    // Build WHERE clause
    const conditions = [];
    if (filter.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(filter.category);
    }

    if (filter.veg !== undefined) {
      conditions.push(`veg = $${params.length + 1}`);
      params.push(filter.veg);
    }

    let queryText = `UPDATE pizzas SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP`;
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(queryText, params);
    return { modifiedCount: result.rowCount };
  }
}

// Create the pizzas table if it doesn't exist
const createTable = async () => {
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
  
  // Create indexes
  await query(`
    CREATE INDEX IF NOT EXISTS idx_pizzas_category ON pizzas(category)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_pizzas_available ON pizzas(available)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_pizzas_veg ON pizzas(veg)
  `);
};

// Initialize table on module load
createTable().catch(console.error);

module.exports = Pizza;