// CompetenceForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import "./AddCandidateCompetency.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

const CompetenceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const mode = queryParams.get('mode');
  const competencyId = queryParams.get('competencyId');
  const levelId = queryParams.get('levelId');
  const departmentId = queryParams.get('departmentId');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [errors, setErrors] = useState({});

  // Get candidate user_id from localStorage
  const getCandidateId = () => {
    try {
      const candidateUser = localStorage.getItem('candidate_user');
      if (candidateUser) {
        const parsed = JSON.parse(candidateUser);
        return parsed.user_id || '';
      }
    } catch (error) {
      console.error('Error parsing candidate_user from localStorage:', error);
    }
    return '';
  };

  const [formData, setFormData] = useState({
    competency_name: '',
    candidate: getCandidateId(),
    department: departmentId ? parseInt(departmentId) : '',
    level: levelId ? parseInt(levelId) : ''
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    fetchLevels();
  }, []);

  // Fetch competency data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && competencyId) {
      fetchCompetencyData();
    }
  }, [mode, competencyId]);

  const fetchCompetencyData = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/competencies/${competencyId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch competency data');
      }
      const result = await response.json();
      
      if (result.status && result.data) {
        const data = result.data;
        setFormData({
          competency_name: data.competency_name,
          candidate: data.candidate,
          department: data.department,
          level: data.level
        });
        console.log('✅ Competency data loaded for editing:', data);
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setDepartments(result.data);
        console.log('✅ Departments fetched successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Departments',
        text: err.message || 'An error occurred while loading departments',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        // Filter active levels
        const activeLevels = result.data.filter(level => level.is_active);
        setLevels(activeLevels);
        console.log('✅ Levels fetched successfully:', activeLevels);
        
        // Find and set default level only if not in edit mode and no level pre-selected
        if (mode !== 'edit' && !formData.level) {
          const defaultLevel = activeLevels.find(level => level.number === 0);
          if (defaultLevel) {
            setFormData(prev => ({
              ...prev,
              level: defaultLevel.id
            }));
            console.log('✅ Default level set:', defaultLevel.name, 'with ID:', defaultLevel.id);
          }
        }
      } else {
        throw new Error(result.message || 'Failed to fetch levels');
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Levels',
        text: err.message || 'An error occurred while loading levels',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'department' || name === 'level') {
      processedValue = value ? parseInt(value) : '';
    }
    
    console.log(`Field changed - ${name}:`, processedValue);
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Update competency_name when department or level changes
    if (name === 'department' || name === 'level') {
      const currentDeptId = name === 'department' ? processedValue : formData.department;
      const currentLevelId = name === 'level' ? processedValue : formData.level;
      
      updateCompetencyName(currentDeptId, currentLevelId);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const updateCompetencyName = (deptId, levelId) => {
    if (!deptId || !levelId) return;
    
    const selectedDept = departments.find(d => d.id === deptId);
    const selectedLevel = levels.find(l => l.id === levelId);
    
    if (selectedDept && selectedLevel) {
      const competencyName = `${selectedLevel.name} - ${selectedDept.name}`;
      setFormData(prev => ({
        ...prev,
        competency_name: competencyName
      }));
      console.log('✅ Competency name generated:', competencyName);
    }
  };

  const validateForm = () => {
    console.log('Starting form validation...');
    console.log('Current form data:', formData);
    
    const newErrors = {};

    if (!formData.competency_name?.trim()) {
      newErrors.competency_name = "Competency name is required";
    }

    if (!formData.candidate) {
      newErrors.candidate = "Candidate ID is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    const isValid = Object.keys(newErrors).length === 0;
    console.log('Validation result:', isValid ? 'PASSED' : 'FAILED');
    if (!isValid) {
      console.log('Validation errors:', newErrors);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('='.repeat(50));
    console.log(`COMPETENCE FORM ${mode === 'edit' ? 'UPDATE' : 'CREATION'} STARTED`);
    console.log('='.repeat(50));
    
    if (!validateForm()) {
      console.log('❌ Form validation failed. Submission aborted.');
      
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Please check all required fields and try again.',
        timer: 3000,
        showConfirmButton: true
      });
      return;
    }

    console.log('✅ Form validation passed. Preparing payload...');
    setLoading(true);

    const payload = {
      competency_name: formData.competency_name,
      candidate: parseInt(formData.candidate),
      department: parseInt(formData.department),
      level: parseInt(formData.level)
    };

    console.log('📦 Payload prepared for submission:');
    console.log(JSON.stringify(payload, null, 2));
    
    const url = mode === 'edit' 
      ? `${BASE_URL}/api/candidate/competencies/${competencyId}/`
      : `${BASE_URL}/api/candidate/competencies/`;
    
    const method = mode === 'edit' ? 'PUT' : 'POST';
    
    console.log(`📍 API Endpoint: ${url}`);
    console.log(`📤 Sending ${method} request...`);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log(`📥 Response received - Status: ${response.status} ${response.statusText}`);

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('❌ Server returned error:', responseData);
        
        if (responseData && responseData.errors) {
          const serverErrors = {};
          Object.keys(responseData.errors).forEach(key => {
            serverErrors[key] = Array.isArray(responseData.errors[key]) 
              ? responseData.errors[key][0] 
              : responseData.errors[key];
          });
          setErrors(serverErrors);
          throw new Error('Please check the form for errors');
        }
        
        throw new Error(responseData?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} competence`);
      }

      console.log(`✅ Competence ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      console.log('📋 Server response:', responseData);
      
      await Swal.fire({
        icon: 'success',
        title: mode === 'edit' ? 'Updated!' : 'Created!',
        text: mode === 'edit' ? 'Competence has been updated successfully.' : 'Competence has been created successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log('🔄 Navigating back...');
      navigate('/candidate-competence');
    } catch (err) {
      console.error(`❌ Error ${mode === 'edit' ? 'updating' : 'creating'} competence:`);
      console.error('Error message:', err.message);
      
      Swal.fire({
        icon: 'error',
        title: mode === 'edit' ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} competence. Please try again.`,
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      console.log('🏁 Form submission process completed.');
      console.log('='.repeat(50));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - navigating back');
    navigate('/candidate-competence');
  };

  const getDepartmentDisplay = (dept) => {
    return `${dept.name} (${dept.code})`;
  };

  const getLevelDisplay = (level) => {
    return `${level.name} (Level ${level.number})`;
  };

  const getCurrentDepartmentName = () => {
    if (!formData.department) return '';
    const dept = departments.find(d => d.id === formData.department);
    return dept ? getDepartmentDisplay(dept) : '';
  };

  const getCurrentLevelName = () => {
    if (!formData.level) return '';
    const level = levels.find(l => l.id === formData.level);
    return level ? getLevelDisplay(level) : '';
  };

  if (fetchLoading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="competence-loading-container">
              <FaSpinner className="competence-spinner-large" />
              <p>Loading competency data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      
      <div className="ta-main-wrapper">
        <Header />
        
        <div className="ta-content-area">
          <div className="competence-form-wrapper">
            
            {/* Header with Back Button */}
<div className="competence-form-header">
  <div className="competence-header-left">
    <button 
      className="competence-back-btn"
      onClick={handleCancel}
    >
      <FaArrowLeft /> Back
    </button>
    <div className="competence-header-text">
      <h2 className="competence-form-title">
        {mode === 'edit' ? 'Edit Competence' : 'Add New Competence'}
      </h2>
    </div>
  </div>
</div>

            {/* Form */}
            <div className="competence-form-container">
              <form onSubmit={handleSubmit} className="competence-form">
                {/* Hidden Candidate ID field */}
                <input
                  type="hidden"
                  name="candidate"
                  value={formData.candidate}
                />

                {/* Competency Name Field - Full Width */}
                <div className="competence-form-row">
                  <div className="competence-form-group competence-full-width">
                    <label className="competence-form-label">
                      Competency Name <span className="competence-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`competence-form-input ${errors.competency_name ? 'competence-input-error' : ''}`}
                      name="competency_name"
                      value={formData.competency_name || ''}
                      onChange={handleChange}
                      placeholder="Auto-generated from Department and Level"
                      readOnly
                    />
                    {errors.competency_name && (
                      <div className="competence-error-message">{errors.competency_name}</div>
                    )}
                  </div>
                </div>

                {/* Department and Level Fields - Two Columns */}
                <div className="competence-form-row">
                  <div className="competence-form-group competence-half-width">
                    <label className="competence-form-label">
                      Department <span className="competence-required-star">*</span>
                    </label>
                    <select
                      className={`competence-form-select ${errors.department ? 'competence-input-error' : ''}`}
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
                      <div className="competence-error-message">{errors.department}</div>
                    )}
                    {departments.length === 0 && (
                      <small className="text-warning">No departments available</small>
                    )}
                    {formData.department && (
                      <small className="text-success d-block mt-1">
                        Selected: {getCurrentDepartmentName()}
                      </small>
                    )}
                  </div>

                  <div className="competence-form-group competence-half-width">
                    <label className="competence-form-label">
                      Level <span className="competence-required-star">*</span>
                    </label>
                    <select
                      className={`competence-form-select ${errors.level ? 'competence-input-error' : ''}`}
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
                      <div className="competence-error-message">{errors.level}</div>
                    )}
                    {levels.length === 0 && (
                      <small className="text-warning">No levels available</small>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="competence-form-actions">
                  <button 
                    type="button" 
                    className="competence-secondary-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="competence-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="competence-spinner" />
                        {mode === 'edit' ? 'Updating...' : 'Creating...'}
                      </>
                    ) : mode === 'edit' ? 'Update Competence' : 'Add Competence'}
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

export default CompetenceForm;