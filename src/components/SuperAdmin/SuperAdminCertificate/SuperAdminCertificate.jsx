import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const Certifications = () => {
  const [certifications, setCertifications] = useState([
    { id: 1, name: 'AWS Solutions Architect', provider: 'Amazon', validity: '3 years', status: 'Active' },
    { id: 2, name: 'PMP Certification', provider: 'PMI', validity: '3 years', status: 'Active' },
    { id: 3, name: 'CISSP', provider: 'ISC2', validity: '3 years', status: 'Expiring Soon' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Certifications</h2>
            <p>Total Certifications: {certifications.length}</p>
          </div>
          <button className="btn btn-primary">+ Add Certification</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          {certifications.map(cert => (
            <div key={cert.id} className="sa-stat-card">
              <div className="sa-widget-icon" style={{ fontSize: '32px', marginBottom: '12px' }}>📜</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{cert.name}</h3>
              <div style={{ color: '#6b7280', marginBottom: '4px' }}>{cert.provider}</div>
              <div style={{ color: '#6b7280', marginBottom: '12px' }}>Validity: {cert.validity}</div>
              <span className={`sa-status-badge ${cert.status.toLowerCase().replace(' ', '-')}`}>
                {cert.status}
              </span>
              <div style={{ marginTop: '12px' }}>
                <button className="sa-action-btn edit">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Certifications;