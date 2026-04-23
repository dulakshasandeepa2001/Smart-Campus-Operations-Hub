import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('facilities');
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityBookings, setFacilityBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    purpose: '',
    numberOfSeats: 1
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, bookingsRes, notificationsRes] = await Promise.all([
        apiService.get('/facilities/active/list'),
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

  const fetchFacilityBookings = async (facilityId) => {
    try {
      const response = await apiService.get(`/bookings/facility/${facilityId}`);
      setFacilityBookings(response.data);
    } catch (error) {
      console.error('Error fetching facility bookings:', error);
      setFacilityBookings([]);
    }
  };

  const calculateAvailableSeats = () => {
    if (!selectedFacility) return 0;
    const bookedSeats = facilityBookings.reduce((total, booking) => total + (booking.expectedAttendees || 1), 0);
    return Math.max(0, selectedFacility.capacity - bookedSeats);
  };

  const openFacilityBooking = (facility) => {
    setSelectedFacility(facility);
    setBookingForm({ purpose: '', numberOfSeats: 1 });
    setSelectedSeats([]);
    fetchFacilityBookings(facility.id);
  };

  const getBookedSeats = () => {
    const bookedSeats = [];
    facilityBookings.forEach(booking => {
      if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
        bookedSeats.push(...booking.seatNumbers);
      }
    });
    return bookedSeats;
  };

  const toggleSeatSelection = (seatNum) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
      setBookingForm({ ...bookingForm, numberOfSeats: bookingForm.numberOfSeats - 1 });
    } else {
      if (selectedSeats.length < 5) {
        setSelectedSeats([...selectedSeats, seatNum]);
        setBookingForm({ ...bookingForm, numberOfSeats: selectedSeats.length + 1 });
      } else {
        alert('❌ Maximum 5 seats per booking');
      }
    }
  };

  const handleBookFacility = async (e) => {
    e.preventDefault();
    
    if (selectedSeats.length === 0) {
      alert('❌ Please select at least one seat');
      return;
    }

    if (selectedSeats.length > 5) {
      alert('❌ Students can only book up to 5 individual seats.');
      return;
    }

    try {
      await apiService.post('/bookings', {
        facilityId: selectedFacility.id,
        purpose: bookingForm.purpose,
        numberOfSeats: selectedSeats.length,
        seatNumbers: selectedSeats.sort((a, b) => a - b),
        isFullFacility: false
      }, {
        headers: { 'X-User-Id': user?.id }
      });
      setBookingForm({ purpose: '', numberOfSeats: 1 });
      setSelectedSeats([]);
      setSelectedFacility(null);
      fetchData();
      alert('✅ Seat booking submitted! Your seats are reserved upon admin approval.');
    } catch (error) {
      alert('❌ Error creating booking: ' + (error.response?.data?.message || error.message));
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

  const filteredFacilities = filterType
    ? facilities.filter(f => f.type === filterType)
    : facilities;

  const stats = {
    totalBookings: myBookings.length,
    approvedBookings: myBookings.filter(b => b.status === 'APPROVED').length,
    pendingBookings: myBookings.filter(b => b.status === 'PENDING').length,
    unreadNotifications: notifications.filter(n => !n.isRead).length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading student dashboard...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
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
          <h3>{stats.pendingBookings}</h3>
          <p>Pending Bookings</p>
        </div>
        <div className="stat-card alert">
          <h3>{stats.unreadNotifications}</h3>
          <p>Unread Notifications</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Browse Facilities
        </button>
        <button
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications ({stats.unreadNotifications})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'facilities' && (
          <div className="facilities-section">
            <h2>Available Facilities</h2>
            <div className="filter-controls">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="STUDY_AREA">Study Area</option>
                <option value="AUDITORIUM">Auditorium</option>
              </select>
            </div>

            {selectedFacility ? (
              <div className="booking-modal">
                <div className="modal-content">
                  <button className="close-btn" onClick={() => {
                    setSelectedFacility(null);
                    setBookingForm({ purpose: '', numberOfSeats: 1 });
                    setSelectedSeats([]);
                  }}>×</button>
                  <h3>Book {selectedFacility.name}</h3>
                  <p style={{color: '#666', fontSize: '0.9em', marginBottom: '1em'}}>
                    📌 <strong>Reserve Your Seats:</strong> Select the number of seats you want to attend this lecture. 
                    The lecture date and time are fixed by the lecturer.
                  </p>
                  <form onSubmit={handleBookFacility}>
                    <div className="form-group">
                      <label><strong>Facility:</strong> {selectedFacility.name}</label>
                      <small style={{display: 'block', color: '#999', marginTop: '5px'}}>
                        Capacity: {selectedFacility.capacity} | Location: {selectedFacility.building || 'TBD'}
                      </small>
                    </div>

                    {/* Seat Availability Visualization - INTERACTIVE */}
                    <div style={{
                      backgroundColor: '#f5f5f5',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <h4 style={{margin: '0', color: '#333'}}>🎫 Select Your Seats</h4>
                        <span style={{color: '#666', fontSize: '0.9em'}}>
                          Selected: <strong>{selectedSeats.length}</strong>/5
                        </span>
                      </div>
                      
                      <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '10px', fontSize: '0.85em'}}>
                        <div>
                          <span style={{display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#4CAF50', borderRadius: '3px', marginRight: '5px'}}></span>
                          <span>Available</span>
                        </div>
                        <div>
                          <span style={{display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#FFC107', borderRadius: '3px', marginRight: '5px'}}></span>
                          <span>Selected</span>
                        </div>
                        <div>
                          <span style={{display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#f44336', borderRadius: '3px', marginRight: '5px'}}></span>
                          <span>Booked</span>
                        </div>
                      </div>
                      
                      {/* Interactive Seat Grid - Click to Select */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(selectedFacility.capacity))}, 1fr)`,
                        gap: '6px',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {Array.from({length: selectedFacility.capacity}, (_, i) => {
                          const seatNum = i + 1;
                          const bookedSeats = getBookedSeats();
                          const isBooked = bookedSeats.includes(seatNum);
                          const isSelected = selectedSeats.includes(seatNum);
                          
                          return (
                            <button
                              key={seatNum}
                              type="button"
                              onClick={() => !isBooked && toggleSeatSelection(seatNum)}
                              style={{
                                width: '35px',
                                height: '35px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                border: isSelected ? '3px solid #2196F3' : '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                backgroundColor: isBooked ? '#f44336' : (isSelected ? '#FFC107' : '#4CAF50'),
                                color: 'white',
                                transition: 'all 0.2s'
                              }}
                            >
                              {seatNum}
                            </button>
                          );
                        })}
                      </div>
                      <small style={{color: '#666', marginTop: '8px', display: 'block'}}>
                        💡 Click seats to select (max 5). Selected seats: {selectedSeats.length > 0 ? selectedSeats.sort((a,b) => a-b).join(', ') : 'None'}
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Purpose *</label>
                      <textarea
                        required
                        value={bookingForm.purpose}
                        onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                        placeholder="e.g., Attending lecture, attending lab session"
                      />
                    </div>
                    <button type="submit" className="btn-primary">Reserve Seats</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="facilities-grid">
                {filteredFacilities.map(facility => (
                  <div key={facility.id} className="facility-card">
                    <h3>{facility.name}</h3>
                    <p><strong>Type:</strong> {facility.type}</p>
                    <p><strong>Capacity:</strong> {facility.capacity} people</p>
                    <p><strong>Location:</strong> {facility.location}</p>
                    <p><strong>Building:</strong> {facility.building} | Floor: {facility.floor}</p>
                    {facility.equipment && <p><strong>Equipment:</strong> {facility.equipment}</p>}
                    <button
                      className="btn-primary"
                      onClick={() => openFacilityBooking(facility)}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>My Bookings</h2>
            {myBookings.length === 0 ? (
              <p className="empty-message">No bookings yet. Start by browsing available facilities!</p>
            ) : (
              <div className="bookings-list">
                {myBookings.map(booking => (
                  <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
                    <div className="booking-header">
                      <h3>{booking.facilityName}</h3>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                    <p><strong>Date:</strong> {new Date(booking.bookingStart).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(booking.bookingStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.bookingEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                    {booking.status === 'REJECTED' && booking.rejectionReason && (
                      <p className="rejection-reason"><strong>Reason:</strong> {booking.rejectionReason}</p>
                    )}
                    {booking.status === 'APPROVED' && (
                      <button className="btn-danger" onClick={() => handleCancelBooking(booking.id)}>
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <p className="empty-message">No notifications yet</p>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
