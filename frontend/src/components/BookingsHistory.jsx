import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function BookingsHistory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState(''); // ✅ NEW

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, facilitiesRes] = await Promise.all([
        apiService.get(`/bookings/user/${user.id}`),
        apiService.get('/facilities')
      ]);
      setBookings(bookingsRes.data);
      setFacilities(facilitiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseLocalDateTime = (datetime) => {
    if (!datetime) return null;
    const cleaned = datetime.toString().replace(/Z$/, '').replace(/([+-]\d{2}:?\d{2})$/, '');
    const [datePart, timePart] = cleaned.split('T');
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = '00'] = timePart.split(':');

    return new Date(year, month - 1, day, Number(hour), Number(minute), Number(second));
  };

  const formatDate = (datetime) => {
    const d = parseLocalDateTime(datetime);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (datetime) => {
    const d = parseLocalDateTime(datetime);
    if (!d) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFacilityCapacity = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility?.capacity ?? 'N/A';
  };

  // ✅ FILTER + SEARCH COMBINED LOGIC
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      filter === 'ALL' ? true : b.status === filter;

    const matchesSearch =
      search === '' ||
      b.facilityName?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.expectedAttendees).includes(search);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="dashboard-loading">Loading booking history...</div>;
  }

  return (
    <div className="lecturer-dashboard">

      {/* ✅ HEADER */}
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          title="Back"
        >
          ←
        </button>

        {/* ✅ ROW 2: TITLE + SEARCH */}
        <div className="header-row-2">

          <h2>All Your Bookings</h2>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search facility or attendees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

        </div>
      </div>

      <div className="history-section">

        {/* ✅ FILTER BUTTONS */}
        <div className="section-header">
          <div className="history-stats">

            <span className={`stat-item ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
              <strong>{bookings.length}</strong> Total
            </span>

            <span className={`stat-item approved ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>
              <strong>{bookings.filter(b => b.status === 'APPROVED').length}</strong> Approved
            </span>

            <span className={`stat-item pending ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>
              <strong>{bookings.filter(b => b.status === 'PENDING').length}</strong> Pending
            </span>

            <span className={`stat-item rejected ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>
              <strong>{bookings.filter(b => b.status === 'REJECTED').length}</strong> Rejected
            </span>

            <span className={`stat-item cancelled ${filter === 'CANCELLED' ? 'active' : ''}`} onClick={() => setFilter('CANCELLED')}>
              <strong>{bookings.filter(b => b.status === 'CANCELLED').length}</strong> Cancelled
            </span>

          </div>
        </div>

        {/* ✅ TABLE */}
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th className="col-number">No.</th>
                <th>Facility</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendees</th>
                <th>Capacity</th>
                <th>Purpose</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {[...filteredBookings]
                .sort((a, b) =>
                  new Date(b.createdAt || b.bookingStart) -
                  new Date(a.createdAt || a.bookingStart)
                )
                .map((booking, index) => (
                  <tr key={booking.id} className={`history-row ${booking.status.toLowerCase()}`}>
                    <td className="col-number">{index + 1}</td>

                    <td className="facility-name" title={booking.facilityName}>
                      {booking.facilityName}
                    </td>

                    <td>{formatDate(booking.bookingStart)}</td>

                    <td>
                      {formatTime(booking.bookingStart)} - {formatTime(booking.bookingEnd)}
                    </td>

                    <td>{booking.expectedAttendees}</td>
                    <td>{getFacilityCapacity(booking.facilityId)}</td>

                    <td className="purpose-cell" title={booking.purpose}>
                      {booking.purpose}
                    </td>

                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}

                        {/* ✅ REJECTED INFO ICON */}
                        {booking.status === 'REJECTED' && (
                          <span
                            className="rejected-info-btn"
                            title={booking.rejectionReason || 'No reason provided'}
                          >
                            ℹ️
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="empty-history">
              <p>📚 No bookings found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}