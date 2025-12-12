const pool = require('../config/db');
const { randomBytes } = require('crypto');
const QRCode = require('qrcode');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    const { restaurantId, bookingTime, numGuests } = req.body;
    const userId = req.user.id;

    if (!restaurantId || !bookingTime || !numGuests) {
        return res.status(400).json({ message: 'Please provide all booking details' });
    }

    try {
        const ticketId = randomBytes(4).toString('hex').toUpperCase();

        const [result] = await pool.query(
            'INSERT INTO bookings (user_id, restaurant_id, booking_time, num_guests, status, ticket_id) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, restaurantId, bookingTime, numGuests, 'confirmed', ticketId]
        );
        const bookingId = result.insertId;

        const qrCodeData = JSON.stringify({ bookingId, ticketId, userId, restaurantId });
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        
        await pool.query('UPDATE bookings SET qr_code_url = ? WHERE id = ?', [qrCodeUrl, bookingId]);

        res.status(201).json({ message: 'Booking successful!', bookingId, ticketId });



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating booking' });
    }
};


// @desc    Get bookings for logged in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT 
                b.id, b.booking_time, b.num_guests, b.status, b.ticket_id,
                r.name as restaurant_name,
                (SELECT i.image_url FROM restaurant_images i WHERE i.restaurant_id = r.id LIMIT 1) as restaurant_image
            FROM bookings b
            JOIN restaurants r ON b.restaurant_id = r.id
            WHERE b.user_id = ?
            ORDER BY b.booking_time DESC
        `, [req.user.id]);
        

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Add this new function to the file
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        // In a real app, you'd also check if the user has permission (is the owner, admin, or the user who booked)
        await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
        res.json({ message: "Booking cancelled successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};