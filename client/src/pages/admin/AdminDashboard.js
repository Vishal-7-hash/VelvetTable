import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// The 'updateRestaurantStatus' import is no longer needed here
import { fetchAllRestaurantsAdmin, fetchAllUsersAdmin, fetchAllBookingsAdmin } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('restaurants');
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [resRestaurants, resUsers, resBookings] = await Promise.all([
                fetchAllRestaurantsAdmin(),
                fetchAllUsersAdmin(),
                fetchAllBookingsAdmin()
            ]);
            setRestaurants(resRestaurants.data);
            setUsers(resUsers.data);
            setBookings(resBookings.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    // The entire 'handleStatusUpdate' function has been removed from this file.
    
    const getStatusClass = (status) => {
        if (status === 'approved') return 'status-approved';
        if (status === 'rejected') return 'status-rejected';
        return 'status-pending';
    };

    const renderRestaurantTable = (title, restaurantList) => (
        <div className="admin-table-container">
            <h2>{title}</h2>
            {restaurantList.length === 0 ? <p>No restaurants in this category.</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Restaurant Name</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurantList.map(r => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.owner_name}</td>
                                <td><span className={`status-badge ${getStatusClass(r.status)}`}>{r.status}</span></td>
                                <td className="action-buttons">
                                    <Link to={`/admin/review/${r.id}`} className="btn">
                                        {r.status === 'pending' ? 'Review' : 'View'}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
    
    if (loading) {
        return <div className="container"><h2>Loading Admin Dashboard...</h2></div>;
    }

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <div className="tabs">
                <button className={activeTab === 'restaurants' ? 'tab tab-active' : 'tab'} onClick={() => setActiveTab('restaurants')}>
                    Restaurant Management
                </button>
                <button className={activeTab === 'users' ? 'tab tab-active' : 'tab'} onClick={() => setActiveTab('users')}>
                    User Management
                </button>
                <button className={activeTab === 'bookings' ? 'tab tab-active' : 'tab'} onClick={() => setActiveTab('bookings')}>
                    All Bookings
                </button>
            </div>

            {activeTab === 'restaurants' && (
                <div className="restaurant-management">
                    {renderRestaurantTable("Pending Requests", restaurants.filter(r => r.status === 'pending'))}
                    {renderRestaurantTable("Approved Restaurants", restaurants.filter(r => r.status === 'approved'))}
                    {renderRestaurantTable("Rejected Restaurants", restaurants.filter(r => r.status === 'rejected'))}
                </div>
            )}
            
            {activeTab === 'users' && (
                 <div className="admin-table-container">
                    <h2>All Users</h2>
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'bookings' && (
                 <div className="admin-table-container">
                    <h2>All Platform Bookings</h2>
                    <table>
                        <thead>
                            <tr><th>User</th><th>Restaurant</th><th>Date & Time</th><th>Guests</th><th>Status</th></tr>
                        </thead>


                        {/* <tbody>
                            {bookings.map(b => (
                                <tr key={b.id}>
                                    <td>{b.user_name}</td>
                                    <td>{b.restaurant_name}</td>
                                    <td>{new Date(b.booking_time).toLocaleString()}</td>
                                    <td>{b.num_guests}</td>
                                    <td>{b.status}</td>
                                </tr>
                            ))}
                        </tbody> */}


<tbody>
  {bookings.map(b => {
    const bookingDate = new Date(b.booking_time);
    const now = new Date();

    let displayStatus = '';

    if (b.status === 'cancelled') {
      displayStatus = 'Cancelled';
    } else if (bookingDate > now) {
      displayStatus = 'Confirmed';
    } else {
      displayStatus = 'Completed';
    }

    return (
      <tr key={b.id}>
        <td>{b.user_name}</td>
        <td>{b.restaurant_name}</td>
        <td>{bookingDate.toLocaleString()}</td>
        <td>{b.num_guests}</td>
        <td>{displayStatus}</td>
      </tr>
    );
  })}
</tbody>


                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;