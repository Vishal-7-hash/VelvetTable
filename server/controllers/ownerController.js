const pool = require('../config/db');

// @desc    Get all bookings for all restaurants of a logged-in owner
// @route   GET /api/owner/bookings
// @access  Private/Owner
exports.getOwnerBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT b.*, u.name as user_name, r.name as restaurant_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN restaurants r ON b.restaurant_id = r.id
            WHERE r.owner_id = ?
            ORDER BY b.booking_time DESC
        `, [req.user.id]);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all reviews for all restaurants of a logged-in owner
// @route   GET /api/owner/reviews
// @access  Private/Owner
exports.getOwnerReviews = async (req, res) => {
     try {
        const [reviews] = await pool.query(`
            SELECT rev.*, u.name as user_name, r.name as restaurant_name 
            FROM reviews rev
            JOIN users u ON rev.user_id = u.id
            JOIN restaurants r ON rev.restaurant_id = r.id
            WHERE r.owner_id = ?
            ORDER BY rev.created_at DESC
        `, [req.user.id]);
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};