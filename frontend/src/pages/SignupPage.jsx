import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/apiService';
import '../styles/auth.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    phoneNumber: '',
    department: '',
    lecturerId: '',
    lectureMail: '',
    technicianId: '',
    privateMail: '',
    role: 'STUDENT',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // Get required field name based on role
  const getRoleSpecificField = () => {
    switch (formData.role) {
      case 'STUDENT':
        return 'studentId';
      case 'LECTURER':
        return 'lecturerId';
      case 'TECHNICIAN':
        return 'technicianId';
      case 'ADMIN':
        return 'adminId'; // Admin doesn't need specific ID
      default:
        return 'studentId';
    }
  };

  const validateForm = () => {
    const requiredFields = ['email', 'password', 'confirmPassword', 'fullName', 'role'];
    
    // Add role-specific required fields
    if (formData.role === 'STUDENT') {
      requiredFields.push('studentId', 'department');
    } else if (formData.role === 'LECTURER') {
      requiredFields.push('lecturerId', 'lectureMail');
    } else if (formData.role === 'TECHNICIAN') {
      requiredFields.push('technicianId', 'privateMail');
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        return { valid: false, message: `Please fill in all required fields` };
      }
    }

    if (formData.password !== formData.confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }

    if (formData.password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(formData);
      
      // Show success message
      setSuccessMessage('✓ Signup successful! Your account has been created. Redirecting to login...');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        studentId: '',
        phoneNumber: '',
        department: '',
        lecturerId: '',
        lectureMail: '',
        technicianId: '',
        privateMail: '',
        role: 'STUDENT',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Smart Campus Operations Hub</h1>
          <p>{successMessage ? 'Account Created Successfully' : 'Create your account'}</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
            <div style={{ marginTop: '16px' }}>
              <button 
                onClick={() => navigate('/login')}
                className="auth-button"
                style={{ backgroundColor: 'var(--success-color)' }}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {!successMessage && (
          <>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {/* STUDENT FIELDS */}
          {formData.role === 'STUDENT' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  id="studentId"
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="ST12345"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Engineering"
                  required
                />
              </div>
            </div>
          )}

          {/* LECTURER FIELDS */}
          {formData.role === 'LECTURER' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lecturerId">Lecture ID *</label>
                <input
                  id="lecturerId"
                  type="text"
                  name="lecturerId"
                  value={formData.lecturerId}
                  onChange={handleChange}
                  placeholder="LEC001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lectureMail">Lecture Mail *</label>
                <input
                  id="lectureMail"
                  type="email"
                  name="lectureMail"
                  value={formData.lectureMail}
                  onChange={handleChange}
                  placeholder="lecturer@university.edu"
                  required
                />
              </div>
            </div>
          )}

          {/* TECHNICIAN FIELDS */}
          {formData.role === 'TECHNICIAN' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="technicianId">Technician ID *</label>
                <input
                  id="technicianId"
                  type="text"
                  name="technicianId"
                  value={formData.technicianId}
                  onChange={handleChange}
                  placeholder="TECH001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="privateMail">Private Mail *</label>
                <input
                  id="privateMail"
                  type="email"
                  name="privateMail"
                  value={formData.privateMail}
                  onChange={handleChange}
                  placeholder="tech@company.edu"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          {formData.role === 'STUDENT' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign In Here</Link>
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
