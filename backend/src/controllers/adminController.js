const { Order, User } = require('../models');

const getAllOrders = async (req, res) => {
  try {
    // Get all orders with user information
    const orders = await Order.find({}, { sort: 'status,created_at DESC' });
    
    // Populate user information for each order
    for (const order of orders) {
      if (order.user_id) {
        await order.populate('user');
      }
    }
    
    res.json(orders);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

module.exports = {
  getAllOrders
};
