import React from 'react';
import { NavLink } from 'react-router-dom';
import './OwnerSidebar.css';

const OwnerSidebar = () => {
    return (
        <aside className="owner-sidebar">
            <nav>
                <NavLink to="/owner/dashboard">My Restaurants</NavLink>
                <NavLink to="/owner/bookings">Bookings</NavLink>
                <NavLink to="/owner/reviews">Reviews</NavLink>
                {/* Settings link removed */}
            </nav>
            <div className="sidebar-actions">
                <NavLink to="/owner/add-restaurant" className="btn btn-primary">+ Add Restaurant</NavLink>
            </div>
        </aside>
    );
};

export default OwnerSidebar;