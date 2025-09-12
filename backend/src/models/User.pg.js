const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    this.password = data.password;
    this.role = data.role || 'user';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, address, password, role = 'user' } = userData;
    
    const result = await query(
      `INSERT INTO users (name, email, address, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, email, address, password, role]
    );
    
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findOne({ email }) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Find all users
  static async find(filter = {}) {
    let queryText = 'SELECT * FROM users';
    const params = [];
    const conditions = [];

    if (filter.role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(filter.role);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows.map(row => new User(row));
  }

  // Update user
  async save() {
    const result = await query(
      `UPDATE users 
       SET name = $1, email = $2, address = $3, password = $4, role = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [this.name, this.email, this.address, this.password, this.role, this.id]
    );
    
    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }
    
    return this;
  }

  // Delete user
  async remove() {
    await query('DELETE FROM users WHERE id = $1', [this.id]);
  }

  // Count users
  static async countDocuments(filter = {}) {
    let queryText = 'SELECT COUNT(*) FROM users';
    const params = [];
    const conditions = [];

    if (filter.role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(filter.role);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Convert to plain object (for JSON responses)
  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
}

// Create the users table if it doesn't exist
const createTable = async () => {
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
  
  // Create index on email
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);
};

// Initialize table on module load
createTable().catch(console.error);

module.exports = User;