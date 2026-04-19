import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/apiService';
import '../styles/dashboards.css';

export default function TechnicianDashboard() {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const facilitiesRes = await apiService.get('/facilities');
      setFacilities(facilitiesRes.data);
      
      // Simulate maintenance tasks
      const tasks = facilitiesRes.data
        .filter(f => f.status !== 'ACTIVE')
        .map((f, idx) => ({
          id: idx,
          facilityId: f.id,
          facilityName: f.name,
          taskType: f.status === 'MAINTENANCE' ? 'Maintenance' : 'Repair',
          priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
          status: 'PENDING',
          assignedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }));
      setMaintenanceTasks(tasks);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (taskId) => {
    setMaintenanceTasks(maintenanceTasks.map(t =>
      t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t
    ));
    alert('Task started! Remember to update status when completed.');
  };

  const handleCompleteTask = (taskId) => {
    setMaintenanceTasks(maintenanceTasks.map(t =>
      t.id === taskId ? { ...t, status: 'COMPLETED' } : t
    ));
    alert('Task marked as completed!');
  };

  const stats = {
    totalFacilities: facilities.length,
    maintenanceNeeded: facilities.filter(f => f.status === 'MAINTENANCE').length,
    outOfService: facilities.filter(f => f.status === 'OUT_OF_SERVICE').length,
    activeTasksCount: maintenanceTasks.filter(t => t.status === 'IN_PROGRESS').length
  };

  if (loading) {
    return <div className="dashboard-loading">Loading technician dashboard...</div>;
  }

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <h1>Technician Dashboard</h1>
        <p className="user-info">Welcome, {user?.fullName}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalFacilities}</h3>
          <p>Total Facilities</p>
        </div>
        <div className="stat-card alert">
          <h3>{stats.maintenanceNeeded}</h3>
          <p>Maintenance Needed</p>
        </div>
        <div className="stat-card alert">
          <h3>{stats.outOfService}</h3>
          <p>Out of Service</p>
        </div>
        <div className="stat-card">
          <h3>{stats.activeTasksCount}</h3>
          <p>Active Tasks</p>
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
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Maintenance Tasks
        </button>
        <button
          className={`tab-button ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Facilities Status
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>System Health Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>🔧 Priority Maintenance Tasks</h3>
                <div className="task-summary">
                  {maintenanceTasks
                    .filter(t => t.priority === 'HIGH')
                    .slice(0, 5)
                    .map(task => (
                      <div key={task.id} className="task-item high-priority">
                        <strong>{task.facilityName}</strong>
                        <p>{task.taskType}</p>
                        <small>{task.assignedDate.toLocaleDateString()}</small>
                      </div>
                    ))}
                  {maintenanceTasks.filter(t => t.priority === 'HIGH').length === 0 && (
                    <p className="empty-message">No high priority tasks</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <h3>⚡ System Status</h3>
                <ul className="status-list">
                  <li>
                    <span className="status-indicator active"></span>
                    <span>{stats.totalFacilities - stats.maintenanceNeeded - stats.outOfService} Facilities Active</span>
                  </li>
                  <li>
                    <span className="status-indicator maintenance"></span>
                    <span>{stats.maintenanceNeeded} Under Maintenance</span>
                  </li>
                  <li>
                    <span className="status-indicator offline"></span>
                    <span>{stats.outOfService} Out of Service</span>
                  </li>
                  <li>
                    <span className="status-indicator task"></span>
                    <span>{stats.activeTasksCount} Active Work Orders</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <h2>Assigned Maintenance Tasks</h2>
            {maintenanceTasks.length === 0 ? (
              <p className="empty-message">No maintenance tasks assigned</p>
            ) : (
              <div>
                <div className="task-filters">
                  <button className="filter-tag">All ({maintenanceTasks.length})</button>
                  <button className="filter-tag">Pending ({maintenanceTasks.filter(t => t.status === 'PENDING').length})</button>
                  <button className="filter-tag">In Progress ({maintenanceTasks.filter(t => t.status === 'IN_PROGRESS').length})</button>
                  <button className="filter-tag">Completed ({maintenanceTasks.filter(t => t.status === 'COMPLETED').length})</button>
                </div>

                <div className="tasks-list">
                  {maintenanceTasks.map(task => (
                    <div key={task.id} className={`task-card ${task.priority.toLowerCase()}-priority ${task.status.toLowerCase()}`}>
                      <div className="task-header">
                        <h3>{task.facilityName}</h3>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className={`status ${task.status}`}>{task.status}</span>
                      </div>
                      <div className="task-details">
                        <p><strong>Task Type:</strong> {task.taskType}</p>
                        <p><strong>Assigned:</strong> {task.assignedDate.toLocaleDateString()}</p>
                      </div>
                      <div className="task-actions">
                        {task.status === 'PENDING' && (
                          <button 
                            className="btn-primary"
                            onClick={() => handleStartTask(task.id)}
                          >
                            Start Task
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button 
                            className="btn-success"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            Mark Complete
                          </button>
                        )}
                        {task.status === 'COMPLETED' && (
                          <span className="btn-disabled">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-section">
            <h2>Facilities Status Report</h2>
            <div className="facilities-status-grid">
              {facilities.map(facility => (
                <div
                  key={facility.id}
                  className={`facility-status-card ${facility.status.toLowerCase()}`}
                  onClick={() => setSelectedFacility(facility)}
                >
                  <h3>{facility.name}</h3>
                  <p className="location">{facility.building}, Floor {facility.floor}</p>
                  <p className="type">{facility.type}</p>
                  <div className="status-badge">
                    <span className={`indicator ${facility.status.toLowerCase()}`}></span>
                    {facility.status}
                  </div>
                  {facility.equipment && (
                    <p className="equipment">🔧 {facility.equipment}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedFacility && (
              <div className="facility-details-modal">
                <div className="modal-content">
                  <button className="close-btn" onClick={() => setSelectedFacility(null)}>×</button>
                  <h2>{selectedFacility.name}</h2>
                  <div className="details">
                    <p><strong>Type:</strong> {selectedFacility.type}</p>
                    <p><strong>Capacity:</strong> {selectedFacility.capacity}</p>
                    <p><strong>Location:</strong> {selectedFacility.building}, Floor {selectedFacility.floor}</p>
                    <p><strong>Status:</strong> <span className={`status ${selectedFacility.status}`}>{selectedFacility.status}</span></p>
                    {selectedFacility.equipment && <p><strong>Equipment:</strong> {selectedFacility.equipment}</p>}
                    {selectedFacility.description && <p><strong>Description:</strong> {selectedFacility.description}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
