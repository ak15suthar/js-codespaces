import React from 'react';

const pizzas = [
  {
    name: 'Margherita',
    desc: 'Classic delight with 100% real mozzarella cheese.',
    img: '/pizza1.jpeg',
    alt: 'Margherita Pizza',
  },
  {
    name: 'Pepperoni',
    desc: 'A timeless favorite loaded with pepperoni and cheese.',
    img: '/pizza2.jpeg',
    alt: 'Pepperoni Pizza',
  },
  {
    name: 'Veggie Supreme',
    desc: 'A garden fresh treat with bell peppers, olives, and onions.',
    img: '/pizza3.jpeg',
    alt: 'Veggie Supreme Pizza',
  },
  {
    name: 'BBQ Chicken',
    desc: 'Juicy chicken, BBQ sauce, and a smoky flavor.',
    img: '/pizza4.jpeg',
    alt: 'BBQ Chicken Pizza',
  },
];

function TopPizzas() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Top Pizza Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {pizzas.map((pizza) => (
            <div key={pizza.name} className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center">
              <img src={pizza.img} alt={pizza.name} className="w-32 h-32 rounded-full object-cover mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-red-600">{pizza.name}</h3>
              <p className="text-gray-600 text-center">{pizza.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopPizzas;
