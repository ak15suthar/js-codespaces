import React from 'react';

const testimonials = [
  {
    name: 'Priya S.',
    review:
      'Absolutely loved the Margherita! Fast delivery and the crust was perfect. Will order again!',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Rahul M.',
    review:
      'The best Pepperoni pizza I’ve had in the city. Great service and friendly staff!',
    img: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    name: 'Ayesha K.',
    review:
      'Veggie Supreme is my new favorite. Loved the fresh toppings and quick delivery.',
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-red-100" />
              <p className="text-gray-700 italic mb-4 text-center">“{t.review}”</p>
              <span className="font-semibold text-red-600">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
