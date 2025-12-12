const express = require('express');
const router = express.Router();
// Assuming this middleware is correctly configured to use Multer and handle both single (logo_image) and array (gallery_images) uploads.
const upload = require('../middleware/uploadMiddleware'); 
const { 
    createRestaurant, 
    debugEcho,
    getMyRestaurants,
    getApprovedRestaurants,
    getRestaurantById,
    getRestaurantForOwner, 
    updateRestaurant 
} = require('../controllers/restaurantController');
const { protect, isOwner } = require('../middleware/authMiddleware');

// GET /api/restaurants -> Get all approved restaurants (Public)
// POST /api/restaurants -> Create a new restaurant (Owner-only)
router.route('/')
    .get(getApprovedRestaurants)
    .post(protect, isOwner, upload, createRestaurant);

// Dev-only: echo endpoint to test multipart/form-data uploads without DB side-effects
router.post('/debug/echo', upload, debugEcho);

// GET /api/restaurants/my -> Get restaurants for the logged-in owner (Owner-only)
router.route('/my').get(protect, isOwner, getMyRestaurants);

// GET /api/restaurants/owner/:id -> Get a single restaurant for the owner to edit
router.route('/owner/:id').get(protect, isOwner, getRestaurantForOwner);

// GET /api/restaurants/:id -> Get a single restaurant by ID (Public)
// PUT /api/restaurants/:id -> Update a restaurant (Owner-only)
// *** FIX: Added 'upload' middleware here to handle file updates. ***
router.route('/:id')
    .get(getRestaurantById)
    .put(protect, isOwner, upload, updateRestaurant); // <--- UPDATED LINE

module.exports = router;