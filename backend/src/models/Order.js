const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // TODO: Add user field - ObjectId reference to User model (required)
    
    // TODO: Add items field - Array of mixed type objects containing:
    // - id (Pizza ID)
    // - name (Pizza name) 
    // - price (Pizza price)
    // - quantity (Quantity ordered)
    
    // TODO: Add status field - String enum with values:
    // - "pending" (default)
    // - "confirmed"
    // - "preparing" 
    // - "out_for_delivery"
    // - "delivered"
    // - "cancelled"
    
    // TODO: Add deliveryAddress field - String (required)
    
    // TODO: Add totalAmount field - Number (required)
  },
  {
    timestamps: true, // This will auto-generate createdAt and updatedAt
  }
);

// TODO: Add validation to ensure items array is not empty

// TODO: Add pre-save middleware to validate totalAmount matches sum of item prices

// TODO: Add instance method to check if order can be modified

// TODO: Add static method to find orders by user with pagination

module.exports = mongoose.model("Order", orderSchema);