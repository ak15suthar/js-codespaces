import React from 'react';

function DeliveryBanner() {
  return (
    <section className="bg-red-50 py-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🚚</span>
          <span className="text-lg md:text-2xl font-bold text-red-700">Super Fast Delivery</span>
        </div>
        <div className="text-gray-700 text-md md:text-lg text-center md:text-left">
          Get your pizza delivered hot and fresh in under 30 minutes, or it’s free!
        </div>
      </div>
    </section>
  );
}

export default DeliveryBanner;
