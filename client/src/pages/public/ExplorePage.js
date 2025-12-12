import React, { useState, useEffect } from 'react';
import { fetchRestaurants } from '../../services/api';
import RestaurantCard from '../../components/public/RestaurantCard';

const ExplorePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const { data } = await fetchRestaurants();
                setRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch restaurants", error);
            } finally {
                setLoading(false);
            }
        };
        loadRestaurants();
    }, []);

    return (
        <div className="container">
            <h1>Explore All Restaurants</h1>
            <p>Find and book your next dining experience.</p>
            {loading ? (
                <p>Loading restaurants...</p>
            ) : (
                <div className="restaurant-grid" style={{ marginTop: '2rem' }}>
                    {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
            )}
        </div>
    );
};

export default ExplorePage;