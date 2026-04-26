import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';
import '../styles/ticket.css';

export default function TicketsList({ userRole, userId }) {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, assigned, resolved
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [userRole, userId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let response;

      if (userRole === 'STUDENT') {
        response = await authService.get(`/api/tickets/student/${userId}`);
      } else if (userRole === 'LECTURER' || userRole === 'TECHNICIAN' || userRole === 'ADMIN') {
        response = await authService.get('/api/tickets/all');
      } else {
        response = await authService.get(`/api/tickets/all`);
      }

      setTickets(response.data.tickets || []);
      applyFilter(response.data.tickets || [], filter);
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (ticketList, filterType) => {
    let filtered = ticketList;

    switch (filterType) {
      case 'open':
        filtered = ticketList.filter(t => t.status === 'OPEN');
        break;
      case 'in-progress':
        filtered = ticketList.filter(t => t.status === 'IN_PROGRESS');
        break;
      case 'resolved':
        filtered = ticketList.filter(t => t.status === 'RESOLVED');
        break;
      case 'assigned':
        filtered = ticketList.filter(t => t.assignedToId === userId);
        break;
      default:
        filtered = ticketList;
    }

    setFilteredTickets(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(tickets, newFilter);
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'badge-open';
      case 'IN_PROGRESS':
        return 'badge-in-progress';
      case 'RESOLVED':
        return 'badge-resolved';
      case 'CLOSED':
        return 'badge-closed';
      default:
        return 'badge-default';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  if (loading) {
    return <div className="tickets-container"><p>Loading tickets...</p></div>;
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h2>Support Tickets</h2>
        <p>Total Tickets: {filteredTickets.length}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All ({tickets.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
          onClick={() => handleFilterChange('open')}
        >
          Open
        </button>
        <button 
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => handleFilterChange('in-progress')}
        >
          In Progress
        </button>
        <button 
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => handleFilterChange('assigned')}
        >
          Assigned to Me
        </button>
        <button 
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => handleFilterChange('resolved')}
        >
          Resolved
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <p>No tickets found</p>
        </div>
      ) : (
        <div className="tickets-list">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => handleViewTicket(ticket.id)}>
              <div className="ticket-card-header">
                <div className="ticket-title-section">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <span className={`ticket-id`}>#{ticket.id.substring(0, 8)}</span>
                </div>
                <div className="ticket-badges">
                  <span className={`badge status-badge ${getStatusBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`badge priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <p className="ticket-description">{ticket.description.substring(0, 100)}...</p>

              <div className="ticket-meta">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{ticket.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created by:</span>
                  <span className="meta-value">{ticket.createdByName}</span>
                </div>
                {ticket.assignedToName && (
                  <div className="meta-item">
                    <span className="meta-label">Assigned to:</span>
                    <span className="meta-value">{ticket.assignedToName}</span>
                  </div>
                )}
              </div>

              <div className="ticket-footer">
                <span className="comment-count">💬 {ticket.commentCount} comments</span>
                <span className="created-date">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
