import React from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { orderAPI } from '../services/api';

function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  // This will be replaced with state/context in integration
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [placing, setPlacing] = React.useState(false);

  const handlePlaceOrder = async () => {
    if (!name || !address) {
      toast.error('Please fill in all fields');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const totalAmount = cart.reduce((sum, pizza) => sum + pizza.price, 0);
      const orderData = {
        items: cart.map(pizza => ({
          id: pizza._id || pizza.id,
          name: pizza.name,
          price: pizza.price,
          quantity: 1
        })),
        deliveryAddress: address,
        totalAmount
      };

      const response = await orderAPI.create(orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const totalAmount = cart.reduce((sum, pizza) => sum + pizza.price, 0);

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded">
          {cart.map((pizza, i) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>{pizza.name}</span>
              <span>₹{pizza.price}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Name</label>
        <input className="border px-2 py-1 w-full" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Address</label>
        <textarea className="border px-2 py-1 w-full" value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Payment Method</label>
        <input type="radio" checked readOnly /> Cash on Delivery
      </div>
      <button disabled={placing} className="bg-red-600 text-white px-4 py-2 rounded" onClick={handlePlaceOrder}>
        {placing ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}

export default Checkout;
