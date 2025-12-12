import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  // Use localStorage
  const userInfo = localStorage.getItem('userInfo'); 
  
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

// Auth
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// Bookings
export const fetchMyBookings = () => API.get('/bookings/my-bookings');
export const createBooking = (bookingData) => API.post('/bookings', bookingData);

// Admin
export const fetchAllRestaurantsAdmin = () => API.get('/admin/restaurants');
export const updateRestaurantStatus = (id, status) => API.put(`/admin/restaurants/${id}/status`, { status });
export const fetchAllUsersAdmin = () => API.get('/admin/users');
export const fetchAllBookingsAdmin = () => API.get('/admin/bookings');

// ... existing functions ...

// Admin - Fetch a single restaurant by ID for review
export const fetchRestaurantForReview = (id) => API.get(`/admin/restaurants/${id}`); // Add this new function


// ... existing functions ...

// Reviews
export const createReview = (reviewData) => API.post('/reviews', reviewData);
export const fetchRestaurantReviews = (restaurantId) => API.get(`/reviews/${restaurantId}`);

// ... other functions ...

// Restaurants
export const fetchRestaurants = () => API.get('/restaurants');
export const fetchRestaurantById = (id) => API.get(`/restaurants/${id}`);

// THIS IS THE FIX: Changed from '/restaurants/create' to '/restaurants'
// Let the browser/axios set the Content-Type (boundary) for multipart/form-data
export const createRestaurant = (restaurantData) => API.post('/restaurants', restaurantData);

export const fetchMyRestaurants = () => API.get('/restaurants/my');

// ... rest of the file

// ... existing functions ...
// Owner Specific
export const fetchOwnerBookings = () => API.get('/owner/bookings');
export const fetchOwnerReviews = () => API.get('/owner/reviews');
export const fetchRestaurantForOwner = (id) => API.get(`/restaurants/owner/${id}`);
// Let axios set the Content-Type (including boundary) for multipart/form-data
export const updateRestaurant = (id, data) => API.put(`/restaurants/${id}`, data);
// Add to the Bookings section
export const cancelBooking = (bookingId) => API.put(`/bookings/${bookingId}/cancel`);
export default API;



