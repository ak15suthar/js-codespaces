import React from 'react';
import PizzaList from '../components/PizzaList';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';

function UserLanding() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Order Your Favorite Pizza</h1>
      <PizzaList />
    </div>
  );
}

export default UserLanding;
