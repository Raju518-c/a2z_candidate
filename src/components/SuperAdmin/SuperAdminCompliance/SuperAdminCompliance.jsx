import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const Compliance = () => {
  const [complianceItems, setComplianceItems] = useState([
    { id: 1, name: 'GDPR Compliance', status: 'Compliant', lastAudit: '2024-01-15', nextAudit: '2024-07-15' },
    { id: 2, name: 'ISO 27001', status: 'In Progress', lastAudit: '2024-02-01', nextAudit: '2024-08-01' },
    { id: 3, name: 'Data Privacy', status: 'Compliant', lastAudit: '2024-01-20', nextAudit: '2024-07-20' },
    { id: 4, name: 'Security Standards', status: 'Non-Compliant', lastAudit: '2024-02-10', nextAudit: '2024-08-10' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Compliance Management</h2>
            <p>Overall Compliance: 75%</p>
          </div>
          <button className="btn btn-primary">Run Compliance Check</button>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '12px' }}>Overall Compliance</h3>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: '75%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>75%</div>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Regulation</th>
                <th>Status</th>
                <th>Last Audit</th>
                <th>Next Audit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complianceItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <span className={`sa-compliance-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.lastAudit}</td>
                  <td>{item.nextAudit}</td>
                  <td>
                    <button className="sa-action-btn view">View Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Compliance;