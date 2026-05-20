import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const HRModule = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Smith', position: 'Software Engineer', department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', position: 'HR Manager', department: 'Human Resources', status: 'Active' },
    { id: 3, name: 'Mike Brown', position: 'Sales Lead', department: 'Sales', status: 'On Leave' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>HR Management</h2>
            <p>Employee management and HR operations</p>
          </div>
          <button className="btn btn-primary">+ Add Employee</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          <div className="sa-stat-card">
            <h3>Total Employees</h3>
            <div className="sa-stat-value">156</div>
          </div>
          <div className="sa-stat-card">
            <h3>Departments</h3>
            <div className="sa-stat-value">8</div>
          </div>
          <div className="sa-stat-card">
            <h3>Open Positions</h3>
            <div className="sa-stat-value">12</div>
          </div>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>
                    <span className={`sa-status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <button className="sa-action-btn view">Profile</button>
                    <button className="sa-action-btn edit">Edit</button>
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

export default HRModule;