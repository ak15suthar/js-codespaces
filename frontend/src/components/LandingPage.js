import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopPizzas from './TopPizzas';
import DeliveryBanner from './DeliveryBanner';
import Testimonials from './Testimonials';

function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/menu', { replace: true });
      }
    }
  }, [navigate]);
  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-4 pt-28 pb-12 min-h-[80vh]">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Fresh, Hot & Delicious <span className="text-red-600">Pizza</span> Delivered To You
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Order your favorite pizza with a few clicks. Fast delivery, best ingredients, and mouth-watering taste. Try us now!
          </p>
          <a href="#menu" className="inline-block px-8 py-3 bg-red-600 text-white rounded shadow hover:bg-red-700 font-bold text-lg transition">
            Explore Menu
          </a>
        </div>
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
          <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" alt="Pizza" className="rounded-2xl shadow-xl w-80 md:w-[28rem]" />
        </div>
      </section>
      {/* Top Pizzas Section */}
      <TopPizzas />
      {/* Delivery Banner Section */}
      <DeliveryBanner />
      {/* Testimonials Section */}
      <Testimonials />
    </>
  );
}

export default LandingPage;
