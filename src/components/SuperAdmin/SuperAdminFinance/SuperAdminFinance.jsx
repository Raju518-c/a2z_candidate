import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const Finance = () => {
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-01-15', description: 'Subscription Revenue', amount: '$5,000', type: 'income' },
    { id: 2, date: '2024-01-20', description: 'Server Costs', amount: '$1,200', type: 'expense' },
    { id: 3, date: '2024-02-01', description: 'Employee Salaries', amount: '$15,000', type: 'expense' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Finance Management</h2>
            <p>Financial overview and transactions</p>
          </div>
          <button className="btn btn-primary">+ Add Transaction</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          <div className="sa-stat-card">
            <h3>Total Revenue</h3>
            <div className="sa-stat-value" style={{ color: '#27ae60' }}>$124,500</div>
            <span className="sa-positive" style={{ fontSize: '12px' }}>↑ 15% from last month</span>
          </div>
          <div className="sa-stat-card">
            <h3>Total Expenses</h3>
            <div className="sa-stat-value" style={{ color: '#e74c3c' }}>$78,200</div>
            <span className="sa-negative" style={{ fontSize: '12px', color: '#e74c3c' }}>↓ 5% from last month</span>
          </div>
          <div className="sa-stat-card">
            <h3>Net Profit</h3>
            <div className="sa-stat-value" style={{ color: '#27ae60' }}>$46,300</div>
            <span className="sa-positive" style={{ fontSize: '12px' }}>↑ 22% from last month</span>
          </div>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.type === 'income' ? 'sa-positive' : 'sa-negative'}>
                    {transaction.amount}
                  </td>
                  <td>
                    <span className={`sa-type-badge ${transaction.type}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>
                    <button className="sa-action-btn view">Details</button>
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

export default Finance;