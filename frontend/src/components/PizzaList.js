import React, { useEffect, useRef, useCallback, useState } from "react";
import { useCart } from "./CartContext";
import FilterButton from "./FilterButton";
import { pizzaAPI } from "../services/api";

// TODO: CANDIDATE TASK - Implement filtering, sorting, and infinite scroll
//
// Current implementation only fetches all pizzas once
// You need to implement:
// 1. State management for filters and sorting
// 2. API calls with query parameters
// 3. Infinite scroll with pagination
// 4. Loading states and error handling
//
// Expected features:
// - Filter by: All, Veg, Non-Veg
// - Sort by: Default, Price (Low to High), Price (High to Low), Name
// - Search functionality
// - Infinite scroll loading
// - Loading spinners
// - Error handling

function PizzaList() {
  const { cart, addToCart } = useCart();
  const [pizzas, setPizzas] = useState([]);

  // TODO: Add state for filters, sorting, pagination, loading, etc.

  // TODO: Replace this basic fetch with comprehensive filtering/sorting/pagination
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const data = await pizzaAPI.getAll();
        setPizzas(data);
      } catch (e) {
        console.error('Error fetching pizzas:', e);
        setPizzas([]);
      }
    };
    fetchPizzas();
  }, []);

  // TODO: Implement fetchPizzas with query parameters

  return (
    <div className="max-w-2xl mx-auto">
      {/* TODO: CANDIDATE TASK - Make these controls interactive */}
      {/* Current controls are static - you need to:
          1. Connect filter buttons to state
          2. Connect sort dropdown to state
          3. Trigger API calls on filter/sort changes
          4. Add loading states during API calls
      */}
      <div className="flex justify-between mb-6 gap-4 flex-wrap items-center">
        <div className="flex gap-2 mb-2 sm:mb-0">
          {/* TODO: Make filter buttons interactive */}
          <FilterButton text="All" active={true} />
          <FilterButton text="Veg" active={false} />
          <FilterButton text="Non-Veg" active={false} />
        </div>

        <div className="ml-4">
          {/* TODO: Make sort dropdown interactive */}
          <select
            className="px-4 py-2 rounded-full border font-semibold text-gray-700 bg-white shadow focus:outline-none cursor-default"
            value="default"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pizzas.map((pizza, index) => (
          <div
            key={pizza._id || pizza.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:scale-[1.03] transition-transform"
          >
            <div className="relative w-full h-40">
              <img
                src={
                  pizza.image
                    ? `./${pizza.image}`
                    : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
                }
                alt={pizza.name}
                className="w-full h-40 object-cover"
              />
              {/* Veg/Non-Veg Icon Overlay */}
              {pizza.veg ? (
                <span
                  title="Veg"
                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow"
                >
                  <span className="block w-3 h-3 bg-green-600 rounded-full border-2 border-green-800" />
                </span>
              ) : (
                <span
                  title="Non-Veg"
                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow"
                >
                  <span className="block w-3 h-3 bg-red-600 rounded-full border-2 border-red-800" />
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pizza.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {pizza.ingredients?.join(", ")}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold text-red-600">
                  ₹{pizza.price}
                </span>
                {cart.some(
                  (item) => (item._id || item.id) === (pizza._id || pizza.id)
                ) ? (
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-full font-semibold cursor-not-allowed"
                    disabled
                  >
                    In Cart
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold shadow"
                    onClick={() => addToCart(pizza)}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Add loading state for infinite scroll */}
      {/* {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )} */}

      {/* TODO: Add "no more results" message */}
      {/* {!hasMore && pizzas.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No more pizzas to load
        </div>
      )} */}

      {/* TODO: Add empty state */}
      {/* {!loading && pizzas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pizzas found
        </div>
      )} */}
    </div>
  );
}

export default React.memo(PizzaList);
