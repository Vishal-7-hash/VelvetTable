const express = require('express');
const router = express.Router();
const { getOwnerBookings, getOwnerReviews } = require('../controllers/ownerController');
const { protect, isOwner } = require('../middleware/authMiddleware');

router.use(protect, isOwner); // Protect all routes in this file

router.get('/bookings', getOwnerBookings);
router.get('/reviews', getOwnerReviews);

module.exports = router;