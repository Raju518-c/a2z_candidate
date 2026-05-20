// AdminAddCompetency.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../Layout/Sidebar';
import AdminHeader from '../Layout/Header';
import "./AddAdminCompetency.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaSpinner } from 'react-icons/fa';

const AdminAddCompetency = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const mode = queryParams.get('mode');
  const competencyId = queryParams.get('competencyId');
  const levelId = queryParams.get('levelId');
  const departmentId = queryParams.get('departmentId');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    competency_name: '',
    candidate: '',
    department: departmentId ? parseInt(departmentId) : '',
    level: levelId ? parseInt(levelId) : '',
    technical_knowledge: 0,
    field_execution: 0,
    documentation_quality: 0,
    ethics_independence: 0,
    communication: 0,
    status: 'validated',
    admin_comments: '',
  });

  // Fetch all required data on component mount
  useEffect(() => {
    fetchCandidates();
    fetchDepartments();
    fetchLevels();
  }, []);

  // Fetch competency data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && competencyId) {
      fetchCompetencyData();
    }
  }, [mode, competencyId]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/candidates/`);
      const result = await response.json();
      if (result.status) {
        setCandidates(result.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      const result = await response.json();
      if (result.status) {
        setDepartments(result.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      const result = await response.json();
      if (result.status) {
        const activeLevels = result.data.filter(level => level.is_active);
        setLevels(activeLevels);
        
        // Set default level only if not in edit mode
        if (mode !== 'edit' && !formData.level) {
          const defaultLevel = activeLevels.find(level => level.number === 0);
          if (defaultLevel) {
            setFormData(prev => ({ ...prev, level: defaultLevel.id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  const fetchCompetencyData = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/competencies/${competencyId}/`);
      const result = await response.json();
      
      if (result.status && result.data) {
        const data = result.data;
        setFormData({
          competency_name: data.competency_name || '',
          candidate: data.candidate || '',
          department: data.department || '',
          level: data.level || '',
          technical_knowledge: data.technical_knowledge || 0,
          field_execution: data.field_execution || 0,
          documentation_quality: data.documentation_quality || 0,
          ethics_independence: data.ethics_independence || 0,
          communication: data.communication || 0,
          status: data.status || 'validated',
          admin_comments: data.admin_comments || '',
        });
      }
    } catch (error) {
      console.error('Error fetching competency data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load competency data for editing.',
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    if (name === 'department' || name === 'level' || name === 'candidate') {
      processedValue = value ? parseInt(value) : '';
    } else if (type === 'number') {
      processedValue = value ? parseInt(value) : 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Update competency_name when department or level changes
    if (name === 'department' || name === 'level' || name === 'candidate') {
      updateCompetencyName(
        name === 'department' ? processedValue : formData.department,
        name === 'level' ? processedValue : formData.level,
        name === 'candidate' ? processedValue : formData.candidate
      );
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const updateCompetencyName = (deptId, levelId, candidateId) => {
    if (!deptId || !levelId) return;
    
    const selectedDept = departments.find(d => d.id === deptId);
    const selectedLevel = levels.find(l => l.id === levelId);
    
    if (selectedDept && selectedLevel) {
      const competencyName = `${selectedLevel.name} - ${selectedDept.name}`;
      setFormData(prev => ({
        ...prev,
        competency_name: competencyName
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.candidate) {
      newErrors.candidate = "Candidate is required";
    }
    if (!formData.department) {
      newErrors.department = "Department is required";
    }
    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Please fill all required fields.',
      });
      return;
    }

    setLoading(true);

    const payload = {
      competency_name: formData.competency_name,
      candidate: parseInt(formData.candidate),
      department: parseInt(formData.department),
      level: parseInt(formData.level),
      technical_knowledge: parseInt(formData.technical_knowledge) || 0,
      field_execution: parseInt(formData.field_execution) || 0,
      documentation_quality: parseInt(formData.documentation_quality) || 0,
      ethics_independence: parseInt(formData.ethics_independence) || 0,
      communication: parseInt(formData.communication) || 0,
      status: mode === 'edit' ? formData.status : 'validated', // For edit mode use selected status, for add mode use 'validated'
      admin_comments: formData.admin_comments,
      mentor_comments: '',
      progression_status: 'none'
    };

    const url = mode === 'edit' 
      ? `${BASE_URL}/api/candidate/competencies/${competencyId}/`
      : `${BASE_URL}/api/candidate/competencies/`;
    
    const method = mode === 'edit' ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} competency`);
      }

      await Swal.fire({
        icon: 'success',
        title: mode === 'edit' ? 'Updated!' : 'Created!',
        text: mode === 'edit' ? 'Competency has been updated successfully.' : 'Competency has been created successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/admin-competency');
    } catch (err) {
      console.error('Error saving competency:', err);
      Swal.fire({
        icon: 'error',
        title: mode === 'edit' ? 'Update Failed' : 'Creation Failed',
        text: err.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-competency');
  };

  const getCandidateDisplay = (candidate) => {
    return `${candidate.full_name} (${candidate.email})`;
  };

  const getDepartmentDisplay = (dept) => {
    return `${dept.name} (${dept.code})`;
  };

  const getLevelDisplay = (level) => {
    return `${level.name} (Level ${level.number})`;
  };

  if (fetchLoading) {
    return (
      <div className="al-layout-wrapper">
        <AdminSidebar />
        <div className="al-main-wrapper">
          <AdminHeader />
          <div className="al-content-area">
            <div className="aac-loading-container">
              <FaSpinner className="aac-spinner-large" />
              <p>Loading competency data...</p>
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
          <div className="aac-form-wrapper">
            {/* Header */}
            <div className="aac-form-header">
              <div>
                <h2 className="aac-form-title">
                  {mode === 'edit' ? 'Edit Competency' : 'Add New Competency'}
                </h2>
                <p className="aac-form-subtitle">
                  {mode === 'edit' ? 'Update competency details' : 'Create a new competency for a candidate'}
                </p>
              </div>
              <button 
                className="aac-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {/* Form */}
            <div className="aac-form-container">
              <form onSubmit={handleSubmit} className="aac-form">
                {/* Candidate Selection */}
                <div className="aac-form-row">
                  <div className="aac-form-group aac-full-width">
                    <label className="aac-form-label">
                      Candidate <span className="aac-required-star">*</span>
                    </label>
                    <select
                      className={`aac-form-select ${errors.candidate ? 'aac-input-error' : ''}`}
                      name="candidate"
                      value={formData.candidate || ''}
                      onChange={handleChange}
                      disabled={loading || mode === 'edit'}
                    >
                      <option value="">Select Candidate</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {getCandidateDisplay(candidate)}
                        </option>
                      ))}
                    </select>
                    {errors.candidate && (
                      <div className="aac-error-message">{errors.candidate}</div>
                    )}
                  </div>
                </div>

                {/* Department and Level */}
                <div className="aac-form-row">
                  <div className="aac-form-group aac-half-width">
                    <label className="aac-form-label">
                      Department <span className="aac-required-star">*</span>
                    </label>
                    <select
                      className={`aac-form-select ${errors.department ? 'aac-input-error' : ''}`}
                      name="department"
                      value={formData.department || ''}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {getDepartmentDisplay(dept)}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <div className="aac-error-message">{errors.department}</div>
                    )}
                  </div>

                  <div className="aac-form-group aac-half-width">
                    <label className="aac-form-label">
                      Level <span className="aac-required-star">*</span>
                    </label>
                    <select
                      className={`aac-form-select ${errors.level ? 'aac-input-error' : ''}`}
                      name="level"
                      value={formData.level || ''}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Level</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {getLevelDisplay(level)}
                        </option>
                      ))}
                    </select>
                    {errors.level && (
                      <div className="aac-error-message">{errors.level}</div>
                    )}
                  </div>
                </div>

                {/* Competency Name (Auto-generated) */}
                <div className="aac-form-row">
                  <div className="aac-form-group aac-full-width">
                    <label className="aac-form-label">Competency Name</label>
                    <input
                      type="text"
                      className="aac-form-input"
                      name="competency_name"
                      value={formData.competency_name || ''}
                      readOnly
                      placeholder="Auto-generated from Department and Level"
                    />
                    <small className="aac-field-hint">
                      Auto-generated based on selected Department and Level
                    </small>
                  </div>
                </div>

                {/* Status Section - Only shown in Edit mode */}
                {mode === 'edit' && (
                  <>
                    <div className="aac-section-divider">
                      <h3 className="aac-section-heading">Status</h3>
                    </div>

                    <div className="aac-form-row">
                      <div className="aac-form-group aac-full-width">
                        <label className="aac-form-label">Competency Status</label>
                        <select
                          className="aac-form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="draft">Draft</option>
                          <option value="in_progress">In Progress</option>
                          <option value="validated">Validated</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Admin Comments Section */}
                <div className="aac-section-divider">
                  <h3 className="aac-section-heading">Admin Comments</h3>
                </div>

                <div className="aac-form-row">
                  <div className="aac-form-group aac-full-width">
                    <label className="aac-form-label">Comments</label>
                    <textarea
                      className="aac-form-textarea"
                      name="admin_comments"
                      rows="4"
                      value={formData.admin_comments}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter admin comments (optional)..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="aac-form-actions">
                  <button 
                    type="button" 
                    className="aac-secondary-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="aac-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="aac-spinner" />
                        {mode === 'edit' ? 'Updating...' : 'Creating...'}
                      </>
                    ) : mode === 'edit' ? 'Update Competency' : 'Add Competency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddCompetency;