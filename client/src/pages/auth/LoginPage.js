import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginUser } from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginUser(formData);
            login(data);
            if (data.role === 'owner') {
                navigate('/owner/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h1>Login to your account! </h1>
                <p>Please login to your account.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username or Email</label>
                        <input type="email" name="email" placeholder="e.g., foodie@example.com" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div className="auth-links">
                    <span>Don't have an account? <Link to="/register">Sign up</Link></span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;