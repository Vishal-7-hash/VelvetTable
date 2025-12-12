import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMyBookings, fetchRestaurants } from '../../services/api';
import RestaurantCard from '../../components/public/RestaurantCard';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [bookingsData, restaurantsData] = await Promise.all([
          fetchMyBookings(),
          fetchRestaurants()
        ]);
        setBookings(bookingsData.data);
        setRestaurants(restaurantsData.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const now = new Date();

  // ⭐ Separate bookings into three categories
  const upcomingBookings = bookings.filter(b => new Date(b.booking_time) >= now && b.status !== 'cancelled');
  const recentBookings = bookings.filter(b => new Date(b.booking_time) < now && b.status !== 'cancelled');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled'); // ⭐ NEW

  const renderBookings = (bookingList) => {
    if (bookingList.length === 0) {
      return <p style={{ marginTop: '2rem', textAlign: 'center' }}>You have no bookings in this category.</p>;
    }

    return (
      <div className="bookings-list">
        {bookingList.map(booking => {
          const imageUrl = booking.restaurant_image
            ? `http://localhost:5000/${booking.restaurant_image.replace(/\\/g, "/")}`
            : "https://via.placeholder.com/150x100";

          return (
            <div key={booking.id} className="booking-card-item">
              <img
                src={imageUrl}
                alt={booking.restaurant_name || "Restaurant"}
                onError={(e) => { e.target.src = "https://via.placeholder.com/150x100"; }}
              />
              <div className="booking-card-details">
                <p>Booking ID: {booking.ticket_id || booking.id}</p>
                <h3>{booking.restaurant_name}</h3>
                <p>{new Date(booking.booking_time).toLocaleString()}</p>
                {/* ⭐ Optionally show booking status */}
                <p className={`status ${booking.status}`}>{booking.status}</p>
              </div>
              <div className="booking-card-actions">
                <button className="btn">View Details</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="container"><h1>Loading your dashboard...</h1></div>;
  }

  return (
    <div className="container">
      <h1>Welcome back, {user?.name}!</h1>

      <div className="customer-dashboard-content">
        <h2>Your Bookings</h2>

        {/* ⭐ Tabs updated */}
        <div className="tabs">
          <button
            className={activeTab === 'upcoming' ? 'tab tab-active' : 'tab'}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={activeTab === 'recent' ? 'tab tab-active' : 'tab'}
            onClick={() => setActiveTab('recent')}
          >
            Completed
          </button>
          <button
            className={activeTab === 'cancelled' ? 'tab tab-active' : 'tab'}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* ⭐ Conditional rendering based on tab */}
        {activeTab === 'upcoming' && renderBookings(upcomingBookings)}
        {activeTab === 'recent' && renderBookings(recentBookings)}
        {activeTab === 'cancelled' && renderBookings(cancelledBookings)}
      </div>

      <div className="dashboard-explore">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Trending Restaurants</h2>
          <Link to="/explore" className="btn">View All</Link>
        </div>
        <div className="restaurant-grid">
          {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
