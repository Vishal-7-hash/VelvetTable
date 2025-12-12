import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">VelvetTable</Link>
            <div className="nav-links">
                {user ? (
                    <div className="nav-user-info">
                        <Link to="/">Home</Link>
                        {user.role === 'customer' && <Link to="/dashboard">My Bookings</Link>}
                        {user.role === 'owner' && <Link to="/owner/dashboard">Dashboard</Link>}
                        {user.role === 'admin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
                        <span className="nav-username">Welcome, {user.name} ({user.role})</span>
                        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                    </div>
                ) : (
                    <>
                        <Link to="/">Home</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;