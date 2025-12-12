const express = require('express');
const router = express.Router();
const { 
    getAllRestaurants, 
    updateRestaurantStatus, 
    getAllUsers, 
    getAllBookings,
    getRestaurantForReview // Make sure this is imported
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

router.use(protect, isAdmin);

router.get('/restaurants', getAllRestaurants);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.get('/restaurants/:id', getRestaurantForReview); // This route was missing
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);

module.exports = router;