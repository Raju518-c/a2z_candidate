import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const LMS = () => {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Leadership Training', enrolled: 156, completion: '78%', status: 'Active' },
    { id: 2, title: 'Technical Skills', enrolled: 234, completion: '65%', status: 'Active' },
    { id: 3, title: 'Compliance Training', enrolled: 189, completion: '92%', status: 'Active' },
  ]);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>Learning Management System</h2>
            <p>Course Management</p>
          </div>
          <button className="btn btn-primary">+ Create Course</button>
        </div>

        <div className="sa-stats-grid" style={{ marginTop: '20px' }}>
          <div className="sa-stat-card">
            <h3>Total Courses</h3>
            <div className="sa-stat-value">24</div>
          </div>
          <div className="sa-stat-card">
            <h3>Active Students</h3>
            <div className="sa-stat-value">1,245</div>
          </div>
          <div className="sa-stat-card">
            <h3>Completion Rate</h3>
            <div className="sa-stat-value">78%</div>
          </div>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Enrolled</th>
                <th>Completion Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.enrolled}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: course.completion, height: '100%', background: '#3b82f6' }}></div>
                      </div>
                      {course.completion}
                    </div>
                  </td>
                  <td>
                    <span className={`sa-status-badge ${course.status.toLowerCase()}`}>
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <button className="sa-action-btn view">Manage</button>
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

export default LMS;