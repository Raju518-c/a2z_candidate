import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
// import "./AddDepartment.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddDepartment = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    required_certifications: '',
    duration_months: '',
  });

  // Fetch department data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchDepartmentData();
    }
  }, [id]);

  const fetchDepartmentData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/departments/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const departmentData = result.data;
        setFormData(departmentData);
        console.log('✅ Department data loaded for edit:', departmentData);
      } else {
        // If API returns data directly without status wrapper
        setFormData(result);
        console.log('✅ Department data loaded for edit:', result);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching department data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Department',
        text: err.message || 'An error occurred while loading department data',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    console.log(`Field changed - ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      console.log(`Clearing error for field: ${name}`);
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    console.log('Starting form validation...');
    console.log('Current form data:', formData);
    
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Department name is required";
      console.log('Validation failed: Department name is empty');
    }

    if (!formData.code?.trim()) {
      newErrors.code = "Department code is required";
      console.log('Validation failed: Department code is empty');
    } else if (formData.code.length > 10) {
      newErrors.code = "Department code should not exceed 10 characters";
      console.log('Validation failed: Department code too long');
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
      console.log('Validation failed: Description is empty');
    }

    if (!formData.required_certifications?.trim()) {
      newErrors.required_certifications = "Required certifications is required";
      console.log('Validation failed: Required certifications is empty');
    }

    if (!formData.duration_months) {
      newErrors.duration_months = "Duration in months is required";
      console.log('Validation failed: Duration is empty');
    } else if (formData.duration_months <= 0) {
      newErrors.duration_months = "Duration must be greater than 0";
      console.log('Validation failed: Invalid duration');
    } else if (formData.duration_months > 2147483647) {
      newErrors.duration_months = "Duration exceeds maximum value";
      console.log('Validation failed: Duration exceeds max value');
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
    console.log(isEditMode ? 'EDIT DEPARTMENT FORM SUBMISSION STARTED' : 'CREATE DEPARTMENT FORM SUBMISSION STARTED');
    console.log('='.repeat(50));
    
    console.log('Validating form...');
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
    setError('');

    // Prepare payload with is_active set to true
    const payload = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      is_active: true, // Always set to true for new departments
      required_certifications: formData.required_certifications,
      duration_months: parseInt(formData.duration_months),
    };

    // Remove any undefined or null values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    console.log('📦 Payload prepared for submission:');
    console.log(JSON.stringify(payload, null, 2));
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode 
      ? `${BASE_URL}/api/admin/departments/${id}/` 
      : `${BASE_URL}/api/admin/departments/`;
    
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server returned error:', errorData);
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} department`);
      }

      const data = await response.json();
      console.log(`✅ Department ${isEditMode ? 'updated' : 'created'} successfully!`);
      console.log('📋 Server response:', data);
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated!' : 'Created!',
        text: `Department has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log('🔄 Navigating back to departments list...');
      navigate('/department');
    } catch (err) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'creating'} department:`);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} department. Please try again.`);
      
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} department. Please try again.`,
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      console.log(`🏁 Form submission process completed.`);
      console.log('='.repeat(50));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - navigating back to departments list');
    navigate('/department');
  };

  // Log component mount
  useEffect(() => {
    console.log(`📝 ${isEditMode ? 'EditDepartment' : 'AddDepartment'} component mounted`);
    console.log('Initial form state:', formData);
    
    return () => {
      console.log(`📝 ${isEditMode ? 'EditDepartment' : 'AddDepartment'} component unmounted`);
    };
  }, [isEditMode]);

  if (fetchLoading) {
    return (
      <div className="ta-layout-wrapper">
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading department data...</p>
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
          <div className="ac-wrapper">
            {/* Header */}
            <div className="ac-header">
              <div>
                <h2>{isEditMode ? 'Edit Department' : 'Add New Department'}</h2>
                <p>{isEditMode ? 'Update the department details below' : 'Fill in the department details below'}</p>
              </div>
              {/* <button 
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button> */}
            </div>

            {/* Error Message */}
            {error && <div className="ac-error">{error}</div>}

            {/* Form */}
            <div className="ac-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Department Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Department Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      placeholder="Enter department name (e.g., Manufacturing)"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  {/* Department Code */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Department Code *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                      name="code"
                      value={formData.code || ''}
                      onChange={handleChange}
                      placeholder="Enter department code (e.g., MFG)"
                      maxLength="10"
                    />
                    {errors.code && (
                      <div className="invalid-feedback">{errors.code}</div>
                    )}
                    <small className="text-muted">Maximum 10 characters</small>
                  </div>

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Enter department description"
                      rows="3"
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>

                  {/* Required Certifications */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Required Certifications *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.required_certifications ? 'is-invalid' : ''}`}
                      name="required_certifications"
                      value={formData.required_certifications || ''}
                      onChange={handleChange}
                      placeholder="e.g., Safety Training, Technical Certification"
                    />
                    {errors.required_certifications && (
                      <div className="invalid-feedback">{errors.required_certifications}</div>
                    )}
                  </div>

                  {/* Duration in Months */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Duration (Months) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.duration_months ? 'is-invalid' : ''}`}
                      name="duration_months"
                      value={formData.duration_months || ''}
                      onChange={handleChange}
                      placeholder="Enter duration in months"
                      min="1"
                      max="2147483647"
                    />
                    {errors.duration_months && (
                      <div className="invalid-feedback">{errors.duration_months}</div>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="ac-note mb-4">
                  <small className="text-muted">
                    Note: Department will be created with active status enabled.
                  </small>
                </div>

                {/* Form Actions */}
                <div className="ac-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Department' : 'Add Department')}
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

export default AddDepartment;