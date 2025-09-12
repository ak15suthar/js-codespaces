import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const data = await orderAPI.getUserOrders();
        setOrders(data);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const openOrderDetail = async (orderId) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const data = await orderAPI.getUserOrders(); // For now, just find the order from the list
      const order = data.find(o => o._id === orderId);
      setSelectedOrder(order);
    } catch (err) {
      setSelectedOrder(null);
    }
    setDetailLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-red-600">Order History</h1>
      {loading ? (
        <div className="text-center py-8 text-lg">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Items: {order.items.length} pizza(s)</p>
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-sm text-gray-500">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-red-600">
                  ₹{order.totalAmount}
                </span>
                <button
                  onClick={() => openOrderDetail(order._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl" onClick={() => setSelectedOrder(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-red-600">Order Details</h3>
            {detailLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Order #{selectedOrder._id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{item.name}</span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Delivery Address:</h4>
                  <p className="text-gray-600">{selectedOrder.deliveryAddress}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Status:</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total Amount:</span>
                  <span className="text-red-600">₹{selectedOrder.totalAmount}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
