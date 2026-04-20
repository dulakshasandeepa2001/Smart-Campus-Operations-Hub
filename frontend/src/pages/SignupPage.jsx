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
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Section - Hero Image */}
        <div className="login-hero">
          <div className="hero-top-nav" style={{ justifyContent: 'flex-end' }}>
            <div className="hero-nav-links">
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/signup" className="nav-link-btn">Join Us</Link>
            </div>
          </div>
        </div>

        {/* Right Section - Signup Form */}
        <div className="login-form-section">
          {/* Header */}
          <div className="login-top-bar">
            <div className="logo-text">UISOCIAL</div>
            <div className="language-selector">
              <span>🇬🇧 EN ˅</span>
            </div>
          </div>

          {successMessage && (
            <div className="success-message">
              {successMessage}
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={() => navigate('/login')}
                  className="login-button"
                  style={{ backgroundColor: 'var(--success-color)' }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}

          {!successMessage && (
            <div className="login-content">
              <div className="greeting">
                <h1>hi everyone</h1>
                <p>welcome to sliit - Create your account</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="modern-auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name *"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="form-input"
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
                      <input
                        id="studentId"
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="Student ID (ST12345) *"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        id="department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Department *"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                {/* LECTURER FIELDS */}
                {formData.role === 'LECTURER' && (
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        id="lecturerId"
                        type="text"
                        name="lecturerId"
                        value={formData.lecturerId}
                        onChange={handleChange}
                        placeholder="Lecture ID (LEC001) *"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        id="lectureMail"
                        type="email"
                        name="lectureMail"
                        value={formData.lectureMail}
                        onChange={handleChange}
                        placeholder="Lecture Mail *"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                {/* TECHNICIAN FIELDS */}
                {formData.role === 'TECHNICIAN' && (
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        id="technicianId"
                        type="text"
                        name="technicianId"
                        value={formData.technicianId}
                        onChange={handleChange}
                        placeholder="Technician ID (TECH001) *"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        id="privateMail"
                        type="email"
                        name="privateMail"
                        value={formData.privateMail}
                        onChange={handleChange}
                        placeholder="Private Mail *"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    required
                    className="form-input"
                  />
                </div>

                {formData.role === 'STUDENT' && (
                  <div className="form-row" style={{ marginBottom: '-8px' }}>
                    <div className="form-group" style={{ width: '100%' }}>
                      <input
                        id="phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number (Optional)"
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password (Min 6 chars) *"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password *"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  style={{ marginTop: '10px' }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="signup-prompt" style={{ marginTop: '10px' }}>
                <p>Already have an account? <Link to="/login">Sign in</Link></p>
              </div>
            </div>
          )}

          {/* Footer - Social Icons */}
          <div className="login-footer">
            <div className="social-icons">
              <a href="#" className="social-icon" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" title="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 002.856-3.632c-3.118 1.409-6.513 2.376-10.033 2.959 3.119-1.479 5.588-4.076 6.75-7.093-2.905 1.745-6.126 3.027-9.556 3.715-2.773-2.937-6.925-4.74-11.423-4.74-8.671 0-15.708 7.037-15.708 15.708 0 1.23.143 2.437.405 3.605C1.816 10.742 10.279 5.33 19.078 5.55c-2.237-5.51-7.583-9.47-13.995-9.47-8.671 0-15.708 7.037-15.708 15.708 0 1.23.143 2.437.405 3.605C1.816 10.742 10.279 5.33 19.078 5.55c2.267.5 4.42 1.383 6.341 2.637-1.566-1.894-3.896-3.08-6.478-3.08z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 15.892c-1.002 1.624-2.708 2.717-4.745 2.717-3.073 0-5.564-2.556-5.564-5.712 0-3.156 2.49-5.712 5.564-5.712 2.037 0 3.743 1.092 4.745 2.717h2.102c-1.148-2.775-3.993-4.649-6.847-4.649-4.383 0-7.941 3.479-7.941 7.807 0 4.328 3.558 7.807 7.941 7.807 2.854 0 5.699-1.874 6.847-4.649h-2.102z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
