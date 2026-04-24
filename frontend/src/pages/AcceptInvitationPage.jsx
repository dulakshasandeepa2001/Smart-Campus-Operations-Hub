import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import '../styles/auth.css';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await apiService.get(`/invitations/${token}`);
      setInvitation(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invitation details');
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

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!/^[0-9\-\+\(\)\s]+$/.test(formData.phoneNumber)) {
      setError('Invalid phone number format');
      return false;
    }

    return true;
  };

  const handleAcceptInvitation = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.post('/invitations/accept', {
        invitationToken: token,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });

      if (response.data.success) {
        setMessage('Invitation accepted successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="loading-spinner"></div>
          <p>Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="auth-container">
        <div className="auth-box error-box">
          <h2>Invitation Error</h2>
          <div className="alert alert-error">{error}</div>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-box invitation-box">
        <div className="auth-header">
          <h2>Welcome, {invitation.fullName}!</h2>
          <p className="subtitle">Complete your account activation</p>
        </div>

        <div className="invitation-details">
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{invitation.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-pending">{invitation.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Expires:</span>
            <span className="detail-value">
              {new Date(invitation.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleAcceptInvitation}>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            <small>At least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Activating...' : 'Activate Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}
