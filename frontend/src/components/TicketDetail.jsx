import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';
import '../styles/ticket.css';

export default function TicketDetail({ userRole, userId }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await authService.get(`/api/tickets/${ticketId}`);
      setTicket(response.data.ticket);
    } catch (err) {
      setError('Failed to load ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await authService.get(`/api/tickets/${ticketId}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await authService.post(`/api/tickets/${ticketId}/comment?userId=${userId}`, {
        comment: newComment
      });
      setNewComment('');
      setMessage('Comment added successfully');
      fetchComments();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await authService.put(
        `/api/tickets/${ticketId}/status?status=${newStatus}`
      );
      setTicket(response.data.ticket);
      setMessage('Status updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedAssignee) {
      setError('Please select a staff member');
      return;
    }

    try {
      const response = await authService.put(
        `/api/tickets/${ticketId}/assign?assignedToId=${selectedAssignee}`
      );
      setTicket(response.data.ticket);
      setShowAssignForm(false);
      setSelectedAssignee('');
      setMessage('Ticket assigned successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign ticket');
    }
  };

  if (loading) {
    return <div className="ticket-detail-container"><p>Loading ticket...</p></div>;
  }

  if (!ticket) {
    return <div className="ticket-detail-container"><p>Ticket not found</p></div>;
  }

  const isCreator = ticket.createdById === userId;
  const isAssigned = ticket.assignedToId === userId;
  const isStaff = userRole === 'LECTURER' || userRole === 'TECHNICIAN' || userRole === 'ADMIN';

  return (
    <div className="ticket-detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="ticket-detail-card">
        <div className="ticket-detail-header">
          <div>
            <h1>{ticket.title}</h1>
            <p className="ticket-id">Ticket ID: #{ticket.id}</p>
          </div>
          <div className="ticket-status">
            <span className={`badge status-badge badge-${ticket.status.toLowerCase().replace('_', '-')}`}>
              {ticket.status}
            </span>
            <span className={`badge priority-badge priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className="ticket-detail-content">
          <div className="detail-section">
            <h3>Description</h3>
            <p className="description-text">{ticket.description}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>Category</label>
              <p>{ticket.category}</p>
            </div>
            <div className="detail-item">
              <label>Created by</label>
              <p>{ticket.createdByName}</p>
            </div>
            <div className="detail-item">
              <label>Assigned to</label>
              <p>{ticket.assignedToName || 'Unassigned'}</p>
            </div>
            <div className="detail-item">
              <label>Created on</label>
              <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status Update Section - for assigned staff */}
          {isAssigned && (
            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                <button 
                  className="btn-status"
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={ticket.status === 'IN_PROGRESS'}
                >
                  Start Progress
                </button>
                <button 
                  className="btn-status"
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={ticket.status === 'RESOLVED'}
                >
                  Mark as Resolved
                </button>
                <button 
                  className="btn-status btn-secondary"
                  onClick={() => handleStatusChange('ON_HOLD')}
                  disabled={ticket.status === 'ON_HOLD'}
                >
                  Put On Hold
                </button>
              </div>
            </div>
          )}

          {/* Assign Ticket Section - for admin/staff */}
          {isStaff && !ticket.assignedToId && (
            <div className="detail-section">
              <h3>Assign Ticket</h3>
              {!showAssignForm ? (
                <button className="btn-assign" onClick={() => setShowAssignForm(true)}>
                  Assign This Ticket
                </button>
              ) : (
                <div className="assign-form">
                  <input 
                    type="text"
                    placeholder="Enter staff member name or ID"
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                  />
                  <button className="btn-submit" onClick={handleAssignTicket}>Assign</button>
                  <button className="btn-cancel" onClick={() => setShowAssignForm(false)}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="detail-section comments-section">
            <h3>Comments ({comments.length})</h3>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button type="submit" className="btn-submit">Add Comment</button>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
