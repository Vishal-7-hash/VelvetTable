import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';

// Public Pages
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import RestaurantDetailPage from './pages/public/RestaurantDetailPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddRestaurantPage from './pages/owner/AddRestaurantPage';
import EditRestaurantPage from './pages/owner/EditRestaurantPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewPage from './pages/admin/AdminReviewPage';

// This component protects routes that require a user to be logged in and have a specific role
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="container"><h1>Loading...</h1></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes - Accessible to everyone */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Customer-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/booking/confirmed" element={<BookingConfirmationPage />} />
          </Route>

          {/* Owner-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/add-restaurant" element={<AddRestaurantPage />} />
            <Route path="/owner/edit-restaurant/:id" element={<EditRestaurantPage />} />
            <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
            <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
          </Route>

          {/* Admin-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/review/:id" element={<AdminReviewPage />} />
          </Route>

          {/* Fallback Route for any other URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;