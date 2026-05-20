import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Candidates.css";
import { FaSearch, FaFilter, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [actionLoading, setActionLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch candidates and levels data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidates
      const candidatesResponse = await fetch(`${BASE_URL}/api/candidate/candidates/`);
      if (!candidatesResponse.ok) {
        throw new Error(`HTTP error! status: ${candidatesResponse.status}`);
      }
      const candidatesResult = await candidatesResponse.json();
      console.log('Candidates API Response:', candidatesResult);
      
      // Fetch levels for reference
      const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
      const levelsResult = levelsResponse.ok ? await levelsResponse.json() : { data: [] };
      
      if (candidatesResult.status && candidatesResult.data) {
        setCandidates(candidatesResult.data);
        console.log('Candidates set:', candidatesResult.data);
      } else {
        throw new Error(candidatesResult.message || 'Failed to fetch candidates');
      }
      
      // Set levels for reference
      if (levelsResult.data) {
        setLevels(levelsResult.data);
        console.log('Levels set:', levelsResult.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Candidates',
        text: err.message || 'An error occurred while fetching candidates',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle approve candidate (sets status to "active")
  const handleApprove = async (candidateId, candidateName) => {
    Swal.fire({
      title: 'Approve Candidate?',
      text: `Are you sure you want to approve "${candidateName}"?`,
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
          const response = await fetch(`${BASE_URL}/api/candidate/candidates/${candidateId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              candidate_status: 'active'  // Changed from 'approved' to 'active'
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
          }

          await fetchAllData();
          
          Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: `${candidateName} has been approved successfully.`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Approve error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message || 'Failed to approve candidate. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Handle reject candidate (sets status to "inactive")
  const handleReject = async (candidateId, candidateName) => {
    Swal.fire({
      title: 'Reject Candidate?',
      text: `Are you sure you want to reject "${candidateName}"?`,
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
          const response = await fetch(`${BASE_URL}/api/candidate/candidates/${candidateId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              candidate_status: 'inactive',  // Changed from 'rejected' to 'inactive'
              rejection_reason: result.value
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
          }

          await fetchAllData();
          
          Swal.fire({
            icon: 'success',
            title: 'Rejected!',
            text: `${candidateName} has been rejected.`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Reject error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message || 'Failed to reject candidate. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleAddCandidate = () => {
    navigate('/add-candidate');
  };

  const handleEdit = (candidateId) => {
    navigate(`/add-candidate/${candidateId}`);
  };

  const handleDelete = async (candidateId, candidateName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/candidates/${candidateId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the candidates list
      await fetchAllData();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${candidateName} has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error deleting candidate:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete candidate. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const confirmDelete = (candidate) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${candidate.full_name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(candidate.id, candidate.full_name);
      }
    });
  };

  // Get level name by ID - using 'id' field
  const getLevelName = (levelId) => {
    if (!levelId) return 'No Level';
    const level = levels.find(l => l.id === parseInt(levelId));
    return level ? `${level.name} (Level ${level.number})` : 'Unknown Level';
  };

  // Get candidate status display - Map API status to display text
  const getStatusInfo = (candidateStatus) => {
    switch(candidateStatus) {
      case "active":
        return { text: "Active", class: "status-active" };
      case "inactive":
        return { text: "Inactive", class: "status-inactive" };
      case "pending":
        return { text: "Pending", class: "status-pending" };
      default:
        return { text: candidateStatus || "Pending", class: "status-pending" };
    }
  };

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === "" || 
      (candidate.full_name && candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.phone_number && candidate.phone_number.includes(searchTerm)) ||
      (candidate.city && candidate.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For level filter, compare with level ID as integer
    const matchesLevel = levelFilter === "All Levels" || 
      (candidate.current_level && parseInt(candidate.current_level) === parseInt(levelFilter));
    
    const matchesStatus = statusFilter === "All Status" || 
      candidate.candidate_status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Get unique levels for filter dropdown - using level IDs
  const uniqueLevels = [...new Set(candidates
    .map(c => c.current_level)
    .filter(Boolean)
  )].map(levelId => {
    const level = levels.find(l => l.id === parseInt(levelId));
    return {
      id: levelId,
      name: level ? `${level.name} (Level ${level.number})` : `Level ${levelId}`
    };
  });

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="candidates-wrapper">
            {/* Page Header */}
            <div className="candidates-header">
              <div>
                <h2>Candidate Management</h2>
                <p>View and manage all training candidates ({candidates.length} total)</p>
              </div>
              <button onClick={handleAddCandidate} className="btn btn-primary candidates-add-btn">
                Add Candidate
              </button>
            </div>

            {/* Filters */}
            <div className="candidates-filters-box">
              <div className="candidates-filters">
                <div className="candidates-search">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select 
                  className="candidates-select"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="All Levels">All Levels</option>
                  {uniqueLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>

                <select 
                  className="candidates-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>

                <button className="candidates-filter-btn" onClick={fetchAllData}>
                  <FaFilter />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="candidates-loading text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading candidates...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="candidates-error alert alert-danger">
                <p>Error: {error}</p>
                <button onClick={fetchAllData} className="btn btn-primary mt-2">
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="candidates-table-wrapper">
                <table className="table candidates-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Blood Group</th>
                      <th>Medical Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((candidate) => (
                        <CandidateRow 
                          key={candidate.id}
                          candidate={candidate}
                          levelName={getLevelName(candidate.current_level)}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          actionLoading={actionLoading}
                          getStatusInfo={getStatusInfo}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No candidates found
                          {searchTerm && (
                            <div>
                              <button 
                                className="btn btn-link mt-2"
                                onClick={() => setSearchTerm('')}
                              >
                                Clear Search
                              </button>
                            </div>
                          )}
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
const CandidateRow = ({ candidate, levelName, onEdit, onDelete, onApprove, onReject, actionLoading, getStatusInfo }) => {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Check if medical is expired
  const isMedicalExpired = () => {
    if (!candidate.medical_expiry_date) return false;
    const expiryDate = new Date(candidate.medical_expiry_date);
    const today = new Date();
    return expiryDate < today;
  };

  const medicalExpired = isMedicalExpired();
  const statusInfo = getStatusInfo(candidate.candidate_status);

  return (
    <tr>
      <td className="candidates-name">
        {candidate.full_name || 'N/A'}
      </td>
      <td>{candidate.email || 'N/A'}</td>
      <td>{candidate.phone_number || 'N/A'}</td>
      <td>{candidate.city || 'N/A'}</td>
      <td>{candidate.blood_group || 'N/A'}</td>
      <td>
        <span className={medicalExpired ? 'text-danger fw-bold' : ''}>
          {formatDate(candidate.medical_expiry_date)}
          {medicalExpired && ' (Expired)'}
        </span>
      </td>
      <td>
        <span className={`candidates-pill ${statusInfo.class}`}>
          {statusInfo.text}
        </span>
      </td>
      <td>
        <div className="action-icons">
          <FaEdit 
            className="candidates-action-icon edit-icon" 
            onClick={() => onEdit(candidate.id)}
            title="Edit Candidate"
            style={{ cursor: 'pointer', marginRight: '10px', color: '#4a6cf7' }}
          />
          <FaTrash 
            className="candidates-action-icon delete-icon" 
            onClick={() => onDelete(candidate)}
            title="Delete Candidate"
            style={{ cursor: 'pointer', color: '#dc3545' }}
          />
          {candidate.candidate_status === "pending" && (
            <>
              <FaCheck 
                className="candidates-action-icon approve-icon" 
                onClick={() => onApprove(candidate.id, candidate.full_name)}
                disabled={actionLoading}
                title="Approve Candidate"
                style={{ cursor: 'pointer', marginLeft: '10px', color: '#28a745' }}
              />
              <FaTimes 
                className="candidates-action-icon reject-icon" 
                onClick={() => onReject(candidate.id, candidate.full_name)}
                disabled={actionLoading}
                title="Reject Candidate"
                style={{ cursor: 'pointer', marginLeft: '10px', color: '#dc3545' }}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default Candidates;