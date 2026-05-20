import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState([
    { id: 1, name: 'Partner A', commission: '15%', earnings: '$5,200', status: 'Active' },
    { id: 2, name: 'Partner B', commission: '10%', earnings: '$3,800', status: 'Active' },
    { id: 3, name: 'Partner C', commission: '20%', earnings: '$7,100', status: 'Pending' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Affiliates Program</h2>
            <p>Manage affiliate partnerships</p>
          </div>
          <button className="btn btn-primary">+ Add Affiliate</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          <div className="sa-stat-card">
            <h3>Total Affiliates</h3>
            <div className="sa-stat-value">45</div>
          </div>
          <div className="sa-stat-card">
            <h3>Total Payouts</h3>
            <div className="sa-stat-value">$84,200</div>
          </div>
          <div className="sa-stat-card">
            <h3>Conversion Rate</h3>
            <div className="sa-stat-value">23%</div>
          </div>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Affiliate Name</th>
                <th>Commission Rate</th>
                <th>Total Earnings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map(affiliate => (
                <tr key={affiliate.id}>
                  <td>{affiliate.name}</td>
                  <td>{affiliate.commission}</td>
                  <td>{affiliate.earnings}</td>
                  <td>
                    <span className={`sa-status-badge ${affiliate.status.toLowerCase()}`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td>
                    <button className="sa-action-btn view">Reports</button>
                    <button className="sa-action-btn edit">Settings</button>
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

export default Affiliates;