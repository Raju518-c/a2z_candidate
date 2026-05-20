import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const LevelsManagement = () => {
  const [levels, setLevels] = useState([
    { id: 1, name: 'Entry Level', code: 'ENT', requirements: 'Basic knowledge', status: 'Active' },
    { id: 2, name: 'Intermediate', code: 'INT', requirements: '2+ years experience', status: 'Active' },
    { id: 3, name: 'Advanced', code: 'ADV', requirements: '5+ years experience', status: 'Active' },
    { id: 4, name: 'Expert', code: 'EXP', requirements: '8+ years experience', status: 'Inactive' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Levels Management</h2>
            <p>Total Levels: {levels.length}</p>
          </div>
          <button className="btn btn-primary">+ Add Level</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          {levels.map(level => (
            <div key={level.id} className="sa-stat-card">
              <div className="sa-level-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{level.name}</h3>
                <span className={`sa-status-badge ${level.status.toLowerCase()}`}>
                  {level.status}
                </span>
              </div>
              <div style={{ marginBottom: '8px' }}><strong>Code:</strong> {level.code}</div>
              <div style={{ marginBottom: '15px', color: '#6b7280' }}>{level.requirements}</div>
              <div>
                <button className="sa-action-btn edit">Edit</button>
                <button className="sa-action-btn delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default LevelsManagement;