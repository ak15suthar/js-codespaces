import React from "react";
import { CartProvider } from "./components/CartContext";
import { AuthProvider } from "./components/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserLanding from "./pages/UserLanding";
import NotAuthorized from "./pages/NotAuthorized";
import RequireAuth from "./components/RequireAuth";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";

function Layout({ children }) {
  const location = useLocation();
  const showNavFooter =
    location.pathname !== "/login" && location.pathname !== "/signup";
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNavFooter && <Navbar />}
      <div className="flex-grow flex justify-center py-10">
        <div className="w-full max-w-4xl">{children}</div>
      </div>
      {showNavFooter && <Footer />}
    </div>
  );
}

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <UserLanding />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth adminOnly={true}>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrderHistory />
            </RequireAuth>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router basename={process.env.REACT_APP_BASE_PATH}>
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
