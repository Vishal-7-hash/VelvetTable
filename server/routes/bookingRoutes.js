const express = require('express');
const router = express.Router();
const { getMyBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
// ...

router.route('/my-bookings').get(protect, getMyBookings);
router.route('/').post(protect, createBooking);
router.route('/:bookingId/cancel').put(protect, cancelBooking); // 2. Add route

module.exports = router;

