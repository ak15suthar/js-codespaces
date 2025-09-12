const { Order } = require('../models');

const deliveryUpdate = async (req, res) => {
  console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));
  
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ message: "Missing orderId or status" });
    }
    
    // Find and update the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Update order status
    await order.updateStatus(status);
    
    res.status(200).json({ 
      message: "Webhook processed successfully",
      orderId: order.id,
      newStatus: order.status
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ 
      message: "Failed to process webhook",
      error: error.message 
    });
  }
};

module.exports = {
  deliveryUpdate,
};
