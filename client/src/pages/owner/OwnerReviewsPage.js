import React, { useState, useEffect } from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import { fetchOwnerReviews } from '../../services/api';

const OwnerReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        const getReviews = async () => {
            const { data } = await fetchOwnerReviews();
            setReviews(data);
        };
        getReviews();
    }, []);

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-content">
                <h1>Customer Reviews</h1>
                <div className="admin-table-container">
                    <table>
                        <thead>
                            <tr><th>User</th><th>Restaurant</th><th>Rating</th><th>Review</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            {reviews.map(r => (
                                <tr key={r.id}>
                                    <td>{r.user_name}</td>
                                    <td>{r.restaurant_name}</td>
                                    <td>{'★'.repeat(r.rating)}</td>
                                    <td>{r.review_text}</td>
                                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};
export default OwnerReviewsPage;