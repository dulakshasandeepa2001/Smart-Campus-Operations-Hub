import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 0,
    location: '',
    building: '',
    floor: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, bookingsRes] = await Promise.all([
        apiService.get('/facilities'),
        apiService.get('/bookings/admin/pending')
      ]);
      setFacilities(facilitiesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/facilities', newFacility);
      setNewFacility({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 0,
        location: '',
        building: '',
        floor: '',
        status: 'ACTIVE'
      });
      fetchData();
      alert('Facility added successfully!');
    } catch (error) {
      alert('Error adding facility: ' + error.message);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await apiService.put(`/bookings/${bookingId}/status`, {
        status: 'APPROVED'
      });
      fetchData();
      alert('Booking approved!');
    } catch (error) {
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error approving booking: ' + error.message);
      }
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        await apiService.put(`/bookings/${bookingId}/status`, {
          status: 'REJECTED',
          rejectionReason: reason
        });
        fetchData();
        alert('Booking rejected!');
      }
    } catch (error) {
      alert('Error rejecting booking: ' + error.message);
    }
  };

  const stats = {
    totalFacilities: facilities.length,
    activeFacilities: facilities.filter(f => f.status === 'ACTIVE').length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    totalBookings: bookings.length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="user-info">Welcome, {user?.fullName}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalFacilities}</h3>
          <p>Total Facilities</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeFacilities}</h3>
          <p>Active Facilities</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingBookings}</h3>
          <p>Pending Bookings</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalBookings}</h3>
          <p>Total Bookings</p>
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
          className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Manage Facilities
        </button>
        <button
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Review Bookings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>System Overview</h2>
            <div className="overview-card">
              <h3>Facility Status</h3>
              <ul>
                {facilities.slice(0, 5).map(f => (
                  <li key={f.id}>{f.name} - {f.status}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-section">
            <h2>Add New Facility</h2>
            <form className="facility-form" onSubmit={handleAddFacility}>
              <div className="form-group">
                <label>Facility Name *</label>
                <input
                  type="text"
                  required
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  placeholder="Enter facility name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={newFacility.type}
                    onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}
                  >
                    <option>LECTURE_HALL</option>
                    <option>LABORATORY</option>
                    <option>MEETING_ROOM</option>
                    <option>EQUIPMENT</option>
                    <option>STUDY_AREA</option>
                    <option>AUDITORIUM</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.capacity}
                    onChange={(e) => setNewFacility({ ...newFacility, capacity: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Building</label>
                  <input
                    type="text"
                    value={newFacility.building}
                    onChange={(e) => setNewFacility({ ...newFacility, building: e.target.value })}
                    placeholder="Building name"
                  />
                </div>
                <div className="form-group">
                  <label>Floor</label>
                  <input
                    type="text"
                    value={newFacility.floor}
                    onChange={(e) => setNewFacility({ ...newFacility, floor: e.target.value })}
                    placeholder="Floor number"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">Add Facility</button>
            </form>

            <h2 style={{ marginTop: '2rem' }}>Existing Facilities</h2>
            <div className="facilities-list">
              {facilities.map(facility => (
                <div key={facility.id} className="facility-item">
                  <h3>{facility.name}</h3>
                  <p><strong>Type:</strong> {facility.type}</p>
                  <p><strong>Capacity:</strong> {facility.capacity} people</p>
                  <p><strong>Location:</strong> {facility.location}</p>
                  <p><strong>Status:</strong> <span className={`status ${facility.status}`}>{facility.status}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Pending Bookings</h2>
            <div className="bookings-list">
              {bookings
                .filter(b => b.status === 'PENDING')
                .map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.facilityName}</h3>
                      <span className={`status pending`}>{booking.status}</span>
                    </div>
                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                    <p><strong>Date:</strong> {new Date(booking.bookingStart).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(booking.bookingStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.bookingEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                    <div className="booking-actions">
                      <button className="btn-success" onClick={() => handleApproveBooking(booking.id)}>Approve</button>
                      <button className="btn-danger" onClick={() => handleRejectBooking(booking.id)}>Reject</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
