import React, { useState, useEffect } from 'react';
import { fetchRestaurants } from '../../services/api';
import RestaurantCard from '../../components/public/RestaurantCard';
import './HomePage.css';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const { data } = await fetchRestaurants();
                setRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch restaurants", error);
            }
        };
        loadRestaurants();
    }, []);

    return (
        <div>
            <div className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop)' }}>
                <div className="hero-overlay"> {/* This is the new overlay */}
                    <h1>Find Your Next Meal</h1>
                    <p>Book a table at the finest restaurants in town, hassle-free.</p>
                    <div className="search-bar" style={{ maxWidth: '600px', margin: '2rem auto', display: 'flex' }}>
                        <input type="text" placeholder="Search by restaurant, cuisine, or location" style={{ flexGrow: 1, padding: '1rem' }}/>
                        <button className="btn btn-primary" style={{ borderRadius: '0 8px 8px 0' }}>Search</button>
                    </div>
                </div>
            </div>
            <div className="container featured-restaurants">
                <h2>Featured Restaurants</h2>
                <div className="restaurant-grid">
                    {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
            </div>
        </div>
    );
};

export default HomePage;