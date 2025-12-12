import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyRestaurants } from '../../services/api';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('approved');
    const navigate = useNavigate();

    useEffect(() => {
        const loadRestaurants = async () => {
            setLoading(true);
            try {
                const { data } = await fetchMyRestaurants();
                setAllRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch owner's restaurants", error);
            } finally {
                setLoading(false);
            }
        };
        loadRestaurants();
    }, []);

    const getStatusClass = (status) => {
        if (status === 'approved') return 'status-approved';
        if (status === 'rejected') return 'status-rejected';
        return 'status-pending';
    };

    const renderRestaurantList = (restaurants) => {
        if (restaurants.length === 0) {
            return (
                <div className="empty-state">
                    <p>No restaurants in this category.</p>
                    <Link to="/owner/add-restaurant" className="btn btn-primary">
                        Add a Restaurant
                    </Link>
                </div>
            );
        }

        return (
            <div className="restaurant-list">
                {restaurants.map((r) => {
                    // Use a root-relative path. The development server proxy will handle routing it to the backend.
                   const logoUrl = r.logo_image_url
    ? `http://localhost:5000/${r.logo_image_url.replace(/\\/g, '/')}`
    : 'https://via.placeholder.com/150x100';

                    return (
                        <div key={r.id} className="restaurant-list-item">
                            <img
                                src={logoUrl}
                                alt={r.name}
                                className="restaurant-list-image"
                                onError={e => { e.target.src = 'https://via.placeholder.com/150x100'; }}
                            />
                            <div className="restaurant-info">
                                <h3>{r.name}</h3>
                                <p>{r.description || 'No description provided.'}</p>
                            </div>
                            <div className="restaurant-actions">
                                <span className={`status-badge ${getStatusClass(r.status)}`}>
                                    {r.status}
                                </span>
                                {r.status === 'approved' && (
                                    <button className="btn" onClick={() => navigate(`/owner/edit-restaurant/${r.id}`)}>
                                        Manage Restaurant
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const approved = allRestaurants.filter((r) => r.status === 'approved');
    const pending = allRestaurants.filter((r) => r.status === 'pending');
    const rejected = allRestaurants.filter((r) => r.status === 'rejected');

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-content">
                <h1>Dashboard</h1>
                <div className="tabs">
                    <button
                        className={activeTab === 'approved' ? 'tab tab-active' : 'tab'}
                        onClick={() => setActiveTab('approved')}
                    >
                        Approved ({approved.length})
                    </button>
                    <button
                        className={activeTab === 'pending' ? 'tab tab-active' : 'tab'}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pending.length})
                    </button>
                    <button
                        className={activeTab === 'rejected' ? 'tab tab-active' : 'tab'}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected ({rejected.length})
                    </button>
                </div>
                {loading && <p>Loading your restaurants...</p>}
                {!loading && (
                    <div style={{ marginTop: '2rem' }}>
                        {activeTab === 'approved' && renderRestaurantList(approved)}
                        {activeTab === 'pending' && renderRestaurantList(pending)}
                        {activeTab === 'rejected' && renderRestaurantList(rejected)}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;
