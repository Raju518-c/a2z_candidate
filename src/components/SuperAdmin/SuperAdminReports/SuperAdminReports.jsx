import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const Reports = () => {
  const [reportType, setReportType] = useState('users');

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Reports Dashboard</h2>
            <p>Generate and view reports</p>
          </div>
          <button className="btn btn-primary">Export Report</button>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }}>
              <option value="users">User Report</option>
              <option value="compliance">Compliance Report</option>
              <option value="financial">Financial Report</option>
              <option value="performance">Performance Report</option>
            </select>
            <input type="date" style={{ padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }} />
            <input type="date" style={{ padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }} />
            <button className="btn btn-primary">Generate</button>
          </div>
        </div>

        <div className="sa-table-card">
          <div style={{ marginBottom: '16px' }}>
            <h3>{reportType.toUpperCase()} Report</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            background: '#f9fafb', 
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '48px'
          }}>
            📊
            <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '16px' }}>Report data visualization will appear here</p>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Records</td>
                <td>1,234</td>
                <td className="sa-positive">+12%</td>
              </tr>
              <tr>
                <td>Active Items</td>
                <td>987</td>
                <td className="sa-positive">+5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Reports;