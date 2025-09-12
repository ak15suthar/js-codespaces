const { Order } = require("../models");
const { simulateDeliveryUpdate } = require("../services/delivery.service.js");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Get order history for logged-in user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id || req.user._id }, { sort: '-created_at' });
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Get details for a specific order (only if owned by user)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    // Check if order belongs to user
    if (order && order.user_id !== (req.user.id || req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, totalAmount } = req.body;

    if (!items || !deliveryAddress || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.create({
      user_id: req.user.id || req.user._id,
      items,
      delivery_address: deliveryAddress,
      total_amount: totalAmount,
      status: "pending",
      customer_name: req.user.name,
      customer_email: req.user.email,
    });

    // Simulate delivery updates
    simulateDeliveryUpdate(order.id || order._id);

    res.status(201).json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  getMyOrders,
  getOrderById,
};
