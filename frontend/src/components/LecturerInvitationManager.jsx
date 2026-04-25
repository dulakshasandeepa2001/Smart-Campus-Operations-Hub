import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import '../styles/invitation.css';

export default function LecturerInvitationManager() {
  const [invitations, setInvitations] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-invitations');

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    lecturerId: ''
  });

  useEffect(() => {
    fetchInvitations();
    if (activeTab === 'pending') {
      fetchPendingInvitations();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/invitations/my-invitations');
      if (response.data.success) {
        setInvitations(response.data.invitations);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err.response?.data?.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/invitations/pending');
      if (response.data.success) {
        setPendingInvitations(response.data.invitations);
      }
    } catch (err) {
      console.error('Error fetching pending invitations:', err);
      setError(err.response?.data?.message || 'Failed to load pending invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.email || !formData.fullName || !formData.lecturerId) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post('/invitations/send', formData);

      if (response.data.success) {
        setMessage(`Invitation sent successfully to ${formData.email}`);
        setFormData({ email: '', fullName: '', lecturerId: '' });
        setShowForm(false);
        fetchInvitations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'status-pending',
      'Accepted': 'status-accepted',
      'Expired': 'status-expired',
      'Rejected': 'status-rejected'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  return (
    <div className="invitation-container">
      <div className="invitation-header">
        <h2>Lecturer Invitation Management</h2>
        <p className="subtitle">Send and manage invitations for lecturers to activate their accounts</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="invitation-tabs">
        <button
          className={`tab-button ${activeTab === 'my-invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-invitations')}
        >
          My Invitations ({invitations.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          All Pending ({pendingInvitations.length})
        </button>
      </div>

      {activeTab === 'my-invitations' && (
        <div className="invitation-section">
          <div className="section-header">
            <h3>My Sent Invitations</h3>
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Cancel' : '+ Send New Invitation'}
            </button>
          </div>

          {showForm && (
            <div className="invitation-form">
              <form onSubmit={handleSendInvitation}>
                <div className="form-group">
                  <label htmlFor="email">Lecturer Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="lecturer@university.edu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lecturerId">Lecturer ID *</label>
                  <input
                    type="text"
                    id="lecturerId"
                    name="lecturerId"
                    value={formData.lecturerId}
                    onChange={handleInputChange}
                    placeholder="LEC001"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && activeTab === 'my-invitations' ? (
            <div className="loading">Loading invitations...</div>
          ) : invitations.length > 0 ? (
            <div className="invitations-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Lecturer ID</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                    <th>Sent Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.email}</td>
                      <td>{inv.fullName}</td>
                      <td>{inv.lecturerId}</td>
                      <td>{getStatusBadge(inv.status)}</td>
                      <td>{formatDate(inv.expiryDate)}</td>
                      <td>{formatDate(inv.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No invitations sent yet. Click the button above to send one.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="invitation-section">
          <h3>All Pending Lecturer Invitations</h3>

          {loading ? (
            <div className="loading">Loading pending invitations...</div>
          ) : pendingInvitations.length > 0 ? (
            <div className="invitations-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Lecturer ID</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                    <th>Sent Date</th>
                    <th>Sent By</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvitations.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.email}</td>
                      <td>{inv.fullName}</td>
                      <td>{inv.lecturerId}</td>
                      <td>{getStatusBadge(inv.status)}</td>
                      <td>{formatDate(inv.expiryDate)}</td>
                      <td>{formatDate(inv.createdAt)}</td>
                      <td>Admin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No pending invitations at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
