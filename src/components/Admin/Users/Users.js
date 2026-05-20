import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Users.css";
import { FaSearch, FaFilter, FaEdit, FaTrash, FaUserPlus, FaUserShield } from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const navigate = useNavigate();

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/admin-users/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status && result.data) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Users',
        text: err.message || 'An error occurred while fetching users',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    navigate('/add-admin-users');
  };

  const handleEdit = (userId) => {
    navigate(`/add-admin-users/${userId}`);
  };

  const handleDelete = async (userId, username) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/admin-users/${userId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the users list
      await fetchUsers();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${username} has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error deleting user:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete user. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const confirmDelete = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${user.username}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(user.id, user.username); // Changed from user.admin_id to user.id
      }
    });
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone_number && user.phone_number.includes(searchTerm));
    
    return matchesSearch;
  });

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="users-wrapper">
            {/* Page Header */}
            <div className="users-header">
              <div>
                <h2>Admin User Management</h2>
                <p>View and manage all admin users ({users.length} total)</p>
              </div>
              <button onClick={handleAddUser} className="btn btn-primary users-add-btn">
                <FaUserPlus style={{ marginRight: '8px' }} /> Add Admin User
              </button>
            </div>

            {/* Filters */}
            <div className="users-filters-box">
              <div className="users-filters">
                <div className="users-search">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search users by username, email, or phone number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <button className="users-filter-btn" onClick={fetchUsers} title="Refresh">
                  <FaFilter />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="users-loading">
                <p>Loading users...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="users-error">
                <p>Error: {error}</p>
                <button onClick={fetchUsers} className="btn btn-secondary">
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="users-table-wrapper">
                <table className="table users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Created At</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <UserRow 
                          key={user.id} // Changed from user.admin_id to user.id
                          user={user}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Row Component ---- */
const UserRow = ({ user, onEdit, onDelete }) => {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <tr>
      <td className="users-username">
        <div className="users-username-wrapper">
          <FaUserShield className="users-username-icon" />
          {user.username || 'N/A'}
        </div>
      </td>
      <td>{user.email || 'N/A'}</td>
      <td>{user.phone_number || 'N/A'}</td>
      <td>
        <span className="users-date">
          {formatDate(user.created_at)}
        </span>
      </td>
      <td>
        <span className="users-date">
          {formatDate(user.updated_at)}
        </span>
      </td>
      <td>
        <div className="action-icons">
          <FaEdit 
            className="users-action-icon edit-icon" 
            onClick={() => onEdit(user.id)} // Changed from user.admin_id to user.id
            title="Edit User"
            style={{ cursor: 'pointer', marginRight: '10px' }}
          />
          <FaTrash 
            className="users-action-icon delete-icon" 
            onClick={() => onDelete(user)}
            title="Delete User"
            style={{ cursor: 'pointer', color: '#dc3545' }}
          />
        </div>
      </td>
    </tr>
  );
};

export default Users;