import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerUser } from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const { data } = await registerUser(formData);
            login(data);
            navigate(data.role === 'owner' ? '/owner/dashboard' : '/dashboard');
        } catch (error) {
            console.error('Registration failed', error);
            alert('Registration failed. This email may already be in use.');
        }
    };

    return (
        <div className="register-wrapper">
            {/* Floating Icons */}
            <div className="floating-container">
                <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="burger" className="float-icon delay1" />
                <img src="https://cdn-icons-png.flaticon.com/512/590/590836.png" alt="pizza" className="float-icon delay2" />
                <img src="https://cdn-icons-png.flaticon.com/512/859/859270.png" alt="icecream" className="float-icon delay3" />
                <img src="https://cdn-icons-png.flaticon.com/512/1046/1046786.png" alt="coffee" className="float-icon delay4" />
                <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="fries" className="float-icon delay5" />
            </div>

            <div className="register-container">
                <h1>Create Your Account</h1>
                <p>Join <span className="highlight">VelvetTable</span> to discover and book the best restaurants.</p>

                <form onSubmit={handleSubmit} className="register-form-grid">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mobile No.</label>
                        <input type="tel" name="phone" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>I am a:</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="customer">Customer (I want to book tables)</option>
                            <option value="owner">Restaurant Owner</option>
                        </select>
                    </div>

                    <div className="full-width">
                        <button type="submit" className="register-btn">Register</button>
                    </div>
                </form>

                <div className="auth-links">
                    <span>Already have an account? <Link to="/login">Login</Link></span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
