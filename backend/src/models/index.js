// Model selector - automatically chooses between PostgreSQL and MongoDB models
const usePostgreSQL = process.env.DATABASE_URL || process.env.POSTGRES_HOST;

// Select the appropriate models based on database configuration
const User = usePostgreSQL 
  ? require('./User.pg') 
  : require('./User');

const Pizza = usePostgreSQL 
  ? require('./Pizza.pg') 
  : require('./Pizza');

const Order = usePostgreSQL 
  ? require('./Order.pg') 
  : require('./Order');

// Log which database models are being used
if (process.env.NODE_ENV === 'development') {
  console.log(`Using ${usePostgreSQL ? 'PostgreSQL' : 'MongoDB'} models`);
}

module.exports = {
  User,
  Pizza,
  Order
};