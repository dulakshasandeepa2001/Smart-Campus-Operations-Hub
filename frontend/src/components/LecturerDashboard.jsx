import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    purpose: '',
    subject: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, bookingsRes, notificationsRes] = await Promise.all([
        apiService.get('/facilities'),
        apiService.get(`/bookings/user/${user?.id}`),
        apiService.get(`/notifications/user/${user?.id}`)
      ]);
      setFacilities(facilitiesRes.data);
      setMyBookings(bookingsRes.data);
      setNotifications(notificationsRes.data);
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

  const openBookingModal = (facility) => {
    setSelectedFacility(facility);
    setShowBookingModal(true);
    setBookingError('');
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedFacility(null);
    setBookingForm({
      bookingDate: '',
      startTime: '',
      endTime: '',
      expectedAttendees: '',
      purpose: '',
      subject: ''
    });
    setBookingError('');
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    // Validation
    if (!bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.expectedAttendees || !bookingForm.purpose) {
      setBookingError('Please fill in all required fields');
      return;
    }

    if (parseInt(bookingForm.expectedAttendees) > selectedFacility.capacity) {
      setBookingError(`Expected attendees cannot exceed facility capacity (${selectedFacility.capacity})`);
      return;
    }

    if (bookingForm.startTime >= bookingForm.endTime) {
      setBookingError('End time must be after start time');
      return;
    }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    // Validation
    if (!bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.expectedAttendees || !bookingForm.purpose) {
      setBookingError('Please fill in all required fields');
      return;
    }

    if (parseInt(bookingForm.expectedAttendees) > selectedFacility.capacity) {
      setBookingError(`Expected attendees cannot exceed facility capacity (${selectedFacility.capacity})`);
      return;
    }

    if (bookingForm.startTime >= bookingForm.endTime) {
      setBookingError('End time must be after start time');
      return;
    }

    // Check if this is a full facility booking (for lecture halls and labs)
    const isFullFacility = parseInt(bookingForm.expectedAttendees) >= (selectedFacility.capacity * 0.8); // 80% threshold
    const allowedFullBookingTypes = ['LECTURE_HALL', 'LABORATORY'];
    
    if (isFullFacility && !allowedFullBookingTypes.includes(selectedFacility.type)) {
      setBookingError(`❌ Lecturers can only book full Lecture Halls or Labs, not ${selectedFacility.type}`);
      return;
    }

    try {
      setBookingLoading(true);
      const bookingStart = new Date(`${bookingForm.bookingDate}T${bookingForm.startTime}`);
      const bookingEnd = new Date(`${bookingForm.bookingDate}T${bookingForm.endTime}`);

      const bookingData = {
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        bookingStart: bookingStart.toISOString(),
        bookingEnd: bookingEnd.toISOString(),
        expectedAttendees: parseInt(bookingForm.expectedAttendees),
        purpose: bookingForm.purpose,
        subject: bookingForm.subject || bookingForm.purpose,
        isFullFacility: isFullFacility
      };

      await apiService.post('/bookings', bookingData);
      alert('✅ Booking request submitted! Waiting for admin approval.');
      closeBookingModal();
      fetchData();
    } catch (error) {
      setBookingError(error.response?.data?.message || '❌ Failed to submit booking: ' + error.message);
    } finally {
      setBookingLoading(false);
    }
  };
  };

  const stats = {
    totalBookings: myBookings.length,
    approvedBookings: myBookings.filter(b => b.status === 'APPROVED').length,
    lectureHalls: facilities.filter(f => f.type === 'LECTURE_HALL').length,
    labs: facilities.filter(f => f.type === 'LABORATORY').length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading lecturer dashboard...</div>;
  }

  return (
    <div className="lecturer-dashboard">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p className="user-info">Welcome, {user?.fullName}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalBookings}</h3>
          <p>Total Bookings</p>
        </div>
        <div className="stat-card">
          <h3>{stats.approvedBookings}</h3>
          <p>Approved Bookings</p>
        </div>
        <div className="stat-card">
          <h3>{stats.lectureHalls}</h3>
          <p>Available Lecture Halls</p>
        </div>
        <div className="stat-card">
          <h3>{stats.labs}</h3>
          <p>Available Labs</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Class Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Available Resources
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Teaching Schedule Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>📚 Upcoming Classes</h3>
                <div className="schedule-list">
                  {myBookings
                    .filter(b => b.status === 'APPROVED' && new Date(b.bookingStart) > new Date())
                    .slice(0, 5)
                    .map(booking => (
                      <div key={booking.id} className="schedule-item">
                        <strong>{booking.facilityName}</strong>
                        <p>{new Date(booking.bookingStart).toLocaleDateString()} at {new Date(booking.bookingStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <small>{booking.expectedAttendees} expected attendees</small>
                      </div>
                    ))}
                  {myBookings.filter(b => b.status === 'APPROVED' && new Date(b.bookingStart) > new Date()).length === 0 && (
                    <p className="empty-message">No upcoming classes scheduled</p>
                  )}
                </div>
              </div>

              <div className="overview-card alert">
                <h3>⚠️ Quick Actions</h3>
                <ul>
                  <li>✓ Request additional resources</li>
                  <li>✓ View facility availability</li>
                  <li>✓ Manage class bookings</li>
                  <li>✓ View notifications</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="classes-section">
            <h2>Class Bookings</h2>
            {myBookings.length === 0 ? (
              <p className="empty-message">No class bookings yet. Request one through the system.</p>
            ) : (
              <div className="classes-list">
                {myBookings.map(booking => (
                  <div key={booking.id} className={`class-card ${booking.status.toLowerCase()}`}>
                    <div className="class-header">
                      <h3>{booking.facilityName}</h3>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    <div className="class-details">
                      <p><strong>📅 Date:</strong> {new Date(booking.bookingStart).toLocaleDateString()}</p>
                      <p><strong>🕐 Time:</strong> {new Date(booking.bookingStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.bookingEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p><strong>👥 Capacity:</strong> {booking.expectedAttendees}/50</p>
                      <p><strong>📝 Purpose:</strong> {booking.purpose}</p>
                      {booking.status === 'REJECTED' && booking.rejectionReason && (
                        <p className="rejection-reason"><strong>❌ Reason:</strong> {booking.rejectionReason}</p>
                      )}
                    </div>
                    {booking.status === 'APPROVED' && (
                      <div className="class-actions">
                        <button className="btn-secondary">View Details</button>
                        <button className="btn-danger" onClick={() => handleCancelBooking(booking.id)}>Cancel Class</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-section">
            <h2>Available Teaching Resources</h2>
            <div className="facilities-categories">
              <div className="facility-category">
                <h3>Lecture Halls</h3>
                <div className="facilities-grid">
                  {facilities
                    .filter(f => f.type === 'LECTURE_HALL' && f.status === 'ACTIVE')
                    .map(facility => (
                      <div key={facility.id} className="facility-card">
                        <h4>{facility.name}</h4>
                        <p>👥 Capacity: {facility.capacity}</p>
                        <p>📍 {facility.building}, Floor {facility.floor}</p>
                        {facility.equipment && <p>🔧 Equipment: {facility.equipment}</p>}
                        <button className="btn-book" onClick={() => openBookingModal(facility)}>
                          📅 Book Now
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="facility-category">
                <h3>Laboratories</h3>
                <div className="facilities-grid">
                  {facilities
                    .filter(f => f.type === 'LABORATORY' && f.status === 'ACTIVE')
                    .map(facility => (
                      <div key={facility.id} className="facility-card">
                        <h4>{facility.name}</h4>
                        <p>👥 Capacity: {facility.capacity}</p>
                        <p>📍 {facility.building}, Floor {facility.floor}</p>
                        {facility.equipment && <p>🔧 Equipment: {facility.equipment}</p>}
                        <button className="btn-book" onClick={() => openBookingModal(facility)}>
                          📅 Book Now
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && selectedFacility && (
        <div className="modal-overlay" onClick={closeBookingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book {selectedFacility.name}</h2>
              <button className="modal-close" onClick={closeBookingModal}>✕</button>
            </div>

            <div style={{backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9em'}}>
              <strong>📌 Full Facility Booking:</strong> Lecturers can book entire {selectedFacility.type === 'LECTURE_HALL' ? 'Lecture Halls' : selectedFacility.type === 'LABORATORY' ? 'Labs' : 'Facilities'} 
              {selectedFacility.type === 'LECTURE_HALL' || selectedFacility.type === 'LABORATORY' ? ' for their classes or practicals.' : '.'}
            </div>

            {bookingError && <div className="error-message">{bookingError}</div>}

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="facility">Facility *</label>
                <input
                  id="facility"
                  type="text"
                  value={selectedFacility.name}
                  disabled
                />
                <small>Capacity: {selectedFacility.capacity} | Location: {selectedFacility.building}, Floor {selectedFacility.floor}</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookingDate">Date *</label>
                  <input
                    id="bookingDate"
                    type="date"
                    name="bookingDate"
                    value={bookingForm.bookingDate}
                    onChange={handleBookingFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={bookingForm.startTime}
                    onChange={handleBookingFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time *</label>
                  <input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={bookingForm.endTime}
                    onChange={handleBookingFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expectedAttendees">Expected Attendees *</label>
                  <input
                    id="expectedAttendees"
                    type="number"
                    name="expectedAttendees"
                    value={bookingForm.expectedAttendees}
                    onChange={handleBookingFormChange}
                    min="1"
                    max={selectedFacility.capacity}
                    required
                  />
                  <small>Max: {selectedFacility.capacity}</small>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={bookingForm.subject}
                    onChange={handleBookingFormChange}
                    placeholder="e.g., Advanced Mathematics"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose *</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={bookingForm.purpose}
                  onChange={handleBookingFormChange}
                  placeholder="Describe the booking purpose and class details"
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={bookingLoading}>
                  {bookingLoading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeBookingModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <hr className="dashboard-divider" />
    </div>
  );
}
