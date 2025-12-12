const pool = require('../config/db');

// @desc    Create a new review for a restaurant
// @route   POST /api/reviews
// @access  Private (customer)
exports.createReview = async (req, res) => {
    const { restaurantId, rating, reviewText } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !rating) {
        return res.status(400).json({ message: 'Restaurant ID and rating are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO reviews (restaurant_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
            [restaurantId, userId, rating, reviewText]
        );
        res.status(201).json({ message: 'Review submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while submitting review.' });
    }
};

// @desc    Get all reviews for a specific restaurant
// @route   GET /api/reviews/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.rating, r.review_text, r.created_at, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.restaurantId]);
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
};