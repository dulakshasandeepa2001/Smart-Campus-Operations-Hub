import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { facilityService } from '../services/apiService';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await facilityService.getAllFacilities();
      setFacilities(response.data);
    } catch (err) {
      setError('Failed to load facilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      try {
        const response = await facilityService.searchFacilities(searchKeyword);
        setFacilities(response.data);
      } catch (err) {
        setError('Search failed');
      }
    } else {
      fetchFacilities();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">Smart Campus Operations Hub</h1>
          <div className="navbar-user">
            <span className="user-info">Welcome, {user?.fullName}!</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Facilities Management</h2>
          <p>Manage and browse available facilities on campus</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search facilities by name, location, or building..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
            {searchKeyword && (
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  setSearchKeyword('');
                  fetchFacilities();
                }}
              >
                Reset
              </button>
            )}
          </form>
        </div>

        <div className="facilities-section">
          {loading ? (
            <div className="loading">Loading facilities...</div>
          ) : facilities.length === 0 ? (
            <div className="no-data">No facilities found</div>
          ) : (
            <div className="facilities-grid">
              {facilities.map((facility) => (
                <div key={facility.id} className="facility-card">
                  <div className="facility-status" data-status={facility.status.toLowerCase()}>
                    {facility.status}
                  </div>
                  <h3 className="facility-name">{facility.name}</h3>
                  <p className="facility-type">{facility.type.replace(/_/g, ' ')}</p>
                  
                  <div className="facility-details">
                    <div className="detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{facility.capacity} persons</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{facility.location}</span>
                    </div>
                    {facility.building && (
                      <div className="detail-item">
                        <span className="detail-label">Building:</span>
                        <span className="detail-value">{facility.building}</span>
                      </div>
                    )}
                    {facility.floor && (
                      <div className="detail-item">
                        <span className="detail-label">Floor:</span>
                        <span className="detail-value">{facility.floor}</span>
                      </div>
                    )}
                  </div>

                  {facility.description && (
                    <p className="facility-description">{facility.description}</p>
                  )}

                  <div className="facility-actions">
                    <button className="action-button view-btn">View Details</button>
                    <button className="action-button book-btn">Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
