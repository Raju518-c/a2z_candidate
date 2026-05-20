import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const ControlTower = () => {
  const [selectedView, setSelectedView] = useState('overview');

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="sa-welcome-section">
          <div className="announcements-header">
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Control Tower</h1>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Centralized System Monitoring</p>
            </div>
          </div>
        </div>
        
        <div className="sa-tabs" style={{ marginTop: '20px' }}>
          <button 
            className={`sa-tab ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </button>
          <button 
            className={`sa-tab ${selectedView === 'analytics' ? 'active' : ''}`}
            onClick={() => setSelectedView('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`sa-tab ${selectedView === 'alerts' ? 'active' : ''}`}
            onClick={() => setSelectedView('alerts')}
          >
            Alerts
          </button>
        </div>

        <div className="sa-content-area" style={{ marginTop: '20px' }}>
          {selectedView === 'overview' && (
            <div className="sa-stats-grid">
              <div className="sa-stat-card">
                <h3>System Health</h3>
                <div className="sa-health-indicator" style={{ padding: '12px 0' }}>🟢 All Systems Operational</div>
              </div>
              <div className="sa-stat-card">
                <h3>Active Sessions</h3>
                <div className="sa-stat-value">156</div>
              </div>
              <div className="sa-stat-card">
                <h3>Pending Approvals</h3>
                <div className="sa-stat-value">23</div>
              </div>
            </div>
          )}
          {selectedView === 'analytics' && (
            <div className="sa-table-card">
              <h3>System Analytics Dashboard</h3>
              <p style={{ padding: '20px 0', color: '#6b7280' }}>Real-time analytics and metrics will appear here</p>
            </div>
          )}
          {selectedView === 'alerts' && (
            <div className="sa-table-card">
              <h3>System Alerts</h3>
              <div className="sa-alert-list" style={{ padding: '12px 0' }}>
                <div className="sa-alert-item info" style={{ padding: '8px 0' }}>📊 Weekly report ready for review</div>
                <div className="sa-alert-item warning" style={{ padding: '8px 0' }}>⚠️ Backup completed with warnings</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ControlTower;