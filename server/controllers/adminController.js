const pool = require('../config/db');

// @desc    Get all restaurants, filterable by status
// @route   GET /api/admin/restaurants
// @access  Private/Admin
exports.getAllRestaurants = async (req, res) => {
    try {
        // This query joins with the users table to get the owner's name
        const [restaurants] = await pool.query(`
            SELECT r.*, u.name as owner_name 
            FROM restaurants r
            JOIN users u ON r.owner_id = u.id
            ORDER BY r.created_at DESC
        `);
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a restaurant's status (approve/reject)
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private/Admin
exports.updateRestaurantStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        await pool.query('UPDATE restaurants SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Restaurant has been ${status}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Add this function at the end of the file
exports.getAllBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT 
                b.id, b.booking_time, b.num_guests, b.status,
                u.name as user_name, 
                r.name as restaurant_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN restaurants r ON b.restaurant_id = r.id
            ORDER BY b.booking_time DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getRestaurantForReview = async (req, res) => {
    try {
        const [restaurants] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [req.params.id]);
        if (restaurants.length === 0) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurants[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};