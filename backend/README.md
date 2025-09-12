# Pizza Shop Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (already scaffolded) and set your MongoDB URI and PORT.
3. Start the server:
   ```bash
   npm run dev
   ```

## Features
- Express + Mongoose
- Webhook endpoint (`/api/webhook/delivery-update`) with 5s simulated delay
- Example middleware
- Example Pizza and Order models

---

# 🎯 **FEATURE 3: Webhook Implementation**

**Time Estimate**: 20-30 minutes

## 🎬 What You're Building

You'll implement a robust webhook system that lets external delivery services update order status in real-time:

- Receive webhook calls from delivery partners
- Validate order status transitions
- Update order records with proper error handling
- Log status changes for debugging

## 📊 Expected Webhook Payload

The delivery service will send payloads like this:

```json
{
  "orderId": "60d5f484f4b7a5b8c8f8e123",
  "status": "confirmed",
  "estimatedDeliveryTime": "2024-03-15T18:30:00Z",
  "deliveryNotes": "Order confirmed by restaurant",
  "timestamp": "2024-03-15T17:45:00Z"
}
```

## 🔧 Backend Implementation

**File**: `backend/src/controllers/webhookController.js`

### Implementation Requirements:

#### **1. Payload Validation**
- [ ] Validate required fields: `orderId`, `status`, `timestamp`
- [ ] Verify orderId is valid MongoDB ObjectId
- [ ] Return 400 for missing/invalid fields

#### **2. Order Status Management**
- [ ] Find order by ID (return 404 if not found)
- [ ] Validate status transitions using allowed rules
- [ ] Update order status and optional fields
- [ ] Save statusUpdatedAt timestamp

#### **3. Status Transition Rules**
```javascript
const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [], // Final state
  cancelled: [] // Final state
};
```

#### **4. Error Handling**
- [ ] **400 Bad Request**: Missing required fields
- [ ] **404 Not Found**: Order not found
- [ ] **409 Conflict**: Invalid status transition
- [ ] **500 Internal Server Error**: Database errors

#### **5. Response Format**
```json
{
  "message": "Order status updated successfully",
  "orderId": "60d5f484f4b7a5b8c8f8e123",
  "newStatus": "confirmed"
}
```

### Test Your Backend:

```bash
# Test webhook endpoint
npm run webhook:test
```

## ✅ Success Criteria

**You'll know it's working when:**

1. Valid status updates succeed (pending → confirmed)
2. Invalid transitions are rejected (delivered → pending) 
3. Missing order IDs return 404
4. Missing required fields return 400
5. Database errors are handled gracefully

## 🧪 Quick Verification

1. Start server: `npm run dev`
2. Create an order (use frontend or admin panel)
3. Test valid transition: `pending → confirmed`
4. Test invalid transition: `confirmed → pending` (should fail)
5. Test missing order: use fake order ID (should return 404)
6. Check logs for webhook activity

## ⚠️ Common Gotchas

- Import Order model: `const Order = require('../models/Order')`
- Check transitions before updating status
- Use try/catch for database operations
- Return appropriate HTTP status codes
- Validate required fields before processing
- Don't allow backwards status transitions

## 🔗 API Examples

```bash
# Valid status update (pending → confirmed)
curl -X POST http://localhost:5000/api/webhook/delivery-update \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "60d5f484f4b7a5b8c8f8e123",
    "status": "confirmed",
    "timestamp": "2024-03-15T17:45:00Z"
  }'

# Invalid transition test (should return 409)
curl -X POST http://localhost:5000/api/webhook/delivery-update \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "60d5f484f4b7a5b8c8f8e123",
    "status": "pending",
    "timestamp": "2024-03-15T17:45:00Z"
  }'

# Missing fields test (should return 400)
curl -X POST http://localhost:5000/api/webhook/delivery-update \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "60d5f484f4b7a5b8c8f8e123"
  }'

# Non-existent order test (should return 404)
curl -X POST http://localhost:5000/api/webhook/delivery-update \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "000000000000000000000000",
    "status": "confirmed", 
    "timestamp": "2024-03-15T17:45:00Z"
  }'
```
