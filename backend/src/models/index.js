// PostgreSQL-only models
const User = require('./User.pg');
const Pizza = require('./Pizza.pg'); 
const Order = require('./Order.pg');

// Log that we're using PostgreSQL models
if (process.env.NODE_ENV === 'development') {
  console.log('Using PostgreSQL models');
}

module.exports = {
  User,
  Pizza,
  Order
};