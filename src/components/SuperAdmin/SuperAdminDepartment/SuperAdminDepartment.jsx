import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const DepartmentStructure = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', head: 'Alice Johnson', employees: 45, budget: '$2.5M' },
    { id: 2, name: 'Sales', head: 'Bob Williams', employees: 28, budget: '$1.8M' },
    { id: 3, name: 'Marketing', head: 'Carol Davis', employees: 15, budget: '$1.2M' },
    { id: 4, name: 'HR', head: 'David Brown', employees: 12, budget: '$0.8M' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Department Structure</h2>
            <p>Total Departments: {departments.length}</p>
          </div>
          <button className="btn btn-primary">+ Add Department</button>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          {departments.map(dept => (
            <div key={dept.id} style={{ 
              padding: '20px', 
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{dept.name}</div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                  <span>Head: {dept.head}</span>
                  <span>Employees: {dept.employees}</span>
                  <span>Budget: {dept.budget}</span>
                </div>
              </div>
              <div>
                <button className="sa-action-btn view">View Structure</button>
                <button className="sa-action-btn edit">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default DepartmentStructure;