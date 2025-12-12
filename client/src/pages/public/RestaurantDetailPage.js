import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchRestaurantById, fetchRestaurantReviews, createReview, createBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import './RestaurantDetailPage.css';

const makeUrl = (val) => {
  if (!val) return null;
  if (typeof val !== 'string') return null;
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  // Normalize backslashes -> forward slashes:
  const cleaned = val.replace(/\\/g, '/');
  // If the path already begins with uploads or similar, ensure / at start
  return `http://localhost:5000/${cleaned.replace(/^\/+/, '')}`;
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking form state (includes pre-order and special instructions)
  const [bookingData, setBookingData] = useState({
    booking_time: '',
    num_guests: 2,
    pre_order: false,
    menu_items: '',
    special_instructions: ''
  });

  // Review form
  const [reviewData, setReviewData] = useState({ rating: 5, reviewText: '' });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRestaurant, resReviews] = await Promise.all([
        fetchRestaurantById(id),
        fetchRestaurantReviews(id)
      ]);
      setRestaurant(resRestaurant.data);
      setReviews(resReviews.data || []);
    } catch (err) {
      console.error('Failed to load restaurant data', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleBookingChange = (e) => {
    const { name, type, value, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setModalContent({ title: 'Login Required', message: 'You must be logged in to book a table.' });
      setIsModalOpen(true);
      return;
    }

    // Basic validation
    if (!bookingData.booking_time) {
      setModalContent({ title: 'Missing Date/Time', message: 'Please select a date and time for your booking.' });
      setIsModalOpen(true);
      return;
    }

    try {
      // Build payload matching typical backend expectations
    const payload = {
  restaurantId: id,
  bookingTime: bookingData.booking_time,
  numGuests: parseInt(bookingData.num_guests, 10) || 2,
  pre_order: bookingData.pre_order,
  menu_items: bookingData.pre_order ? bookingData.menu_items : '',
  special_instructions: bookingData.special_instructions || ''
};

console.log('Booking payload:', payload);
await createBooking(payload);

      setModalContent({
        title: 'Booking Confirmed!',
        message: 'Your booking was created. Check your dashboard for details.'
      });
      setIsModalOpen(true);

      // optional: reset booking form (but keep guests)
      setBookingData(prev => ({ ...prev, booking_time: '', menu_items: '', pre_order: false, special_instructions: '' }));
    } catch (error) {
      console.error('Booking failed', error);
      setModalContent({
        title: 'Booking Failed',
        message: error.response?.data?.message || 'Something went wrong while creating the booking.'
      });
      setIsModalOpen(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setModalContent({ title: 'Login Required', message: 'You must be logged in to write a review.' });
      setIsModalOpen(true);
      return;
    }
    try {
      await createReview({
        restaurantId: id,
        rating: parseInt(reviewData.rating, 10),
        reviewText: reviewData.reviewText,
        // review_text: reviewData.reviewText {smallest bug ever seen}
      });
      setReviewData({ rating: 5, reviewText: '' });
      await loadData();
      setModalContent({ title: 'Review Submitted', message: 'Thanks for your feedback!' });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Review submission failed', err);
      setModalContent({ title: 'Submission Failed', message: 'Could not submit review.' });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (modalContent.title === 'Booking Confirmed!') {
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="rdp-container"><p>Loading...</p></div>;
  if (!restaurant) return <div className="rdp-container"><p>Restaurant not found.</p></div>;

  // Robust image handling: accept many possible field names
  const logoCandidates = [
    restaurant.logo_image_url,
    restaurant.logo_image,
    restaurant.image,
    restaurant.logo,
    restaurant.cover_image
  ];
  const logoField = logoCandidates.find(Boolean);
  const logoUrl = makeUrl(logoField) || 'https://placehold.co/1200x400?text=Restaurant+Image';

  // gallery possible keys
  const galleryCandidates = restaurant.gallery || restaurant.gallery_images || restaurant.images || restaurant.photos || [];
  const galleryArray = Array.isArray(galleryCandidates) ? galleryCandidates : (typeof galleryCandidates === 'string' ? [galleryCandidates] : []);

  // helper to format lists
  const joinOrNone = (arr) => {
    if (!arr) return '—';
    if (Array.isArray(arr)) return arr.length ? arr.join(', ') : '—';
    if (typeof arr === 'string' && arr.trim()) return arr;
    return '—';
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalContent.title}>
        <p>{modalContent.message}</p>
      </Modal>

      <div className="rdp-page">
        {/* Hero */}
        <div className="rdp-hero" style={{ backgroundImage: `url(${logoUrl})` }}>
          <div className="rdp-hero-overlay">
            <h1 className="rdp-title">{restaurant.name}</h1>
            <div className="rdp-sub">
              <span className="rdp-type">{restaurant.restaurant_type || '—'}</span>
              <span className="rdp-cuisines">{joinOrNone(restaurant.cuisine_types)}</span>
            </div>
          </div>
        </div>

        <div className="rdp-content">
          {/* Left/main content */}
          <main className="rdp-main">
            <section className="rdp-section rdp-about">
              <h2>About</h2>
              <p className="rdp-description">{restaurant.description || 'No description provided.'}</p>
            </section>

            <section className="rdp-section rdp-details-grid">
              <h2>Details</h2>
              <div className="rdp-grid">
                <div className="rdp-grid-item">
                  <strong>Address</strong>
                  <p>{[restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Contact</strong>
                  <p>{restaurant.contact_number || '—'}</p>
                  <p>{restaurant.email || '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Website</strong>
                  <p>{restaurant.website_url ? <a href={restaurant.website_url} target="_blank" rel="noreferrer">{restaurant.website_url}</a> : '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Hours</strong>
                  <p>{restaurant.operating_hours || '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Avg. Dining</strong>
                  <p>{restaurant.avg_dining_duration ? `${restaurant.avg_dining_duration} min` : '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Capacity</strong>
                  <p>{restaurant.total_tables ? `${restaurant.total_tables} tables` : '—'}</p>
                  <p>{restaurant.table_capacity_range || '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Special Areas</strong>
                  <p>{joinOrNone(restaurant.special_areas)}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Ambience</strong>
                  <p>{restaurant.ambience_type || '—'}</p>
                </div>
                <div className="rdp-grid-item">
                  <strong>Facilities</strong>
                  <p>{joinOrNone(restaurant.facilities)}</p>
                </div>
              </div>
            </section>

            <section className="rdp-section rdp-gallery">
              <h2>Gallery</h2>
              <div className="rdp-gallery-row">
                {galleryArray.length ? galleryArray.map((g, idx) => (
                  <img
                    key={idx}
                    src={makeUrl(g) || 'https://placehold.co/300x200?text=No+Image'}
                    alt={`Gallery ${idx + 1}`}
                    onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
                  />
                )) : (
                  <div className="rdp-no-gallery">No gallery images available.</div>
                )}
              </div>
            </section>

            <section className="rdp-section rdp-reviews">
              <h2>Reviews</h2>

              {user && user.role === 'customer' && (
                <form onSubmit={handleReviewSubmit} className="rdp-review-form">
                  <label>
                    Rating
<select name="rating" value={reviewData.rating} onChange={handleReviewChange}>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </label>
                  <label>
                    Your review
                    <textarea name="reviewText" placeholder="Write your review..." value={reviewData.reviewText} onChange={handleReviewChange}></textarea>
                  </label>
                  <button type="submit" className="rdp-btn">Submit Review</button>
                </form>
              )}

              <div className="rdp-reviews-list">
                {reviews.length ? reviews.map((r, idx) => (
                  <div key={idx} className="rdp-review-item">
                    <div className="rdp-review-head">
                      <strong>{r.user_name || r.user || 'User'}</strong>
                      <span className="rdp-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p className="rdp-review-text">{r.review_text || r.text}</p>
                  </div>
                )) : <p>No reviews yet. Be the first to write one!</p>}
              </div>
            </section>
          </main>

          {/* Right - Booking form */}
          <aside className="rdp-aside">
            <div className="rdp-book-card">
              <h3>Book a Table</h3>
              {user ? (
                <form onSubmit={handleBookingSubmit} className="rdp-book-form">
                  <label>
                    Date & time
                    <input
                      type="datetime-local"
                      name="booking_time"
                      value={bookingData.booking_time}
                      onChange={handleBookingChange}
                      required
                    />
                  </label>

                  <label>
                    Number of guests
                    <input
                      type="number"
                      name="num_guests"
                      min="1"
                      value={bookingData.num_guests}
                      onChange={handleBookingChange}
                      required
                    />
                  </label>

                  <label className="rdp-checkbox">
                    <input
                      type="checkbox"
                      name="pre_order"
                      checked={bookingData.pre_order}
                      onChange={handleBookingChange}
                    />
                    Pre-order items
                  </label>

                  {bookingData.pre_order && (
                    <label>
                      Menu items (one per line or comma-separated)
                      <textarea
                        name="menu_items"
                        placeholder="E.g., 2x Margherita Pizza, 1x Caesar Salad"
                        value={bookingData.menu_items}
                        onChange={handleBookingChange}
                      />
                    </label>
                  )}

                  <label>
                    Special instructions (optional)
                    <textarea
                      name="special_instructions"
                      placeholder="Any dietary preferences, accessibility needs, celebration notes..."
                      value={bookingData.special_instructions}
                      onChange={handleBookingChange}
                    />
                  </label>

                  <button type="submit" className="rdp-btn rdp-btn-primary">Confirm Booking</button>
                </form>
              ) : (
                <p>Please <Link to="/login">login</Link> to book a table or write a review.</p>
              )}
            </div>

            {/* Small info card */}
            <div className="rdp-info-card">
              <h4>Quick Info</h4>
              <p><strong>Cuisine:</strong> {joinOrNone(restaurant.cuisine_types)}</p>
              <p><strong>Hours:</strong> {restaurant.operating_hours || '—'}</p>
              <p><strong>Phone:</strong> {restaurant.contact_number || '—'}</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};


export default RestaurantDetailPage;


