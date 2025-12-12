import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRestaurantForReview, updateRestaurantStatus } from '../../services/api';
import './AdminReviewPage.css';

const AdminReviewPage = () => {
    const [restaurant, setRestaurant] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getRestaurant = async () => {
            try {
                const { data } = await fetchRestaurantForReview(id);
                setRestaurant(data);
            } catch (error) {
                console.error("Failed to fetch restaurant for review", error);
            }
        };
        getRestaurant();
    }, [id]);

    const handleStatusUpdate = async (status) => {
        if (window.confirm(`Are you sure you want to ${status} this restaurant submission?`)) {
            try {
                await updateRestaurantStatus(id, status);
                navigate('/admin/dashboard');
            } catch (error) {
                alert(`Failed to ${status} restaurant.`);
            }
        }
    };

    if (!restaurant) return <div className="container"><p>Loading Restaurant Details...</p></div>;

    return (
        <div className="container">
            <h1>Review Submission: {restaurant.name}</h1>
            <div className="review-container">
                <div className="review-section">
                    <h3>Basic Details</h3>
                    <div className="review-item"><span>Manager:</span> <strong>{restaurant.manager_name}</strong></div>
                    <div className="review-item"><span>Type:</span> <strong>{restaurant.restaurant_type}</strong></div>
                    <div className="review-item"><span>Cuisines:</span> <strong>{restaurant.cuisine_types}</strong></div>
                    <div className="review-item"><span>Description:</span> <strong>{restaurant.description}</strong></div>
                </div>
                <div className="review-section">
                    <h3>Location & Contact</h3>
                    <div className="review-item"><span>Address:</span> <strong>{`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip_code}`}</strong></div>
                    <div className="review-item"><span>Contact:</span> <strong>{restaurant.contact_number}</strong></div>
                    <div className="review-item"><span>Email:</span> <strong>{restaurant.email}</strong></div>
                </div>
                {/* You can add more sections here to display all other data */}
            </div>
            
            {restaurant.status === 'pending' && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-approve" onClick={() => handleStatusUpdate('approved')}>Approve Submission</button>
                    <button className="btn-reject" onClick={() => handleStatusUpdate('rejected')}>Reject Submission</button>
                </div>
            )}
        </div>
    );
};

export default AdminReviewPage;