import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { facilityService, bookingService, notificationService, apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);

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

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'FACILITY',
    priority: 'MEDIUM'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, bookRes, notiRes, ticketsRes] = await Promise.all([
        facilityService.getAll(),
        bookingService.getUserBookings(user?.id),
        notificationService.getUserNotifications(user?.id),
        apiService.get(`/tickets/student/${user?.id}`)
      ]);
      const meetingRooms = facRes.data.filter(f => f.type === 'MEETING_ROOM');
      setFacilities(meetingRooms);
      setBookings(bookRes.data);
      setNotifications(notiRes.data);
      setTickets(ticketsRes.data?.tickets || []);
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

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.facilityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
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
    if (!facility) {
      alert('Facility not found');
      return;
    }
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
    if (form.startTime >= form.endTime) return 'End time must be after start time';
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
    if (!window.confirm('Cancel this approved booking?')) return;
    try {
      await bookingService.cancel(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pending booking permanently?')) return;
    try {
      await bookingService.delete(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
    setTicketError('');
  };

  const validateTicket = () => {
    if (!ticketForm.title || !ticketForm.description) {
      return 'Title and description are required';
    }
    if (ticketForm.title.length < 3 || ticketForm.title.length > 200) {
      return 'Title must be between 3 and 200 characters';
    }
    if (ticketForm.description.length < 10 || ticketForm.description.length > 5000) {
      return 'Description must be between 10 and 5000 characters';
    }
    return null;
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const validationError = validateTicket();
    if (validationError) {
      setTicketError(validationError);
      return;
    }
    
    try {
      setTicketSubmitting(true);
      setTicketError('');
      
      if (!user?.id) {
        setTicketError('User not authenticated. Please refresh and try again.');
        setTicketSubmitting(false);
        return;
      }
      
      const ticketData = {
        title: ticketForm.title,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority
      };
      
      const response = await apiService.post(`/tickets/create?userId=${user.id}`, ticketData);
      
      setTicketSuccess('Ticket created successfully!');
      setTicketForm({ title: '', description: '', category: 'FACILITY', priority: 'MEDIUM' });
      setShowTicketForm(false);
      
      setTimeout(() => {
        setTicketSuccess('');
        loadData();
      }, 2000);
    } catch (err) {
      console.error('Ticket creation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create ticket';
      setTicketError(errorMsg);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    meetingRooms: facilities.length,
    myTickets: tickets.length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading student dashboard...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome, {user?.fullName}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Bookings</p></div>
        <div className="stat-card"><h3>{stats.approved}</h3><p>Approved</p></div>
        <div className="stat-card"><h3>{stats.pending}</h3><p>Pending</p></div>
        <div className="stat-card"><h3>{stats.meetingRooms}</h3><p>Meeting Rooms</p></div>
        <div className="stat-card"><h3>{stats.myTickets}</h3><p>My Tickets</p></div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`} onClick={() => setActiveTab('facilities')}>Meeting Rooms</button>
        <button className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>My Bookings</button>
        <button className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>My Tickets ({tickets.length})</button>
        <button className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Welcome, {user?.fullName}</h3>
              <p>You can book meeting rooms for group studies, project discussions, or events.</p>
              <p>✅ Pending bookings can be edited or deleted.<br />✅ Approved bookings can be cancelled anytime.</p>
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
            <div className="filter-section">
              <div className="filter-group">
                <label>🔍 Search</label>
                <input type="text" className="search-input" placeholder="Facility or purpose..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

        {activeTab === 'tickets' && (
          <div className="tickets-section">
            {ticketSuccess && <div style={{padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem'}}>{ticketSuccess}</div>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>My Tickets ({tickets.length})</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowTicketForm(!showTicketForm)}
              >
                {showTicketForm ? '✕ Close' : '+ Create Ticket'}
              </button>
            </div>

            {showTicketForm && (
              <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ddd' }}>
                <h3>Create New Ticket</h3>
                {ticketError && <div style={{ padding: '0.75rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>{ticketError}</div>}
                
                <form onSubmit={handleCreateTicket}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label><strong>Title *</strong></label>
                    <input
                      type="text"
                      name="title"
                      value={ticketForm.title}
                      onChange={handleTicketChange}
                      placeholder="Brief title of the issue"
                      maxLength="200"
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <small style={{ color: '#666' }}>{ticketForm.title.length}/200</small>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label><strong>Description *</strong></label>
                    <textarea
                      name="description"
                      value={ticketForm.description}
                      onChange={handleTicketChange}
                      placeholder="Detailed description of the issue (min 10 characters)"
                      rows="4"
                      maxLength="5000"
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'Arial, sans-serif' }}
                    />
                    <small style={{ color: '#666' }}>{ticketForm.description.length}/5000</small>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label><strong>Category</strong></label>
                      <select
                        name="category"
                        value={ticketForm.category}
                        onChange={handleTicketChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="FACILITY">Facility Issue</option>
                        <option value="IT">IT Support</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label><strong>Priority</strong></label>
                      <select
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleTicketChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="btn-primary"
                      style={{ opacity: ticketSubmitting ? 0.6 : 1 }}
                    >
                      {ticketSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTicketForm(false);
                        setTicketForm({ title: '', description: '', category: 'FACILITY', priority: 'MEDIUM' });
                        setTicketError('');
                      }}
                      style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tickets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No tickets created yet</p>
            ) : (
              <div className="tickets-list">
                {tickets.map(ticket => (
                  <div key={ticket.id} style={{ background: 'white', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4>{ticket.title}</h4>
                        <p style={{ color: '#666', marginBottom: '0.5rem' }}>{ticket.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                          <span className={`priority-badge ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span>
                          <span className={`status-badge ${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                          <span style={{ color: '#999' }}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g., Group Study" />
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