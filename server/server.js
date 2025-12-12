const path = require('path'); 
const express = require('express');
const cors = require('cors');
// Add this to the top of the file
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes'); // Import booking routes
const reviewRoutes = require('./routes/reviewRoutes'); // 1. Import new routes
const app = express();

// Middleware
app.use(cors(
    {origin: 'http://localhost:3000', credentials: true}
));
// ... after app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/logos', express.static(path.join(__dirname, 'uploads/logos')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes); // Use booking routes
app.use('/api/reviews', reviewRoutes); // 2. Use new routes
const PORT = process.env.PORT || 5000;

// ...
const ownerRoutes = require('./routes/ownerRoutes'); // 1. Import

// ...
app.use('/api/reviews', reviewRoutes);
app.use('/api/owner', ownerRoutes); // 2. Use

// ...
// Add this line below your existing /uploads route
app.use('/uploads/menus', express.static(path.join(__dirname, 'uploads/menus')));
// ...
// ...

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
