import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Mentors.css";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch all data (mentors, levels, departments)
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch mentors
      const mentorsResponse = await fetch(`${BASE_URL}/api/mentor/mentors/`);
      if (!mentorsResponse.ok) {
        throw new Error(`Failed to fetch mentors: ${mentorsResponse.status}`);
      }
      const mentorsResult = await mentorsResponse.json();
      console.log('Mentors API Response:', mentorsResult);
      
      // Fetch levels for reference
      const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
      const levelsResult = levelsResponse.ok ? await levelsResponse.json() : { data: [] };
      
      // Fetch departments for reference
      const deptsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
      const deptsResult = deptsResponse.ok ? await deptsResponse.json() : { data: [] };
      
      if (mentorsResult.status && mentorsResult.data) {
        setMentors(mentorsResult.data);
      } else {
        throw new Error(mentorsResult.message || 'Failed to fetch mentors');
      }
      
      // Set levels and departments for reference
      if (levelsResult.data) {
        setLevels(levelsResult.data);
      }
      
      if (deptsResult.data) {
        setDepartments(deptsResult.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text: err.message || 'An error occurred while fetching data',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMentor = () => {
    navigate('/add-mentor');
  };

  const handleEdit = (mentorId) => {
    navigate(`/add-mentor/${mentorId}`);
  };

  const handleDelete = async (mentorId, mentorName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/mentors/${mentorId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the mentors list
      await fetchAllData();
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${mentorName} has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error deleting mentor:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete mentor. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  // Handle approve mentor
  const handleApprove = async (mentorId, mentorName) => {
    Swal.fire({
      title: 'Approve Mentor?',
      text: `Are you sure you want to approve "${mentorName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        try {
          const response = await fetch(`${BASE_URL}/api/mentor/mentors/${mentorId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              mentorship_status: 'active'
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          await fetchAllData();
          
          Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: `${mentorName} has been approved successfully.`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to approve mentor. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Handle reject mentor
  const handleReject = async (mentorId, mentorName) => {
    Swal.fire({
      title: 'Reject Mentor?',
      text: `Are you sure you want to reject "${mentorName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      input: 'textarea',
      inputPlaceholder: 'Please provide a reason for rejection...',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason for rejection!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        try {
          const response = await fetch(`${BASE_URL}/api/mentor/mentors/${mentorId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              mentorship_status: 'rejected'
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          await fetchAllData();
          
          Swal.fire({
            icon: 'success',
            title: 'Rejected!',
            text: `${mentorName} has been rejected.`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to reject mentor. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Get level name by ID
  const getLevelName = (levelId) => {
    if (!levelId) return 'No Level';
    const level = levels.find(l => l.id === levelId);
    return level ? `${level.name} (Level ${level.number})` : 'Unknown Level';
  };

  // Get department names by IDs
  const getDepartmentNames = (deptIds) => {
    if (!deptIds || !Array.isArray(deptIds) || deptIds.length === 0) return 'No specializations';
    return deptIds.map(id => {
      const dept = departments.find(d => d.id === id);
      return dept ? `${dept.name} (${dept.code})` : null;
    }).filter(Boolean).join(', ') || 'No specializations';
  };

  // Get mentor status display
  const getStatusInfo = (mentorshipStatus) => {
    switch(mentorshipStatus) {
      case "active":
        return { text: "Active", class: "status-active" };
      case "pending":
        return { text: "Pending", class: "status-pending" };
      case "rejected":
        return { text: "Rejected", class: "status-rejected" };
      default:
        return { text: mentorshipStatus || "Pending", class: "status-pending" };
    }
  };

  // Calculate stats from actual data
  const totalMentors = mentors.length;
  const activeMentors = mentors.filter(m => m.mentorship_status === 'active').length;
  const totalTrainees = mentors.reduce((total, mentor) => {
    return total + (mentor.current_trainees || 0);
  }, 0);
  
  // Calculate average approval rate
  const avgApprovalRate = mentors.length > 0 
    ? Math.round(mentors.reduce((sum, mentor) => {
        const rate = mentor.background_verified && mentor.mentorship_certified ? 100 : 50;
        return sum + rate;
      }, 0) / mentors.length)
    : 0;

  // Filter mentors based on search
  const filteredMentors = mentors.filter(mentor => {
    const searchLower = searchTerm.toLowerCase();
    const departmentNames = getDepartmentNames(mentor.specializations).toLowerCase();
    const levelName = getLevelName(mentor.mentor_level).toLowerCase();
    
    return (
      mentor.full_name?.toLowerCase().includes(searchLower) ||
      departmentNames.includes(searchLower) ||
      mentor.current_company?.toLowerCase().includes(searchLower) ||
      mentor.email?.toLowerCase().includes(searchLower) ||
      levelName.includes(searchLower)
    );
  });

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '---';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  };

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="mm-wrapper">
            {/* Page Header */}
            <div className="mm-header">
              <div>
                <h2>Mentor Management</h2>
                <p>Manage mentors and their assigned candidates ({totalMentors} total)</p>
              </div>
              <button onClick={handleAddMentor} className="btn btn-primary mm-add-btn">
                Add Mentor
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading mentors...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="alert alert-danger" role="alert">
                <h5>Error Loading Data</h5>
                <p>{error}</p>
                <button onClick={fetchAllData} className="btn btn-primary mt-2">
                  Retry
                </button>
              </div>
            )}

            {/* Stats - Only show when not loading and no error */}
            {!loading && !error && (
              <>
                <div className="row g-4 mt-1">
                  <StatBox title="Total Mentors" value={totalMentors.toString()} />
                  <StatBox title="Active Mentors" value={activeMentors.toString()} />
                  <StatBox title="Total Trainees" value={totalTrainees.toString()} />
                  <StatBox title="Avg Approval Rate" value={`${avgApprovalRate}%`} />
                </div>

                {/* Search */}
                <div className="mm-search-box mt-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search mentors by name, specialization, company, or level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Mentor Cards */}
                <div className="row g-4 mt-3">
                  {filteredMentors.length > 0 ? (
                    filteredMentors.map((mentor) => (
                      <MentorCard 
                        key={mentor.id}
                        mentor={mentor}
                        initials={getInitials(mentor.full_name)}
                        levelName={getLevelName(mentor.mentor_level)}
                        departmentNames={getDepartmentNames(mentor.specializations)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        actionLoading={actionLoading}
                        getStatusInfo={getStatusInfo}
                      />
                    ))
                  ) : (
                    <div className="col-12 text-center py-5">
                      <p className="text-muted">No mentors found matching your search.</p>
                      {searchTerm && (
                        <button 
                          className="btn btn-outline-secondary mt-2"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------- StatBox Component -------- */
const StatBox = ({ title, value }) => (
  <div className="col-lg-3 col-md-6">
    <div className="mm-stat-card">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

/* -------- MentorCard Component -------- */
const MentorCard = ({ mentor, initials, levelName, departmentNames, onEdit, onDelete, onApprove, onReject, actionLoading, getStatusInfo }) => {
  // Calculate approval rate based on background verification and certification
  const approvalRate = mentor.background_verified && mentor.mentorship_certified ? 100 : 50;
  
  const statusInfo = getStatusInfo(mentor.mentorship_status);
  
  // Calculate pending validations
  const pendingValidations = (mentor.max_trainees || 0) - (mentor.current_trainees || 0);

  return (
    <div className="col-lg-4">
      <div className="mm-mentor-card">
        <div className="mm-card-header">
          <div className="mm-avatar">{initials}</div>
          <div className="mm-mentor-info">
            <h5>{mentor.full_name}</h5>
            <span className="mentor-level-badge" title="Mentor Level">
              {levelName}
            </span>
            <small className="text-muted d-block mt-1">
              {mentor.current_company || 'No company'}
            </small>
          </div>
          <div className="mm-card-actions">
            <FaEdit 
              className="action-icon edit-icon" 
              onClick={() => onEdit(mentor.id)}
              title="Edit Mentor"
              style={{ cursor: 'pointer', marginRight: '10px', color: '#4a6cf7' }}
            />
            <FaTrash 
              className="action-icon delete-icon" 
              onClick={() => onDelete(mentor.id, mentor.full_name)}
              title="Delete Mentor"
              style={{ cursor: 'pointer', color: '#dc3545' }}
            />
          </div>
        </div>

        <div className="mm-card-body">
          <div className="specialization-info mb-2">
            <small className="text-muted">Specializations:</small>
            <p className="specialization-text">{departmentNames}</p>
          </div>

          <div className="row">
            <div className="col-6">
              <div className="mm-metric">
                <span>Current Trainees</span>
                <strong>{mentor.current_trainees || 0}</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="mm-metric">
                <span>Max Capacity</span>
                <strong>{mentor.max_trainees || 0}</strong>
              </div>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-6">
              <div className="mm-metric">
                <span>Experience</span>
                <strong>{parseFloat(mentor.years_of_experience || 0).toFixed(1)} yrs</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="mm-metric">
                <span>Pending</span>
                <strong>{pendingValidations}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Approval Rate</span>
              <strong>{approvalRate}%</strong>
            </div>
            <div className="progress mm-progress">
              <div
                className="progress-bar"
                style={{ width: `${approvalRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mm-card-footer">
          <span className={`mm-status ${statusInfo.class}`}>
            {statusInfo.text}
          </span>
          
          {/* Approval/Rejection Buttons - Only show for pending mentors */}
          {mentor.mentorship_status === "pending" && (
            <div className="mm-approval-buttons">
              <button 
                className="btn btn-sm btn-success me-1"
                onClick={() => onApprove(mentor.id, mentor.full_name)}
                disabled={actionLoading}
                title="Approve Mentor"
              >
                <FaCheck /> Approve
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => onReject(mentor.id, mentor.full_name)}
                disabled={actionLoading}
                title="Reject Mentor"
              >
                <FaTimes /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentors;