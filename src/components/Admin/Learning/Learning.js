import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Learning.css";
import { FaSearch, FaFilter, FaEdit, FaTrash, FaBook, FaClock, FaCheckCircle, FaHourglassHalf, FaBuilding, FaLayerGroup } from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const Learning = () => {
  const [learnings, setLearnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const navigate = useNavigate();

  // Fetch learning data
  useEffect(() => {
    fetchLearnings();
  }, []);

  const fetchLearnings = async () => {
    try {
      setLoading(true);
      // Use the correct endpoint from your API
      const response = await fetch(`${BASE_URL}/api/candidate/learning-modules/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status && result.data) {
        setLearnings(result.data);
        console.log('Learnings set:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch learning modules');
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching learning modules:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Learning Modules',
        text: err.message || 'An error occurred while fetching learning modules',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLearning = () => {
    navigate('/add-learning');
  };

  const handleEdit = (moduleId) => {
    navigate(`/add-learning/${moduleId}`);
  };

  const handleDelete = async (moduleId, moduleTitle) => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/learning-modules/${moduleId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the learning list
      await fetchLearnings();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${moduleTitle} has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error deleting learning module:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete learning module. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const confirmDelete = (module) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${module.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(module.id, module.title);
      }
    });
  };

  // Helper function to get module type display name
  const getModuleTypeDisplay = (type) => {
    const types = {
      'orientation': 'Orientation',
      'safety': 'Safety',
      'technical': 'Technical',
      'standard': 'Standards & Codes',
      'casestudy': 'Case Study',
      'assessment': 'Assessment'
    };
    return types[type] || type || 'N/A';
  };

  // Filter learning modules based on search and filters
  const filteredLearnings = learnings.filter(module => {
    const matchesSearch = searchTerm === "" || 
      (module.title && module.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (module.module_type && module.module_type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "All Types" || 
      (module.module_type && module.module_type === typeFilter);
    
    const matchesStatus = statusFilter === "All Status" || 
      (statusFilter === "Active" && module.is_active === true) ||
      (statusFilter === "Inactive" && module.is_active === false);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique module types for filter dropdown
  const uniqueTypes = [...new Set(learnings.map(m => m.module_type).filter(Boolean))];

  // Status badge component
  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className="learning-pill active">Active</span> : 
      <span className="learning-pill inactive">Inactive</span>;
  };

  // Mandatory badge component
  const getMandatoryBadge = (isMandatory) => {
    return isMandatory ? 
      <span className="learning-pill mandatory">Mandatory</span> : 
      <span className="learning-pill optional">Optional</span>;
  };

  // Assessment badge component
  const getAssessmentBadge = (hasAssessment) => {
    return hasAssessment ? 
      <span className="learning-pill has-assessment">Has Assessment</span> : 
      <span className="learning-pill no-assessment">No Assessment</span>;
  };

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="learning-wrapper">
            {/* Page Header */}
            <div className="learning-header">
              <div>
                <h2><FaBook className="me-2" /> Learning Modules Management</h2>
                <p>View and manage all learning modules ({learnings.length} total)</p>
              </div>
              <button onClick={handleAddLearning} className="btn btn-primary learning-add-btn">
                Add Learning Module
              </button>
            </div>

            {/* Filters */}
            <div className="learning-filters-box">
              <div className="learning-filters">
                <div className="learning-search">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search by title, description, type..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select 
                  className="learning-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {getModuleTypeDisplay(type)}
                    </option>
                  ))}
                </select>

                <select 
                  className="learning-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button className="learning-filter-btn" onClick={fetchLearnings}>
                  <FaFilter />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="learning-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading learning modules...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="learning-error">
                <p>Error: {error}</p>
                <button onClick={fetchLearnings} className="btn btn-secondary">
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="learning-table-wrapper">
                <table className="table learning-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      {/* <th>Department</th> */}
                      {/* <th>Level</th> */}
                      <th>Duration</th>
                      <th>Assessment</th>
                      <th>Mandatory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLearnings.length > 0 ? (
                      filteredLearnings.map((module) => (
                        <LearningRow 
                          key={module.id}
                          module={module}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                          getStatusBadge={getStatusBadge}
                          getMandatoryBadge={getMandatoryBadge}
                          getAssessmentBadge={getAssessmentBadge}
                          getModuleTypeDisplay={getModuleTypeDisplay}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No learning modules found
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
const LearningRow = ({ module, onEdit, onDelete, getStatusBadge, getMandatoryBadge, getAssessmentBadge, getModuleTypeDisplay }) => {
  // Format duration
  const formatDuration = (hours) => {
    if (!hours || hours === '0.0') return 'N/A';
    return `${hours} ${parseFloat(hours) === 1 ? 'hour' : 'hours'}`;
  };

  // Truncate description for tooltip
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <tr>
      <td className="learning-name">
        <div className="learning-info">
          <FaBook className="learning-icon" />
          <div>
            <strong title={module.title}>{module.title || 'N/A'}</strong>
            {module.description && (
              <small className="d-block text-muted" title={module.description}>
                {truncateText(module.description)}
              </small>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className="learning-category">
          {getModuleTypeDisplay(module.module_type)}
        </span>
      </td>
      {/* <td>
        <div className="d-flex align-items-center">
          <FaBuilding className="me-1 text-secondary" size={12} />
          <span title={module.target_department}>
            {module.target_department ? module.target_department.substring(0, 8) + '...' : 'N/A'}
          </span>
        </div>
      </td> */}
      {/* <td>
        <div className="d-flex align-items-center">
          <FaLayerGroup className="me-1 text-secondary" size={12} />
          <span title={module.target_level}>
            {module.target_level ? module.target_level.substring(0, 8) + '...' : 'N/A'}
          </span>
        </div>
      </td> */}
      <td>
        <span className="learning-duration">
          <FaClock className="me-1" />
          {formatDuration(module.duration_hours)}
        </span>
      </td>
      <td>
        {getAssessmentBadge(module.has_assessment)}
        {module.has_assessment && module.passing_score && (
          <small className="d-block text-muted mt-1">
            Pass: {module.passing_score}%
          </small>
        )}
      </td>
      <td>{getMandatoryBadge(module.is_mandatory)}</td>
      <td>{getStatusBadge(module.is_active)}</td>
      <td>
        <div className="learning-action-icons">
          <FaEdit 
            className="learning-action-icon edit-icon" 
            onClick={() => onEdit(module.id)}
            title="Edit Module"
          />
          <FaTrash 
            className="learning-action-icon delete-icon" 
            onClick={() => onDelete(module)}
            title="Delete Module"
          />
        </div>
      </td>
    </tr>
  );
};

export default Learning;