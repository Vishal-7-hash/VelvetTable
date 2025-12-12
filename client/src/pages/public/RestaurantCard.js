import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
    // Build the full image URL safely (backend stores relative paths like 'uploads/logos/..' or 'uploads/gallery/...')
    const imageUrl = restaurant.logo_image_url
        ? `http://localhost:5000/${restaurant.logo_image_url.replace(/\\/g, '/')}`
        : 'https://placehold.co/400x250?text=No+Image';

    return (
        <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card">
            <img 
                src={imageUrl} 
                alt={restaurant.name || "Restaurant"} 
                onError={(e) => { 
                    e.target.src = 'https://placehold.co/400x250?text=No+Image'; 
                }} 
            />
            <div className="restaurant-card-content">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine_types}</p>
            </div>
        </Link>
    );
};

export default RestaurantCard;
