import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import LecturerInvitationManager from './LecturerInvitationManager';
import '../styles/dashboards.css';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [ticketFilter, setTicketFilter] = useState('all'); // all, unassigned, open, in-progress, resolved
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 0,
    location: '',
    building: '',
    floor: '',
    status: 'ACTIVE',
    description: '',
    equipment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, pendingBookingsRes, allBookingsRes, ticketsRes, unassignedRes, techniciansRes] = await Promise.all([
        apiService.get('/facilities'),
        apiService.get('/bookings/admin/pending'),
        apiService.get('/bookings/admin/all'),
        apiService.get('/tickets/all'),
        apiService.get('/tickets/unassigned'),
        apiService.get('/tickets/technicians') // Fixed endpoint path
      ]);
      setFacilities(facilitiesRes.data);
      setPendingBookings(pendingBookingsRes.data);
      setAllBookings(allBookingsRes.data);
      setTickets(ticketsRes.data?.tickets || []);
      setUnassignedTickets(unassignedRes.data?.tickets || []);
      setTechnicians(techniciansRes.data?.technicians || []); // Updated response field
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't fail the entire dashboard if technicians fetch fails
      setFacilities([]);
      setPendingBookings([]);
      setAllBookings([]);
      setTickets([]);
      setUnassignedTickets([]);
      setTechnicians([]); // Set empty technicians list on error
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    if (!selectedTechnician) {
      alert('Please select a technician');
      return;
    }
    try {
      await apiService.put(`/tickets/${ticketId}/assign?assignedToId=${selectedTechnician}`);
      alert('Ticket assigned successfully!');
      setAssigningTicket(null);
      setSelectedTechnician('');
      fetchData();
    } catch (error) {
      alert('Error assigning ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await apiService.put(`/tickets/${ticketId}/status?status=${newStatus}`);
      alert('Ticket status updated successfully!');
      fetchData();
    } catch (error) {
      alert('Error updating ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  const getFilteredTickets = () => {
    if (ticketFilter === 'unassigned') {
      return unassignedTickets;
    }
    return tickets.filter(t => {
      if (ticketFilter === 'all') return true;
      return t.status === ticketFilter.toUpperCase();
    });
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.put(`/facilities/${editingId}`, newFacility);
        alert('Facility updated successfully!');
        setEditingId(null);
      } else {
        await apiService.post('/facilities', newFacility);
        alert('Facility added successfully!');
      }
      setNewFacility({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 0,
        location: '',
        building: '',
        floor: '',
        status: 'ACTIVE',
        description: '',
        equipment: ''
      });
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditFacility = (facility) => {
    setNewFacility(facility);
    setEditingId(facility.id);
    setActiveTab('facilities');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewFacility({
      name: '',
      type: 'LECTURE_HALL',
      capacity: 0,
      location: '',
      building: '',
      floor: '',
      status: 'ACTIVE',
      description: '',
      equipment: ''
    });
  };

  const handleDeleteFacility = async (facilityId) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await apiService.delete(`/facilities/${facilityId}`);
        alert('Facility deleted successfully!');
        setShowDeleteConfirm(null);
        fetchData();
      } catch (error) {
        alert('Error deleting facility: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await apiService.put(`/bookings/${bookingId}/status`, {
        status: 'APPROVED'
      }, {
        headers: { 'X-User-Id': user?.id }
      });
      fetchData();
      alert('Booking approved!');
    } catch (error) {
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
        }, {
          headers: { 'X-User-Id': user?.id }
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
    pendingBookings: pendingBookings.length,
    totalBookings: allBookings.length
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
          className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets ({unassignedTickets.length} Unassigned)
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
        <button
          className={`tab-button ${activeTab === 'all-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-bookings')}
        >
          All Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          Lecturer Invitations
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>System Overview</h2>
            <div className="overview-card">
              <h3>Ticket Summary</h3>
              <ul>
                <li>Total Tickets: {tickets.length}</li>
                <li>Unassigned: {unassignedTickets.length}</li>
              </ul>
            </div>
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

        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <h2>Ticket Management</h2>
            <div className="ticket-filters">
              <label>Filter by Status: </label>
              <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)}>
                <option value="all">All Tickets</option>
                <option value="unassigned">Unassigned</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            {getFilteredTickets().length === 0 ? (
              <p className="no-data">No tickets found</p>
            ) : (
              <div className="tickets-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Created By</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTickets().map(ticket => (
                      <tr key={ticket.id}>
                        <td>{ticket.id?.substring(0, 8)}...</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.createdByName}</td>
                        <td><span className={`priority-badge ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span></td>
                        <td><span className={`status-badge ${ticket.status?.toLowerCase()}`}>{ticket.status}</span></td>
                        <td>{ticket.assignedToName || 'Unassigned'}</td>
                        <td>
                          {!ticket.assignedToName && (
                            <button 
                              className="btn-small btn-assign"
                              onClick={() => setAssigningTicket(ticket.id)}
                            >
                              Assign
                            </button>
                          )}
                          {ticket.assignedToName && (
                            <>
                              <button 
                                className="btn-small btn-status"
                                onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                              >
                                Resolve
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {assigningTicket && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Assign Ticket to Technician</h3>
                  <select 
                    value={selectedTechnician} 
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Select Technician --</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="modal-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAssignTicket(assigningTicket)}
                    >
                      Assign
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setAssigningTicket(null);
                        setSelectedTechnician('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-section">
            <h2>{editingId ? 'Edit Facility' : 'Add New Facility'}</h2>
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
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newFacility.description || ''}
                  onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                  placeholder="Enter facility description"
                  rows="3"
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
              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={newFacility.status}
                    onChange={(e) => setNewFacility({ ...newFacility, status: e.target.value })}
                  >
                    <option>ACTIVE</option>
                    <option>INACTIVE</option>
                    <option>MAINTENANCE</option>
                    <option>OUT_OF_SERVICE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Equipment</label>
                  <input
                    type="text"
                    value={newFacility.equipment || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, equipment: e.target.value })}
                    placeholder="e.g., Projector, Whiteboard"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Facility' : 'Add Facility'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 style={{ marginTop: '2rem' }}>Existing Facilities</h2>
            <div className="facilities-list">
              {facilities.map(facility => (
                <div key={facility.id} className="facility-item">
                  <div className="facility-header">
                    <h3>{facility.name}</h3>
                    <span className={`status ${facility.status}`}>{facility.status}</span>
                  </div>
                  {facility.description && (
                    <p><strong>Description:</strong> {facility.description}</p>
                  )}
                  <p><strong>Type:</strong> {facility.type}</p>
                  <p><strong>Capacity:</strong> {facility.capacity} people</p>
                  {facility.location && (
                    <p><strong>Location:</strong> {facility.location}</p>
                  )}
                  {facility.building && (
                    <p><strong>Building:</strong> {facility.building}</p>
                  )}
                  {facility.floor && (
                    <p><strong>Floor:</strong> {facility.floor}</p>
                  )}
                  {facility.equipment && (
                    <p><strong>Equipment:</strong> {facility.equipment}</p>
                  )}
                  <div className="facility-actions">
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => handleEditFacility(facility)}
                    >
                      ✎ Edit
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDeleteFacility(facility.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
              {facilities.length === 0 && (
                <p className="no-data">No facilities found. Add one to get started!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Pending Bookings</h2>
            <div className="bookings-list">
              {pendingBookings
                .filter(b => b.status === 'PENDING')
                .map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.facilityName}</h3>
                      <span className={`status pending`}>{booking.status}</span>
                    </div>
                    <p><strong>Booked By:</strong> {booking.userId}</p>
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

        {activeTab === 'all-bookings' && (
          <div className="bookings-section">
            <h2>All Bookings</h2>
            <div className="bookings-list">
              {[...allBookings]
                .sort((a, b) => new Date(b.createdAt || b.bookingStart) - new Date(a.createdAt || a.bookingStart))
                .map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.facilityName}</h3>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    <p><strong>Booked By:</strong> {booking.userId}</p>
                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                    <p><strong>Date:</strong> {new Date(booking.bookingStart).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(booking.bookingStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.bookingEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                    {booking.status === 'REJECTED' && booking.rejectionReason && (
                      <p className="rejection-reason"><strong>Reason:</strong> {booking.rejectionReason}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <LecturerInvitationManager />
        )}
      </div>

      <hr className="dashboard-divider" />
    </div>
  );
}