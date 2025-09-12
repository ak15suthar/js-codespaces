import React from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cart } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const activeClass =
    "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold transition";
  const inactiveClass =
    "text-gray-700 hover:text-red-600 px-4 py-2 rounded font-semibold transition";

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-red-600 hover:text-red-700 transition"
            >
              🍕 PizzaShop
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated() && !isAdmin() && (
              <>
                <button
                  className="relative flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition"
                  onClick={() => navigate("/checkout")}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-9V6a2 2 0 10-4 0v3m4 0H9"
                    ></path>
                  </svg>
                  Cart
                  <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
                    {cart.length}
                  </span>
                </button>
                <button
                  className="relative flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded transition ml-2"
                  onClick={() => navigate("/orders")}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-7z"
                    ></path>
                  </svg>
                  History
                </button>
              </>
            )}
            {isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded transition ${
                    location.pathname === "/login"
                      ? "bg-red-100 text-red-700"
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 text-sm font-medium rounded transition ${
                    location.pathname === "/signup"
                      ? "bg-red-600 text-white"
                      : "bg-red-500 text-white hover:bg-red-700"
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
