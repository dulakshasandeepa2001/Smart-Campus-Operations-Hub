import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function BookingsHistory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, facilitiesRes] = await Promise.all([
        apiService.get(`/bookings/user/${user?.id}`),
        apiService.get('/facilities')
      ]);
      setBookings(bookingsRes.data);
      setFacilities(facilitiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        await apiService.put(`/bookings/${bookingId}/cancel`);
        fetchData();
        alert('Booking cancelled!');
      } catch (error) {
        alert('Error cancelling booking: ' + error.message);
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking request? This action cannot be undone.')) {
      try {
        await apiService.delete(`/bookings/${bookingId}`);
        fetchData();
        alert('✅ Booking request deleted successfully!');
      } catch (error) {
        alert('Error deleting booking: ' + error.message);
      }
    }
  };

  const parseLocalDateTime = (datetime) => {
    if (!datetime) return null;
    const cleaned = datetime.toString().replace(/Z$/, '').replace(/([+-]\d{2}:?\d{2})$/, '');
    const [datePart, timePart] = cleaned.split('T');
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = '00'] = timePart.split(':');
    return new Date(year, month - 1, day, Number(hour), Number(minute), Number(second));
  };

  const formatDate = (datetime) => {
    const dateObj = parseLocalDateTime(datetime);
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (datetime) => {
    const dateObj = parseLocalDateTime(datetime);
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFacilityCapacity = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility?.capacity ?? 'N/A';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading booking history...
      </div>
    );
  }

  return (
    <div className="lecturer-dashboard">
      <button
        className="btn-secondary back-button page-back-button"
        onClick={() => navigate(-1)}
        title="Back to Dashboard"
        aria-label="Back to Dashboard"
      >
        ←
      </button>

        <div className="history-section">
          <div className="section-header">
            <h2>All Your Bookings</h2>
            <div className="history-stats">
              <span className="stat-item">
                <strong>{bookings.length}</strong> Total Bookings
              </span>
              <span className="stat-item approved">
                <strong>{bookings.filter(b => b.status === 'APPROVED').length}</strong> Approved
              </span>
              <span className="stat-item pending">
                <strong>{bookings.filter(b => b.status === 'PENDING').length}</strong> Pending
              </span>
              <span className="stat-item rejected">
                <strong>{bookings.filter(b => b.status === 'REJECTED').length}</strong> Rejected
              </span>
              <span className="stat-item cancelled">
                <strong>{bookings.filter(b => b.status === 'CANCELLED').length}</strong> Cancelled
              </span>
            </div>
          </div>

          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Attendees</th>
                  <th>Capacity</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .sort((a, b) => new Date(b.createdAt || b.bookingStart) - new Date(a.createdAt || a.bookingStart))
                  .map(booking => (
                    <tr key={booking.id} className={`history-row ${booking.status.toLowerCase()}`}>
                      <td>1</td>
                      <td className="facility-name" title={booking.facilityName}>
                        {booking.facilityName}
                      </td>
                      <td>{formatDate(booking.bookingStart)}</td>
                      <td>{formatTime(booking.bookingStart)} - {formatTime(booking.bookingEnd)}</td>
                      <td>{booking.expectedAttendees}</td>
                      <td>{getFacilityCapacity(booking.facilityId)}</td>
                      <td className="purpose-cell" title={booking.purpose}>
                        {booking.purpose}
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {booking.status === 'PENDING' && (
                          <div className="action-buttons">
                            <button
                              className="btn-small btn-edit"
                              onClick={() => alert('Edit functionality would navigate to booking form')}
                              title="Edit Booking"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-small btn-delete"
                              onClick={() => handleDeleteBooking(booking.id)}
                              title="Delete Booking"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                        {booking.status === 'APPROVED' && (
                          <button
                            className="btn-small btn-cancel"
                            onClick={() => handleCancelBooking(booking.id)}
                            title="Cancel Booking"
                          >
                            ❌
                          </button>
                        )}
                        {booking.status === 'REJECTED' && (
                          <span className="status-info" title={booking.rejectionReason || 'Booking was rejected'}>
                            ℹ️
                          </span>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span className="status-info" title="Booking was cancelled">
                            ℹ️
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="empty-history">
                <p>📚 No booking history available</p>
                <small>Start by making your first booking request!</small>
              </div>
            )}
          </div>
        </div>

    </div>
  );
}