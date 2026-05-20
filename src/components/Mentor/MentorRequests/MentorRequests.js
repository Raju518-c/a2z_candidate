import React, { useState, useEffect } from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEye, 
  FaCheck, 
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaUserGraduate,
  FaBuilding,
  FaLevelUpAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";
import "./MentorRequests.css";

const MentorRequestsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Get current mentor from localStorage
  useEffect(() => {
    try {
      const mentorUser = localStorage.getItem('mentor_user');
      if (mentorUser) {
        const parsed = JSON.parse(mentorUser);
        console.log('Mentor user from localStorage:', parsed);
        setMentorInfo(parsed);
      } else {
        console.log('No mentor user found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing mentor_user from localStorage:', error);
    }
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch assignments, candidates, and departments in parallel
        const [assignmentsRes, candidatesRes, departmentsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`),
          fetch(`${BASE_URL}/api/candidate/candidates/`),
          fetch(`${BASE_URL}/api/admin/departments/`)
        ]);

        // Parse responses
        const assignmentsData = await assignmentsRes.json();
        const candidatesData = await candidatesRes.json();
        const departmentsData = await departmentsRes.json();

        console.log('Raw API Responses:');
        console.log('Assignments:', assignmentsData);
        console.log('Candidates:', candidatesData);
        console.log('Departments:', departmentsData);

        // Set data if successful
        if (assignmentsData.status && assignmentsData.data) {
          console.log('All assignments:', assignmentsData.data);
          
          // Filter assignments for current mentor
          let mentorAssignments = assignmentsData.data;
          
          if (mentorInfo) {
            const mentorId = mentorInfo.id || mentorInfo.user_id || mentorInfo.mentor_id;
            console.log('Current mentor ID:', mentorId);
            
            if (mentorId) {
              mentorAssignments = assignmentsData.data.filter(
                assignment => Number(assignment.mentor) === Number(mentorId)
              );
              console.log('Filtered assignments for mentor:', mentorAssignments);
            }
          }
          
          setAssignments(mentorAssignments);
        }

        if (candidatesData.status && candidatesData.data) {
          setCandidates(candidatesData.data);
        }

        if (departmentsData.status && departmentsData.data) {
          setDepartments(departmentsData.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [mentorInfo]);

  // Get candidate details by ID
  const getCandidateDetails = (candidateId) => {
    const candidate = candidates.find(c => Number(c.id) === Number(candidateId));
    return candidate || null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'requested':
        return { 
          bg: '#fff3cd', 
          color: '#856404', 
          icon: <FaClock />, 
          text: 'Pending Review' 
        };
      case 'accepted':
      case 'active':
        return { 
          bg: '#d4edda', 
          color: '#155724', 
          icon: <FaCheckCircle />, 
          text: 'Active' 
        };
      case 'completed':
        return { 
          bg: '#cce5ff', 
          color: '#004085', 
          icon: <FaCheck />, 
          text: 'Completed' 
        };
      case 'rejected':
        return { 
          bg: '#f8d7da', 
          color: '#721c24', 
          icon: <FaTimesCircle />, 
          text: 'Rejected' 
        };
      default:
        return { 
          bg: '#e2e3e5', 
          color: '#383d41', 
          icon: null, 
          text: status || 'Unknown' 
        };
    }
  };

  // Handle request action (accept/reject) - UPDATED with PUT API
  const handleRequestAction = async (assignmentId, action) => {
    const actionText = action === 'accept' ? 'accept' : 'reject';
    const actionDisplayText = action === 'accept' ? 'Accept' : 'Reject';
    
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText} this mentorship request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'accept' ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionDisplayText}`,
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setActionLoading(true);
        try {
          // Prepare the payload
          const payload = {
            action: action // Send 'accept' or 'reject'
          };

          console.log(`Sending ${action} request for assignment ID:`, assignmentId);
          console.log('Payload:', payload);

          // Make the PUT API call
          const response = await fetch(
            `${BASE_URL}/api/mentor/mentorship-assignments/${assignmentId}/status/`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            }
          );

          const responseData = await response.json();
          console.log('API Response:', responseData);

          if (!response.ok) {
            throw new Error(responseData.message || `Failed to ${actionText} request`);
          }

          return responseData;
        } catch (error) {
          console.error('Error in API call:', error);
          Swal.showValidationMessage(error.message || `Failed to ${actionText} the request`);
          throw error;
        } finally {
          setActionLoading(false);
        }
      },
      allowOutsideClick: () => !actionLoading
    });

    if (result.isConfirmed) {
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: `${actionDisplayText}ed!`,
        text: `The mentorship request has been ${actionText}ed successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      // Refresh the data to show updated status
      fetchAssignments();
    }
  };

  // Function to refresh assignments after action
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        let mentorAssignments = data.data;
        
        if (mentorInfo) {
          const mentorId = mentorInfo.id || mentorInfo.user_id || mentorInfo.mentor_id;
          if (mentorId) {
            mentorAssignments = data.data.filter(
              assignment => Number(assignment.mentor) === Number(mentorId)
            );
          }
        }
        
        setAssignments(mentorAssignments);
      }
    } catch (err) {
      console.error('Error refreshing assignments:', err);
    }
  };

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const candidate = getCandidateDetails(assignment.candidate);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (assignment.candidate_name?.toLowerCase().includes(searchLower)) ||
      (candidate?.full_name?.toLowerCase().includes(searchLower)) ||
      (candidate?.email?.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'all' || 
      assignment.mentor_status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDepartment = departmentFilter === 'all' || 
      String(assignment.department) === String(departmentFilter);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate statistics
  const stats = {
    total: assignments.length,
    requested: assignments.filter(a => a.mentor_status === 'requested').length,
    active: assignments.filter(a => a.mentor_status === 'active' || a.mentor_status === 'accepted').length,
    completed: assignments.filter(a => a.mentor_status === 'completed').length,
    rejected: assignments.filter(a => a.mentor_status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="ta-loading-container">
              <FaSpinner className="ta-spinner" />
              <p>Loading mentorship requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />
      
      <div className="ta-main-wrapper">
        <Header />
        
        <div className="ta-content-area">
          <div className="mr-page">

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-semibold mb-1">Candidate Requests</h4>
                <p className="text-muted mb-0">
                  Review and manage mentorship requests from candidates
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-2">
                <div className="mr-stat-card">
                  <div className="d-flex align-items-center">
                    <div className="mr-stat-icon bg-primary bg-opacity-10">
                      <FaUserGraduate className="text-primary" />
                    </div>
                    <div className="ms-3">
                      <h3 className="mb-0">{stats.total}</h3>
                      <p className="mb-0 text-muted">Total Requests</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <div className="mr-stat-card mr-stat-warning">
                  <div className="d-flex align-items-center">
                    <div className="mr-stat-icon bg-warning bg-opacity-10">
                      <FaClock className="text-warning" />
                    </div>
                    <div className="ms-3">
                      <h3 className="mb-0">{stats.requested}</h3>
                      <p className="mb-0 text-muted">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <div className="mr-stat-card mr-stat-success">
                  <div className="d-flex align-items-center">
                    <div className="mr-stat-icon bg-success bg-opacity-10">
                      <FaCheckCircle className="text-success" />
                    </div>
                    <div className="ms-3">
                      <h3 className="mb-0">{stats.active}</h3>
                      <p className="mb-0 text-muted">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <div className="mr-stat-card mr-stat-info">
                  <div className="d-flex align-items-center">
                    <div className="mr-stat-icon bg-info bg-opacity-10">
                      <FaCheck className="text-info" />
                    </div>
                    <div className="ms-3">
                      <h3 className="mb-0">{stats.completed}</h3>
                      <p className="mb-0 text-muted">Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <div className="mr-stat-card mr-stat-danger">
                  <div className="d-flex align-items-center">
                    <div className="mr-stat-icon bg-danger bg-opacity-10">
                      <FaTimesCircle className="text-danger" />
                    </div>
                    <div className="ms-3">
                      <h3 className="mb-0">{stats.rejected}</h3>
                      <p className="mb-0 text-muted">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mr-filters mb-4">
              <div className="row g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by candidate name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="requested">Pending Review</option>
                    <option value="accepted">Active</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="mr-table-card">
              {filteredAssignments.length === 0 ? (
                <div className="mr-empty-state">
                  <p className="text-muted mb-0">No mentorship requests found</p>
                  {assignments.length > 0 && (
                    <small className="text-muted d-block mt-2">
                      Try adjusting your filters or search term
                    </small>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Contact</th>
                        <th>Department</th>
                        <th>Target Level</th>
                        <th>Requested At</th>
                        <th>Status</th>
                        {/* <th>Progress</th> */}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((assignment) => {
                        const candidate = getCandidateDetails(assignment.candidate);
                        const status = getStatusBadge(assignment.mentor_status);
                        
                        return (
                          <tr key={assignment.id}>
                            <td>
                              <div className="mr-candidate-cell">
                                <div className="mr-candidate-avatar">
                                  {candidate?.full_name 
                                    ? candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    : assignment.candidate_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CN'
                                  }
                                </div>
                                <div>
                                  <div className="fw-semibold">
                                    {candidate?.full_name || assignment.candidate_name || 'Unknown'}
                                  </div>
                                  <small className="text-muted">ID: {assignment.candidate}</small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="mr-contact-cell">
                                {candidate ? (
                                  <>
                                    <div className="d-flex align-items-center mb-1">
                                      <FaEnvelope className="text-muted me-2" size={12} />
                                      <span className="small">{candidate.email}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <FaPhone className="text-muted me-2" size={12} />
                                      <span className="small">{candidate.phone_number || 'N/A'}</span>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-muted">No contact info</span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span className="mr-department-tag">
                                <FaBuilding className="me-1" size={10} />
                                {assignment.department_name || 'N/A'}
                              </span>
                            </td>

                            <td>
                              <span className="mr-level-badge">
                                <FaLevelUpAlt className="me-1" size={10} />
                                {assignment.target_level_name || 'N/A'}
                              </span>
                            </td>

                            <td>
                              <div className="mr-date-cell">
                                {formatDate(assignment.requested_at)}
                              </div>
                            </td>

                            <td>
                              <span 
                                className="mr-status-badge"
                                style={{
                                  backgroundColor: status.bg,
                                  color: status.color
                                }}
                              >
                                <span className="me-1">{status.icon}</span>
                                {status.text}
                              </span>
                            </td>

                            {/* <td>
                              <div className="mr-progress-cell">
                                <div className="mr-progress-bar">
                                  <div 
                                    className="mr-progress-fill"
                                    style={{ width: `${assignment.completion_percentage || 0}%` }}
                                  />
                                </div>
                                <span className="mr-progress-text">
                                  {assignment.completion_percentage || 0}%
                                </span>
                              </div>
                            </td> */}

                            <td>
                              <div className="mr-action-buttons">
                                <button 
                                  className="mr-action-btn mr-view-btn"
                                  title="View Details"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Request Details',
                                      html: `
                                        <div style="text-align: left">
                                          <p><strong>Request ID:</strong> ${assignment.id}</p>
                                          <p><strong>Candidate:</strong> ${candidate?.full_name || assignment.candidate_name}</p>
                                          <p><strong>Email:</strong> ${candidate?.email || 'N/A'}</p>
                                          <p><strong>Phone:</strong> ${candidate?.phone_number || 'N/A'}</p>
                                          <p><strong>Department:</strong> ${assignment.department_name}</p>
                                          <p><strong>Target Level:</strong> ${assignment.target_level_name}</p>
                                          <p><strong>Requested:</strong> ${formatDate(assignment.requested_at)}</p>
                                          <p><strong>Status:</strong> ${assignment.mentor_status}</p>
                                          <p><strong>Progress:</strong> ${assignment.completion_percentage || 0}%</p>
                                        </div>
                                      `,
                                      confirmButtonText: 'Close'
                                    });
                                  }}
                                >
                                  <FaEye />
                                </button>
                                
                                {assignment.mentor_status === 'requested' && (
                                  <>
                                    <button 
                                      className="mr-action-btn mr-accept-btn"
                                      title="Accept Request"
                                      onClick={() => handleRequestAction(assignment.id, 'accept')}
                                      disabled={actionLoading}
                                    >
                                      <FaCheck />
                                    </button>
                                    <button 
                                      className="mr-action-btn mr-reject-btn"
                                      title="Reject Request"
                                      onClick={() => handleRequestAction(assignment.id, 'reject')}
                                      disabled={actionLoading}
                                    >
                                      <FaTimes />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorRequestsPage;