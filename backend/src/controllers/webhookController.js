const { Order } = require('../models');
const mongoose = require('mongoose')

const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [], // Final state
  cancelled: [], // Final state
};

function checkObjId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

const deliveryUpdate = async (req, res) => {
  console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));
  
  try {
    const { orderId, status, timestamp } = req.body;
    
    if (!orderId || !status || !timestamp) {
      return res.status(400).json({ message: "Missing orderId or status or timestamp" });
    }

    if(!checkObjId(orderId)){
      return res.status(400).json({ message: "Invalid orderId" });

    }
    
    // Find and update the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const curr = order.status;
    const allowedNex = allowedTransitions(curr) || [];
    if(curr === status){
      order.statusUpdatdeAt = new Date(timestamp);
      await order.save();
      return res.json({
        msg:' Order status already set',
        orderId,
        newStatus: status
      })
    }

    if(!allowedNex.includes(status)) {
      return res.status(409).json({
        msg:'invalid status transaction'
      })
    }


    // Update order status
    await order.updateStatus(status);
    
    res.status(200).json({ 
      message: "Order status updated successfully",
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
