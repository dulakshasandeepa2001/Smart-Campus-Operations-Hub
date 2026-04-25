import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  facilityService,
  bookingService,
  notificationService
} from '../services/apiService';
import '../styles/dashboards.css';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    purpose: '',
    subject: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, bookRes, notiRes] = await Promise.all([
        facilityService.getAll(),
        bookingService.getUserBookings(user?.id),
        notificationService.getUserNotifications(user?.id)
      ]);
      setFacilities(facRes.data);
      setBookings(bookRes.data);
      setNotifications(notiRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Filtered bookings based on search, status, date range
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Search by facility name or purpose
      const matchesSearch = 
        booking.facilityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

      // Date range filter
      let matchesDate = true;
      const bookingDate = new Date(booking.bookingStart);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (bookingDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (bookingDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  const openCreateModal = (facility) => {
    setSelectedFacility(facility);
    setEditingBooking(null);
    setError('');
    setModalOpen(true);
    const today = new Date().toISOString().split('T')[0];
    setForm({
      date: today,
      startTime: '08:00',
      endTime: '20:00',
      attendees: '',
      purpose: '',
      subject: ''
    });
  };

  const openEditModal = (booking) => {
    const facility = facilities.find(f => f.id === booking.facilityId);
    setSelectedFacility(facility);
    setEditingBooking(booking);
    setError('');
    setModalOpen(true);
    const start = new Date(booking.bookingStart);
    const end = new Date(booking.bookingEnd);
    setForm({
      date: start.toISOString().split('T')[0],
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      attendees: booking.expectedAttendees || '',
      purpose: booking.purpose || '',
      subject: booking.subject || ''
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFacility(null);
    setEditingBooking(null);
    setError('');
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.date || !form.startTime || !form.endTime || !form.attendees || !form.purpose) {
      return 'All required fields must be filled';
    }
    if (form.startTime < '08:00') return 'Start time must be 08:00 or later';
    if (form.endTime > '20:00') return 'End time must be before 20:00';
    if (form.startTime >= form.endTime) return 'Invalid time range';
    if (parseInt(form.attendees) > selectedFacility.capacity) {
      return `Max capacity is ${selectedFacility.capacity}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSubmitting(true);
      const bookingData = {
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        bookingStart: `${form.date}T${form.startTime}:00`,
        bookingEnd: `${form.date}T${form.endTime}:00`,
        expectedAttendees: parseInt(form.attendees),
        purpose: form.purpose,
        subject: form.subject || form.purpose,
        isFullFacility: parseInt(form.attendees) >= selectedFacility.capacity * 0.8
      };
      if (editingBooking) {
        await bookingService.update(editingBooking.id, bookingData);
      } else {
        await bookingService.create(bookingData);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel approved booking?')) return;
    try {
      await bookingService.cancel(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete pending booking permanently?')) return;
    try {
      await bookingService.delete(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    lectureHalls: facilities.filter(f => f.type === 'LECTURE_HALL').length,
    labs: facilities.filter(f => f.type === 'LABORATORY').length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="lecturer-dashboard">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome, {user?.fullName}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Bookings</p></div>
        <div className="stat-card"><h3>{stats.approved}</h3><p>Approved</p></div>
        <div className="stat-card"><h3>{stats.lectureHalls}</h3><p>Lecture Halls</p></div>
        <div className="stat-card"><h3>{stats.labs}</h3><p>Laboratories</p></div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`} onClick={() => setActiveTab('facilities')}>Facilities</button>
        <button className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>My Bookings</button>
        <button className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Teaching Overview</h3>
              <p>Manage your bookings for lectures, labs, and meetings.</p>
              <p>✅ Pending bookings can be edited or deleted.<br />✅ Approved bookings can be cancelled anytime.</p>
            </div>
            <div className="overview-card alert">
              <h3>Quick Note</h3>
              <p>You can book any available resource: Lecture Halls, Laboratories, Meeting Rooms, etc.</p>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-grid">
            {facilities.map(f => (
              <div key={f.id} className="facility-card">
                <h3>{f.name}</h3>
                <p>{f.type.replace('_', ' ')}</p>
                <p>Capacity: {f.capacity}</p>
                {f.building && <p>Building: {f.building}</p>}
                <button className="btn-book" onClick={() => openCreateModal(f)}>Book</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <>
            {/* Filter Section */}
            <div className="filter-section">
              <div className="filter-group">
                <label>🔍 Search</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Facility or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>📌 Status</label>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="filter-group">
                <label>📅 From</label>
                <input type="date" className="filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>📅 To</label>
                <input type="date" className="filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="filter-actions">
                <button className="clear-filters" onClick={clearFilters}>Clear</button>
              </div>
            </div>

            {filteredBookings.length === 0 && <p>No bookings match the filters.</p>}
            {filteredBookings.map(b => (
              <div key={b.id} className="booking-card">
                <div className="booking-header">
                  <h3>{b.facilityName}</h3>
                  <span className={`status ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
                <p><strong>Purpose:</strong> {b.purpose}</p>
                <p><strong>Date:</strong> {new Date(b.bookingStart).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(b.bookingStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.bookingEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Attendees:</strong> {b.expectedAttendees}</p>
                {b.status === 'PENDING' && (
                  <div className="booking-actions">
                    <button className="btn-primary" onClick={() => openEditModal(b)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                )}
                {b.status === 'APPROVED' && (
                  <div className="booking-actions">
                    <button className="btn-danger" onClick={() => handleCancel(b.id)}>Cancel</button>
                  </div>
                )}
                {b.status === 'REJECTED' && b.rejectionReason && (
                  <p className="rejection-reason"><strong>Rejection reason:</strong> {b.rejectionReason}</p>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-list">
            {notifications.length === 0 && <p>No notifications</p>}
            {notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                <div className="notification-content">
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {modalOpen && selectedFacility && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            {error && <div className="error-message" style={{ color: 'red', padding: '0 2rem' }}>{error}</div>}
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expected Attendees</label>
                  <input type="number" name="attendees" value={form.attendees} onChange={handleChange} placeholder="Number of attendees" required />
                  <small>Max capacity: {selectedFacility.capacity}</small>
                </div>
                <div className="form-group">
                  <label>Subject (optional)</label>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g., Mathematics 101" />
                </div>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <textarea name="purpose" value={form.purpose} onChange={handleChange} placeholder="Describe the purpose of booking" rows="3" required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingBooking ? 'Update Booking' : 'Submit Booking')}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}