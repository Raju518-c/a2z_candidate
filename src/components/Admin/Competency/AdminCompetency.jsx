// AdminCompetency.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Layout/Sidebar";
import AdminHeader from "../Layout/Header";
import {
  FaPlusCircle,
  FaSpinner,
  FaExclamationCircle,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaUser,
  FaBuilding,
  FaLayerGroup
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import Swal from "sweetalert2";
import "./AdminCompetency.css";

const AdminCompetency = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCandidate, setFilterCandidate] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch all required data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidates
      const candidatesResponse = await fetch(`${BASE_URL}/api/candidate/candidates/`);
      const candidatesResult = await candidatesResponse.json();
      if (candidatesResult.status) {
        setCandidates(candidatesResult.data);
      }

      // Fetch levels
      const levelsResponse = await fetch(`${BASE_URL}/api/admin/levels/`);
      const levelsResult = await levelsResponse.json();
      if (levelsResult.status) {
        setLevels(levelsResult.data);
      }

      // Fetch departments
      const departmentsResponse = await fetch(`${BASE_URL}/api/admin/departments/`);
      const departmentsResult = await departmentsResponse.json();
      if (departmentsResult.status) {
        setDepartments(departmentsResult.data);
      }

      // Fetch competencies
      const competenciesResponse = await fetch(`${BASE_URL}/api/candidate/competencies/`);
      const competenciesResult = await competenciesResponse.json();
      if (competenciesResult.status) {
        setCompetencies(competenciesResult.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get names from IDs
  const getCandidateName = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate ? candidate.full_name : 'Unknown';
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown';
  };

  const getLevelName = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : 'Unknown';
  };

  const getLevelNumber = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.number : 0;
  };

  // Status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { icon: FaClock, color: '#f39c12', bg: '#fef3c7', text: '#92400e', label: 'Draft' },
      validated: { icon: FaCheckCircle, color: '#27ae60', bg: '#d1fae5', text: '#065f46', label: 'Validated' },
      in_progress: { icon: FaSpinner, color: '#3498db', bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
      completed: { icon: FaCheckCircle, color: '#27ae60', bg: '#d1fae5', text: '#065f46', label: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className="ac-status-badge" style={{ backgroundColor: config.bg, color: config.text }}>
        <Icon style={{ marginRight: '4px', fontSize: '10px' }} />
        {config.label}
      </span>
    );
  };

  // Progression status badge
  const getProgressionBadge = (status) => {
    const statusConfig = {
      none: { label: 'No Request', color: '#95a5a6', bg: '#ecf0f1' },
      requested: { label: 'Requested', color: '#f39c12', bg: '#fef3c7' },
      progressed: { label: 'Progressed', color: '#27ae60', bg: '#d1fae5' },
      rejected: { label: 'Rejected', color: '#e74c3c', bg: '#fee2e2' }
    };
    
    const config = statusConfig[status] || statusConfig.none;
    
    return (
      <span className="ac-progression-badge" style={{ backgroundColor: config.bg, color: config.color }}>
        {config.label}
      </span>
    );
  };

  // Filter competencies
  const filteredCompetencies = competencies.filter(comp => {
    const matchesSearch = 
      comp.competency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCandidateName(comp.candidate).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(comp.department).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCandidate = !filterCandidate || comp.candidate === parseInt(filterCandidate);
    const matchesDepartment = !filterDepartment || comp.department === parseInt(filterDepartment);
    const matchesLevel = !filterLevel || comp.level === parseInt(filterLevel);
    const matchesStatus = !filterStatus || comp.status === filterStatus;
    
    return matchesSearch && matchesCandidate && matchesDepartment && matchesLevel && matchesStatus;
  });

  // Toggle row expansion
  const toggleRowExpand = (competencyId) => {
    setExpandedRows(prev => ({
      ...prev,
      [competencyId]: !prev[competencyId]
    }));
  };

  // Handle edit competency
  const handleEditCompetency = (competency) => {
    navigate(`/admin-add-competency?mode=edit&competencyId=${competency.id}&levelId=${competency.level}&departmentId=${competency.department}`);
  };

  // Handle delete competency
  const handleDeleteCompetency = async (competency) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete competency "${competency.competency_name}" for ${getCandidateName(competency.candidate)}? This will also delete all associated evidence.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/candidate/competencies/${competency.id}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Competency has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          
          await fetchAllData();
        } else {
          throw new Error('Failed to delete competency');
        }
      } catch (error) {
        console.error('Error deleting competency:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete competency. Please try again.',
        });
      }
    }
  };

  // Handle view details
  const handleViewDetails = (competency) => {
    // Could navigate to a detailed view or open a modal
    console.log('View details for competency:', competency.id);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCandidate("");
    setFilterDepartment("");
    setFilterLevel("");
    setFilterStatus("");
  };

  // Navigate to add competency
  const handleAddCompetency = () => {
    navigate('/admin-add-competency');
  };

  if (loading) {
    return (
      <div className="al-layout-wrapper">
        <AdminSidebar />
        <div className="al-main-wrapper">
          <AdminHeader />
          <div className="al-content-area">
            <div className="ac-loading-container">
              <FaSpinner className="ac-spinner" />
              <p>Loading competencies...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="al-layout-wrapper">
        <AdminSidebar />
        <div className="al-main-wrapper">
          <AdminHeader />
          <div className="al-content-area">
            <div className="ac-error-container">
              <FaExclamationCircle className="ac-error-icon" />
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={fetchAllData} className="ac-retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="al-layout-wrapper">
      <AdminSidebar />

      <div className="al-main-wrapper">
        <AdminHeader />

        <div className="al-content-area">
          <div className="container-fluid ac-wrapper">

            {/* Page Header */}
            <div className="ac-page-header">
              <div>
                <h3 className="ac-page-title">Competency Management</h3>
                <p className="ac-page-subtitle">
                  View and manage all candidate competencies
                </p>
              </div>
              <button 
                className="ac-add-btn"
                onClick={handleAddCompetency}
              >
                <FaPlusCircle className="ac-add-icon" />
                Add Competency
              </button>
            </div>

            {/* Filters Section */}
            <div className="ac-filters-section">
              <div className="ac-search-wrapper">
                <FaSearch className="ac-search-icon" />
                <input
                  type="text"
                  className="ac-search-input"
                  placeholder="Search by competency, candidate, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="ac-filters-row">
                <div className="ac-filter-group">
                  <FaUser className="ac-filter-icon" />
                  <select
                    className="ac-filter-select"
                    value={filterCandidate}
                    onChange={(e) => setFilterCandidate(e.target.value)}
                  >
                    <option value="">All Candidates</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ac-filter-group">
                  <FaBuilding className="ac-filter-icon" />
                  <select
                    className="ac-filter-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ac-filter-group">
                  <FaLayerGroup className="ac-filter-icon" />
                  <select
                    className="ac-filter-select"
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        Level {level.number} - {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ac-filter-group">
                  <FaFilter className="ac-filter-icon" />
                  <select
                    className="ac-filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="validated">Validated</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {(filterCandidate || filterDepartment || filterLevel || filterStatus || searchTerm) && (
                  <button className="ac-reset-filters-btn" onClick={resetFilters}>
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Competencies Table */}
            <div className="ac-table-container">
              <div className="ac-table-wrapper">
                <table className="ac-competency-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Candidate</th>
                      <th>Competency</th>
                      <th>Department</th>
                      <th>Level</th>
                      <th>Overall Score</th>
                      <th>Status</th>
                      {/* <th>Progression</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompetencies.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="ac-no-data">
                          No competencies found
                        </td>
                      </tr>
                    ) : (
                      filteredCompetencies.map((competency) => {
                        const isExpanded = expandedRows[competency.id] || false;
                        const logbookCount = competency.logbook_entries?.length || 0;
                        
                        return (
                          <React.Fragment key={competency.id}>
                            <tr className={`ac-table-row ${isExpanded ? 'expanded' : ''}`}>
                              <td>
                                <button 
                                  className="ac-expand-btn"
                                  onClick={() => toggleRowExpand(competency.id)}
                                >
                                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </button>
                              </td>
                              <td>
                                <div className="ac-candidate-cell">
                                  <span className="ac-candidate-name">
                                    {getCandidateName(competency.candidate)}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="ac-competency-name">
                                  {competency.competency_name}
                                </span>
                              </td>
                              <td>{getDepartmentName(competency.department)}</td>
                              <td>
                                <span className="ac-level-badge">
                                  L{getLevelNumber(competency.level)} - {getLevelName(competency.level)}
                                </span>
                              </td>
                              <td>
                                <div className="ac-score-display">
                                  <span className={`ac-score-value ${competency.overall_score >= 80 ? 'high' : competency.overall_score >= 60 ? 'medium' : 'low'}`}>
                                    {competency.overall_score || 0}
                                  </span>
                                </div>
                              </td>
                              <td>{getStatusBadge(competency.status)}</td>
                              {/* <td>{getProgressionBadge(competency.progression_status)}</td> */}
                              <td>
                                <div className="ac-actions-cell">
                                  <button 
                                    className="ac-action-btn view"
                                    onClick={() => handleViewDetails(competency)}
                                    title="View Details"
                                  >
                                    <FaEye />
                                  </button>
                                  <button 
                                    className="ac-action-btn edit"
                                    onClick={() => handleEditCompetency(competency)}
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="ac-action-btn delete"
                                    onClick={() => handleDeleteCompetency(competency)}
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Row - Competency Details */}
                            {isExpanded && (
                              <tr className="ac-expanded-row">
                                <td colSpan="9">
                                  <div className="ac-expanded-content">
                                    {/* Scores Section */}
                                    <div className="ac-detail-section">
                                      <h4 className="ac-section-title">Competency Scores</h4>
                                      <div className="ac-scores-grid">
                                        <div className="ac-score-item">
                                          <span className="ac-score-label">Technical Knowledge</span>
                                          <span className="ac-score-num">{competency.technical_knowledge || 0}</span>
                                        </div>
                                        <div className="ac-score-item">
                                          <span className="ac-score-label">Field Execution</span>
                                          <span className="ac-score-num">{competency.field_execution || 0}</span>
                                        </div>
                                        <div className="ac-score-item">
                                          <span className="ac-score-label">Documentation Quality</span>
                                          <span className="ac-score-num">{competency.documentation_quality || 0}</span>
                                        </div>
                                        <div className="ac-score-item">
                                          <span className="ac-score-label">Ethics & Independence</span>
                                          <span className="ac-score-num">{competency.ethics_independence || 0}</span>
                                        </div>
                                        <div className="ac-score-item">
                                          <span className="ac-score-label">Communication</span>
                                          <span className="ac-score-num">{competency.communication || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Logbook Entries Section */}
                                    <div className="ac-detail-section">
                                      <h4 className="ac-section-title">
                                        Digital Logbook Entries 
                                        <span className="ac-count-badge">{logbookCount}</span>
                                      </h4>
                                      {logbookCount > 0 ? (
                                        <div className="ac-logbook-list">
                                          {competency.logbook_entries.map((entry, idx) => (
                                            <div key={entry.id} className="ac-logbook-item">
                                              <div className="ac-logbook-header">
                                                <span className="ac-logbook-title">{entry.title || `Entry ${idx + 1}`}</span>
                                                <span className={`ac-logbook-status ${entry.verification_status}`}>
                                                  {entry.verification_status}
                                                </span>
                                              </div>
                                              <div className="ac-logbook-details">
                                                <div className="ac-logbook-row">
                                                  <span className="ac-logbook-label">Duration:</span>
                                                  <span>{entry.total_duration}</span>
                                                </div>
                                                <div className="ac-logbook-row">
                                                  <span className="ac-logbook-label">Period:</span>
                                                  <span>{entry.start_date} to {entry.end_date}</span>
                                                </div>
                                                <div className="ac-logbook-row">
                                                  <span className="ac-logbook-label">Work Location:</span>
                                                  <span>{entry.work_location}</span>
                                                </div>
                                                <div className="ac-logbook-row">
                                                  <span className="ac-logbook-label">Ship:</span>
                                                  <span>{entry.ship_name} ({entry.ship_type})</span>
                                                </div>
                                                <div className="ac-logbook-row">
                                                  <span className="ac-logbook-label">Reviewed By:</span>
                                                  <span>{entry.reviewed_by || 'Not reviewed'}</span>
                                                </div>
                                                {entry.review_comments && (
                                                  <div className="ac-logbook-row">
                                                    <span className="ac-logbook-label">Comments:</span>
                                                    <span className="ac-logbook-comments">{entry.review_comments}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="ac-no-entries">No logbook entries yet</p>
                                      )}
                                    </div>

                                    {/* Comments Section */}
                                    {(competency.mentor_comments || competency.admin_comments) && (
                                      <div className="ac-detail-section">
                                        <h4 className="ac-section-title">Comments</h4>
                                        {competency.mentor_comments && (
                                          <div className="ac-comment-item">
                                            <strong>Mentor Comments:</strong>
                                            <p>{competency.mentor_comments}</p>
                                          </div>
                                        )}
                                        {competency.admin_comments && (
                                          <div className="ac-comment-item">
                                            <strong>Admin Comments:</strong>
                                            <p>{competency.admin_comments}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="ac-meta-info">
                                      <span>Created: {new Date(competency.created_at).toLocaleDateString()}</span>
                                      <span>Last Updated: {new Date(competency.updated_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="ac-table-footer">
                <span className="ac-total-count">
                  Total Competencies: {filteredCompetencies.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompetency;