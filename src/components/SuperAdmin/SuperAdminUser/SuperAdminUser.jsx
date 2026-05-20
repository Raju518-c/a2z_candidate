import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Inactive' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>User Management</h2>
            <p>Total Users: {users.length}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add User
          </button>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`sa-status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="sa-action-btn edit">Edit</button>
                    <button className="sa-action-btn delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="sa-modal">
            <div className="sa-modal-content">
              <h2>Add New User</h2>
              <form>
                <input type="text" placeholder="Full Name" />
                <input type="email" placeholder="Email" />
                <select>
                  <option>Select Role</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>User</option>
                </select>
                <div className="sa-modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default UserManagement;