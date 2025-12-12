import React, { useState, useEffect } from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import { fetchOwnerBookings, cancelBooking } from '../../services/api'; // Import cancelBooking
import Modal from '../../components/common/Modal'; // Import Modal

const OwnerBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const getBookings = async () => {
        const { data } = await fetchOwnerBookings();
        setBookings(data);
    };

    useEffect(() => {
        getBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await cancelBooking(bookingId);
                setModalContent({ title: "Success", message: "Booking has been cancelled." });
                setIsModalOpen(true);
                getBookings(); // Refresh the list
            } catch (error) {
                setModalContent({ title: "Error", message: "Failed to cancel booking." });
                setIsModalOpen(true);
            }
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}>
                <p>{modalContent.message}</p>
            </Modal>
            <div className="owner-layout">
                <OwnerSidebar />
                <main className="owner-content">
                    <h1>Manage Bookings</h1>
                    <div className="admin-table-container">
                        <table>
                            <thead>
                                <tr><th>User</th><th>Restaurant</th><th>Date & Time</th><th>Guests</th><th>Status</th><th>Actions</th></tr>
                            </thead>





                            {/* <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.user_name}</td>
                                        <td>{b.restaurant_name}</td>
                                        <td>{new Date(b.booking_time).toLocaleString()}</td>
                                        <td>{b.num_guests}</td>
                                        <td>{b.status}</td>
                                        <td>
                                            {b.status !== 'cancelled' && (
                                                <button className="btn-reject" onClick={() => handleCancel(b.id)}>Cancel</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}

<tbody>
  {bookings.map(b => {
      const bookingDate = new Date(b.booking_time);
      const now = new Date();

      // Determine if it's a past booking
      const isPast = bookingDate < now;

      // Compute display status
      const displayStatus = b.status === 'cancelled'
          ? 'Cancelled'
          : isPast
          ? 'Completed'
          : b.status;

      return (
          <tr key={b.id}>
              <td>{b.user_name}</td>
              <td>{b.restaurant_name}</td>
              <td>{bookingDate.toLocaleString()}</td>
              <td>{b.num_guests}</td>
              <td>{displayStatus}</td>
              <td>
                  {/* Show cancel button only if not past and not cancelled */}
                  {!isPast && b.status !== 'cancelled' && (
                      <button
                          className="btn-reject"
                          onClick={() => handleCancel(b.id)}
                      >
                          Cancel
                      </button>
                  )}
              </td>
          </tr>
      );
  })}
</tbody>


                        </table>
                    </div>
                </main>
            </div>
        </>
    );
};
export default OwnerBookingsPage;