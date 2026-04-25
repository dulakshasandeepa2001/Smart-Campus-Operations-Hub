// frontend/src/components/LecturerDashboard.jsx
import { useState, useEffect } from 'react';
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

  /**
   * LOAD DATA
   */
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
    loadData();
  }, []);

  /**
   * OPEN MODAL
   */
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

  /**
   * CLOSE MODAL
   */
  const closeModal = () => {
    setModalOpen(false);
    setSelectedFacility(null);
    setEditingBooking(null);
    setError('');
  };

  /**
   * FORM HANDLER
   */
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /**
   * VALIDATION
   */
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

  /**
   * SUBMIT
   */
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
        isFullFacility:
          parseInt(form.attendees) >= selectedFacility.capacity * 0.8
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

  /**
   * ACTIONS
   */
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel booking?')) return;

    try {
      await bookingService.cancel(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete booking permanently?')) return;

    try {
      await bookingService.delete(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * STATS
   */
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

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome, {user?.fullName}</p>
      </div>

      {/* STATS */}
      <div className="dashboard-stats">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total</p></div>
        <div className="stat-card"><h3>{stats.approved}</h3><p>Approved</p></div>
        <div className="stat-card"><h3>{stats.lectureHalls}</h3><p>Lecture Halls</p></div>
        <div className="stat-card"><h3>{stats.labs}</h3><p>Labs</p></div>
      </div>

      {/* TABS */}
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
          Classes
        </button>

        <button
          className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Facilities
        </button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">

        {/* FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="facilities-grid">
            {facilities.map(f => (
              <div key={f.id} className="facility-card">
                <h3>{f.name}</h3>
                <p>{f.type}</p>
                <p>Capacity: {f.capacity}</p>
                <button onClick={() => openCreateModal(f)}>
                  Book
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === 'classes' && (
          <div>
            {bookings.map(b => (
              <div key={b.id} className="booking-card">
                <h3>{b.facilityName}</h3>
                <p>{b.status}</p>

                {b.status === 'PENDING' && (
                  <>
                    <button onClick={() => openEditModal(b)}>Edit</button>
                    <button onClick={() => handleDelete(b.id)}>Delete</button>
                  </>
                )}

                {b.status === 'APPROVED' && (
                  <button onClick={() => handleCancel(b.id)}>Cancel</button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>
              {editingBooking ? 'Edit Booking' : 'New Booking'}
            </h2>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />

              <input
                type="number"
                name="attendees"
                value={form.attendees}
                onChange={handleChange}
                placeholder="Attendees"
              />

              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Purpose"
              />

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
              />

              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Submit'}
              </button>

              <button type="button" onClick={closeModal}>
                Cancel
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}