import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./AddDepartmentLevel.css";
import { BASE_URL } from '../../../ApiUrl';

const AddDepartmentLevel = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get id from URL params for edit mode
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    duration_weeks: 12,
    prerequisites: '',
    learning_objectives: '',
    min_technical_knowledge: 0,
    min_field_execution: 0,
    min_documentation_quality: 0,
    min_ethics_independence: 0,
    min_communication: 0,
    min_overall_score: 0,
    required_competencies: '',
    strict_validation: false,
    grace_period_weeks: 4,
    department: 0,
    level: 0
  });

  // State for dynamic arrays
  const [mandatoryRequirements, setMandatoryRequirements] = useState([]);
  const [promotionRules, setPromotionRules] = useState([]);
  const [authorityLimits, setAuthorityLimits] = useState([]);

  // Check if we're in edit mode based on URL params
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchDepartmentLevelById(id);
    }
  }, [id]);

  // Fetch departments and levels on component mount
  useEffect(() => {
    fetchDepartments();
    fetchLevels();
  }, []);

  const fetchDepartmentLevelById = async (levelId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/department-levels/${levelId}/`);
      const data = await response.json();
      
      if (response.ok && data.status && data.data) {
        const levelData = data.data;
        setFormData({
          duration_weeks: levelData.duration_weeks,
          prerequisites: levelData.prerequisites || '',
          learning_objectives: levelData.learning_objectives || '',
          min_technical_knowledge: levelData.min_technical_knowledge,
          min_field_execution: levelData.min_field_execution,
          min_documentation_quality: levelData.min_documentation_quality,
          min_ethics_independence: levelData.min_ethics_independence,
          min_communication: levelData.min_communication,
          min_overall_score: levelData.min_overall_score,
          required_competencies: levelData.required_competencies || '',
          strict_validation: levelData.strict_validation,
          grace_period_weeks: levelData.grace_period_weeks,
          department: levelData.department,
          level: levelData.level
        });
        
        // Set dynamic arrays if they exist in the data
        setMandatoryRequirements(levelData.mandatory_requirements || []);
        setPromotionRules(levelData.promotion_rules || []);
        setAuthorityLimits(levelData.authority_limits || []);
      } else {
        setError('Failed to fetch department level details');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch department level details',
          confirmButtonColor: '#007bff'
        }).then(() => {
          navigate('/department-level');
        });
      }
    } catch (error) {
      console.error('Error fetching department level:', error);
      setError('Error connecting to server');
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Error connecting to server',
        confirmButtonColor: '#007bff'
      }).then(() => {
        navigate('/department-level');
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/departments/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setDepartments(data.data);
      } else {
        setError('Failed to fetch departments');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch departments',
          confirmButtonColor: '#007bff'
        });
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Error connecting to server');
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Error connecting to server',
        confirmButtonColor: '#007bff'
      });
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/levels/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setLevels(data.data);
      } else {
        setError('Failed to fetch levels');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch levels',
          confirmButtonColor: '#007bff'
        });
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      setError('Error connecting to server');
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Error connecting to server',
        confirmButtonColor: '#007bff'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) || 0 : 
              value
    }));
  };

  // Handlers for Mandatory Requirements
  const addMandatoryRequirement = () => {
    setMandatoryRequirements([...mandatoryRequirements, {
      type: 'training',
      name: '',
      description: '',
      mandatory: true,
      expiry_required: false,
      minimum_duration: 0
    }]);
  };

  const removeMandatoryRequirement = (index) => {
    const updated = mandatoryRequirements.filter((_, i) => i !== index);
    setMandatoryRequirements(updated);
  };

  const updateMandatoryRequirement = (index, field, value) => {
    const updated = [...mandatoryRequirements];
    updated[index][field] = field === 'mandatory' || field === 'expiry_required' ? value : value;
    setMandatoryRequirements(updated);
  };

  // Handlers for Promotion Rules
  const addPromotionRule = () => {
    setPromotionRules([...promotionRules, {
      rule_type: 'score',
      name: '',
      description: '',
      condition: '',
      weight: 1.0,
      mandatory: true
    }]);
  };

  const removePromotionRule = (index) => {
    const updated = promotionRules.filter((_, i) => i !== index);
    setPromotionRules(updated);
  };

  const updatePromotionRule = (index, field, value) => {
    const updated = [...promotionRules];
    updated[index][field] = field === 'mandatory' ? value : value;
    setPromotionRules(updated);
  };

  // Handlers for Authority Limits
  const addAuthorityLimit = () => {
    setAuthorityLimits([...authorityLimits, {
      authority_type: 'approval',
      area: '',
      limit: '',
      description: '',
      requires_escalation: false,
      escalation_threshold: ''
    }]);
  };

  const removeAuthorityLimit = (index) => {
    const updated = authorityLimits.filter((_, i) => i !== index);
    setAuthorityLimits(updated);
  };

  const updateAuthorityLimit = (index, field, value) => {
    const updated = [...authorityLimits];
    updated[index][field] = field === 'requires_escalation' ? value : value;
    setAuthorityLimits(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate required fields
    if (!formData.department || !formData.level) {
      setError('Please select both department and level');
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select both department and level',
        confirmButtonColor: '#007bff'
      });
      setSubmitting(false);
      return;
    }

    // Prepare payload according to backend requirements
    const payload = {
      duration_weeks: formData.duration_weeks,
      prerequisites: formData.prerequisites || '',
      learning_objectives: formData.learning_objectives || '',
      min_technical_knowledge: formData.min_technical_knowledge,
      min_field_execution: formData.min_field_execution,
      min_documentation_quality: formData.min_documentation_quality,
      min_ethics_independence: formData.min_ethics_independence,
      min_communication: formData.min_communication,
      min_overall_score: formData.min_overall_score,
      required_competencies: formData.required_competencies || '',
      mandatory_requirements: mandatoryRequirements,
      promotion_rules: promotionRules,
      authority_limits: authorityLimits,
      strict_validation: formData.strict_validation,
      grace_period_weeks: formData.grace_period_weeks,
      department: parseInt(formData.department),
      level: parseInt(formData.level)
    };

    try {
      let response;
      let successMessage;
      
      if (isEditMode) {
        // PUT request for update
        response = await fetch(`${BASE_URL}/api/admin/department-levels/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        successMessage = 'Department Level updated successfully!';
      } else {
        // POST request for create
        response = await fetch(`${BASE_URL}/api/admin/department-levels/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        successMessage = 'Department Level added successfully!';
      }

      const data = await response.json();
      
      if (response.ok && data.status) {
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: successMessage,
          confirmButtonColor: '#007bff',
          timer: 2000,
          showConfirmButton: true
        }).then(() => {
          navigate('/department-level');
        });
      } else {
        // Error alert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || (isEditMode ? 'Failed to update department level' : 'Failed to add department level'),
          confirmButtonColor: '#007bff'
        });
        setError(data.message || (isEditMode ? 'Failed to update department level' : 'Failed to add department level'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: 'Error connecting to server. Please try again.',
        confirmButtonColor: '#007bff'
      });
      setError('Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Confirm before cancel
    Swal.fire({
      title: 'Are you sure?',
      text: "Any unsaved changes will be lost!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, leave',
      cancelButtonText: 'Stay'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/department-level');
      }
    });
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="loading-container">Loading...</div>
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
          <div className="add-dept-container">
            
            <div className="add-dept-header">
              <h2>{isEditMode ? 'Edit Department Level Configuration' : 'Add New Department Level Configuration'}</h2>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="add-dept-form">
              
              {/* Department and Level Selection */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level">Level *</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} ({level.code}) - Score Range: {level.min_score_required} - {level.max_score}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration and Grace Period */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration_weeks">Duration (Weeks) *</label>
                  <input
                    type="number"
                    id="duration_weeks"
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={handleChange}
                    min="1"
                    max="52"
                    required
                    disabled={submitting}
                  />
                  <small>Number of weeks for this level</small>
                </div>

                <div className="form-group">
                  <label htmlFor="grace_period_weeks">Grace Period (Weeks)</label>
                  <input
                    type="number"
                    id="grace_period_weeks"
                    name="grace_period_weeks"
                    value={formData.grace_period_weeks}
                    onChange={handleChange}
                    min="0"
                    max="52"
                    disabled={submitting}
                  />
                  <small>Additional weeks allowed for completion</small>
                </div>
              </div>

              {/* Minimum Score Requirements */}
              <div className="form-section">
                <h3>Minimum Score Requirements</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="min_technical_knowledge">Technical Knowledge (0-100)</label>
                    <input
                      type="number"
                      id="min_technical_knowledge"
                      name="min_technical_knowledge"
                      value={formData.min_technical_knowledge}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="min_field_execution">Field Execution (0-100)</label>
                    <input
                      type="number"
                      id="min_field_execution"
                      name="min_field_execution"
                      value={formData.min_field_execution}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="min_documentation_quality">Documentation Quality (0-100)</label>
                    <input
                      type="number"
                      id="min_documentation_quality"
                      name="min_documentation_quality"
                      value={formData.min_documentation_quality}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="min_ethics_independence">Ethics & Independence (0-100)</label>
                    <input
                      type="number"
                      id="min_ethics_independence"
                      name="min_ethics_independence"
                      value={formData.min_ethics_independence}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="min_communication">Communication (0-100)</label>
                    <input
                      type="number"
                      id="min_communication"
                      name="min_communication"
                      value={formData.min_communication}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="min_overall_score">Overall Score (0-100)</label>
                    <input
                      type="number"
                      id="min_overall_score"
                      name="min_overall_score"
                      value={formData.min_overall_score}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="form-group">
                <label htmlFor="prerequisites">Prerequisites</label>
                <textarea
                  id="prerequisites"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  placeholder="List any prerequisites required for this level"
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="learning_objectives">Learning Objectives</label>
                <textarea
                  id="learning_objectives"
                  name="learning_objectives"
                  value={formData.learning_objectives}
                  onChange={handleChange}
                  placeholder="Describe the learning objectives for this level"
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="required_competencies">Required Competencies</label>
                <textarea
                  id="required_competencies"
                  name="required_competencies"
                  value={formData.required_competencies}
                  onChange={handleChange}
                  placeholder="List the required competencies for this level"
                  rows="3"
                  disabled={submitting}
                />
              </div>

              {/* Mandatory Requirements Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Mandatory Requirements</h3>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={addMandatoryRequirement}
                    disabled={submitting}
                  >
                    + Add Requirement
                  </button>
                </div>
                
                {mandatoryRequirements.map((req, index) => (
                  <div key={index} className="dynamic-item-card">
                    <div className="dynamic-item-header">
                      <span>Requirement #{index + 1}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={() => removeMandatoryRequirement(index)}
                        disabled={submitting}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={req.type}
                          onChange={(e) => updateMandatoryRequirement(index, 'type', e.target.value)}
                          disabled={submitting}
                        >
                          <option value="certification">Certification</option>
                          <option value="training">Training</option>
                          <option value="experience">Experience</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={req.name}
                          onChange={(e) => updateMandatoryRequirement(index, 'name', e.target.value)}
                          placeholder="Requirement name"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={req.description}
                        onChange={(e) => updateMandatoryRequirement(index, 'description', e.target.value)}
                        placeholder="Describe the requirement"
                        rows="2"
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Minimum Duration (weeks)</label>
                        <input
                          type="number"
                          value={req.minimum_duration}
                          onChange={(e) => updateMandatoryRequirement(index, 'minimum_duration', parseInt(e.target.value) || 0)}
                          min="0"
                          disabled={submitting}
                        />
                      </div>
                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={req.mandatory}
                            onChange={(e) => updateMandatoryRequirement(index, 'mandatory', e.target.checked)}
                            disabled={submitting}
                          />
                          Mandatory
                        </label>
                      </div>
                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={req.expiry_required}
                            onChange={(e) => updateMandatoryRequirement(index, 'expiry_required', e.target.checked)}
                            disabled={submitting}
                          />
                          Expiry Required
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promotion Rules Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Promotion Rules</h3>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={addPromotionRule}
                    disabled={submitting}
                  >
                    + Add Rule
                  </button>
                </div>
                
                {promotionRules.map((rule, index) => (
                  <div key={index} className="dynamic-item-card">
                    <div className="dynamic-item-header">
                      <span>Rule #{index + 1}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={() => removePromotionRule(index)}
                        disabled={submitting}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Rule Type</label>
                        <select
                          value={rule.rule_type}
                          onChange={(e) => updatePromotionRule(index, 'rule_type', e.target.value)}
                          disabled={submitting}
                        >
                          <option value="score">Score</option>
                          <option value="experience">Experience</option>
                          <option value="completion">Completion</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) => updatePromotionRule(index, 'name', e.target.value)}
                          placeholder="Rule name"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={rule.description}
                        onChange={(e) => updatePromotionRule(index, 'description', e.target.value)}
                        placeholder="Describe the rule"
                        rows="2"
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Condition</label>
                        <input
                          type="text"
                          value={rule.condition}
                          onChange={(e) => updatePromotionRule(index, 'condition', e.target.value)}
                          placeholder="e.g., >= 77, >= 6 months"
                          disabled={submitting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Weight (0.0 - 1.0)</label>
                        <input
                          type="number"
                          value={rule.weight}
                          onChange={(e) => updatePromotionRule(index, 'weight', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="1"
                          step="0.1"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={rule.mandatory}
                          onChange={(e) => updatePromotionRule(index, 'mandatory', e.target.checked)}
                          disabled={submitting}
                        />
                        Mandatory
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Authority Limits Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Authority Limits</h3>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={addAuthorityLimit}
                    disabled={submitting}
                  >
                    + Add Limit
                  </button>
                </div>
                
                {authorityLimits.map((limit, index) => (
                  <div key={index} className="dynamic-item-card">
                    <div className="dynamic-item-header">
                      <span>Limit #{index + 1}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={() => removeAuthorityLimit(index)}
                        disabled={submitting}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Authority Type</label>
                        <select
                          value={limit.authority_type}
                          onChange={(e) => updateAuthorityLimit(index, 'authority_type', e.target.value)}
                          disabled={submitting}
                        >
                          <option value="approval">Approval</option>
                          <option value="signing">Signing</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Area</label>
                        <input
                          type="text"
                          value={limit.area}
                          onChange={(e) => updateAuthorityLimit(index, 'area', e.target.value)}
                          placeholder="e.g., documents, reports"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={limit.description}
                        onChange={(e) => updateAuthorityLimit(index, 'description', e.target.value)}
                        placeholder="Describe the authority limit"
                        rows="2"
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Limit</label>
                        <input
                          type="text"
                          value={limit.limit}
                          onChange={(e) => updateAuthorityLimit(index, 'limit', e.target.value)}
                          placeholder="e.g., 5000 INR"
                          disabled={submitting}
                        />
                      </div>
                      <div className="form-group">
                        <label>Escalation Threshold</label>
                        <input
                          type="text"
                          value={limit.escalation_threshold}
                          onChange={(e) => updateAuthorityLimit(index, 'escalation_threshold', e.target.value)}
                          placeholder="e.g., 3000 INR"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={limit.requires_escalation}
                          onChange={(e) => updateAuthorityLimit(index, 'requires_escalation', e.target.checked)}
                          disabled={submitting}
                        />
                        Requires Escalation
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Checkbox */}
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="strict_validation"
                    checked={formData.strict_validation}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  Enable Strict Validation
                </label>
                <small>If enabled, all minimum score requirements must be met exactly</small>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (isEditMode ? 'Update Department Level' : 'Save Department Level')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentLevel;