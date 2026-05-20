import React from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const SuperDashboard = () => {
  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        {/* Welcome Section - matching announcements header style */}
        <div className="sa-welcome-section">
          <div className="announcements-header">
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Dashboard</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Welcome to Super Admin Dashboard</p>
            </div>
          </div>
          
          {/* Quick Stats - matching the layout pattern */}
          <div className="sa-quick-stats">
            <div className="sa-stat-item">
              <span className="sa-stat-label">Last Updated</span>
              <span className="sa-stat-value">Today</span>
            </div>
            <div className="sa-stat-item">
              <span className="sa-stat-label">System Status</span>
              <span className="sa-stat-value" style={{ color: '#10b981' }}>Operational</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          <div className="sa-stat-card">
            <div className="sa-widget">
              <div className="sa-widget-icon">👥</div>
              <h3>Total Users</h3>
              <div className="sa-stat-value">1,234</div>
              <p className="sa-stat-label">All registered users</p>
            </div>
          </div>
          
          <div className="sa-stat-card">
            <div className="sa-widget">
              <div className="sa-widget-icon">🏢</div>
              <h3>Active Departments</h3>
              <div className="sa-stat-value">12</div>
              <p className="sa-stat-label">Across organization</p>
            </div>
          </div>
          
          <div className="sa-stat-card">
            <div className="sa-widget">
              <div className="sa-widget-icon">✅</div>
              <h3>Compliance Rate</h3>
              <div className="sa-stat-value">98%</div>
              <p className="sa-stat-label">Overall compliance</p>
            </div>
          </div>
          
          <div className="sa-stat-card">
            <div className="sa-widget">
              <div className="sa-widget-icon">📜</div>
              <h3>Active Certifications</h3>
              <div className="sa-stat-value">45</div>
              <p className="sa-stat-label">Current valid certs</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Section - matching table pattern */}
        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <div className="announcements-header">
            <h3>Recent Activity</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>User</th>
                <th>Department</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New user registered</td>
                <td>John Doe</td>
                <td>Engineering</td>
                <td>5 mins ago</td>
              </tr>
              <tr>
                <td>Certification renewed</td>
                <td>Jane Smith</td>
                <td>Operations</td>
                <td>1 hour ago</td>
              </tr>
              <tr>
                <td>Department updated</td>
                <td>Mike Johnson</td>
                <td>HR</td>
                <td>3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperDashboard;