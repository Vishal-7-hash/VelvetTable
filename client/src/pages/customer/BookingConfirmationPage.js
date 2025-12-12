import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './BookingConfirmationPage.css';

const BookingConfirmationPage = () => {
    const location = useLocation();
    const { bookingDetails } = location.state || {};

    if (!bookingDetails) {
        return (
            <div className="container">
                <h1>No Booking Details Found</h1>
                <p>It seems you've accessed this page directly. Please book a table to see your confirmation.</p>
                <Link to="/" className="btn">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="confirmation-wrapper">
            <div className="confirmation-card">
                <h1>Booking Confirmed!</h1>
                <div className="conf-item">
                    <span>Restaurant Name</span>
                    <strong>{bookingDetails.restaurantName}</strong>
                </div>
                <div className="conf-item">
                    <span>Date & Time</span>
                    <strong>{new Date(bookingDetails.bookingTime).toLocaleString()}</strong>
                </div>
                <div className="conf-item">
                    <span>Ticket ID</span>
                    <strong className="ticket-id">{bookingDetails.ticketId}</strong>
                </div>
                <div className="qr-code-container">
                    <img src={bookingDetails.qrCodeUrl} alt="Your Booking QR Code" />
                </div>
                <p className="footer-note">Show this QR code at the venue for verification.</p>
            </div>
        </div>
    );
};

export default BookingConfirmationPage;