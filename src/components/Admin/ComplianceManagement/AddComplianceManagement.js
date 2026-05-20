import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddComplianceManagement.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddComplianceRule = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    validity_period_months: '',
    renewal_warning_days: '',
    grace_period_days: '',
    mandatory_check_interval_months: '',
    is_active: true,
    is_mandatory: true,
    priority: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchComplianceRuleData();
    }
  }, [id]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCategories(result.data);
        // Set default category if available and not in edit mode
        if (!id && result.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: result.data[0].id.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load categories. Please refresh the page.',
        timer: 3000
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchComplianceRuleData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const ruleData = result.data;
        
        setFormData({
          name: ruleData.name || '',
          description: ruleData.description || '',
          category: ruleData.category ? ruleData.category.toString() : '',
          validity_period_months: ruleData.validity_period_months || '',
          renewal_warning_days: ruleData.renewal_warning_days || '',
          grace_period_days: ruleData.grace_period_days || '',
          mandatory_check_interval_months: ruleData.mandatory_check_interval_months || '',
          is_active: ruleData.is_active !== undefined ? ruleData.is_active : true,
          is_mandatory: ruleData.is_mandatory !== undefined ? ruleData.is_mandatory : true,
          priority: ruleData.priority || ''
        });
        console.log('✅ Compliance rule data loaded for edit:', ruleData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching compliance rule data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Rule',
        text: err.message || 'An error occurred while loading rule data',
        showConfirmButton: true
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'validity_period_months' || name === 'renewal_warning_days' || 
               name === 'grace_period_days' || name === 'mandatory_check_interval_months' || 
               name === 'priority') ? 
              (value === '' ? '' : Number(value)) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Rule name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.validity_period_months && formData.validity_period_months !== 0) {
      newErrors.validity_period_months = "Validity period is required";
    } else if (formData.validity_period_months < 0) {
      newErrors.validity_period_months = "Validity period must be 0 or greater";
    }

    if (!formData.renewal_warning_days && formData.renewal_warning_days !== 0) {
      newErrors.renewal_warning_days = "Renewal warning days are required";
    } else if (formData.renewal_warning_days < 0) {
      newErrors.renewal_warning_days = "Renewal warning days must be 0 or greater";
    }

    if (!formData.grace_period_days && formData.grace_period_days !== 0) {
      newErrors.grace_period_days = "Grace period days are required";
    } else if (formData.grace_period_days < 0) {
      newErrors.grace_period_days = "Grace period days must be 0 or greater";
    }

    if (!formData.priority && formData.priority !== 0) {
      newErrors.priority = "Priority is required";
    } else if (formData.priority < 0) {
      newErrors.priority = "Priority must be 0 or greater";
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Please check all required fields and try again.',
        timer: 3000,
        showConfirmButton: true
      });
      return;
    }

    setLoading(true);
    setError('');

    // Prepare payload according to backend expectations - ONLY send fields that the model expects
    const payload = {
      name: formData.name,
      description: formData.description || '',
      category: Number(formData.category), // Send only the category ID
      validity_period_months: Number(formData.validity_period_months),
      renewal_warning_days: Number(formData.renewal_warning_days),
      grace_period_days: Number(formData.grace_period_days),
      mandatory_check_interval_months: formData.mandatory_check_interval_months ? Number(formData.mandatory_check_interval_months) : 0,
      is_active: formData.is_active,
      is_mandatory: formData.is_mandatory,
      priority: Number(formData.priority)
    };

    console.log('Submitting payload:', payload);

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode 
      ? `${BASE_URL}/api/admin/compliance-rules/${id}/` 
      : `${BASE_URL}/api/admin/compliance-rules/`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific validation errors
        if (responseData.data) {
          const errorMessages = Object.values(responseData.data).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'create'} compliance rule`);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Compliance rule has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/compliance');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} compliance rule. Please try again.`);
      
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} compliance rule. Please try again.`,
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/${id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete compliance rule');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Compliance rule has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/compliance');
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.message || 'Failed to delete compliance rule. Please try again.',
          timer: 3000,
          showConfirmButton: true
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/compliance');
  };

  if (fetchLoading || categoriesLoading) {
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
              <p className="mt-2">Loading compliance rule data...</p>
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
            <div className="ac-header">
              <div>
                <h2>{isEditMode ? 'Edit Compliance Rule' : 'Add New Compliance Rule'}</h2>
                <p>{isEditMode ? 'Update the compliance rule details below' : 'Fill in the compliance rule details below'}</p>
              </div>
            </div>

            {error && <div className="ac-error alert alert-danger">{error}</div>}

            <div className="ac-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Rule Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Rule Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      placeholder="Enter rule name (e.g., Safety Induction Requirement)"
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <select
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={loading || categoriesLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                    {categories.length === 0 && !categoriesLoading && (
                      <small className="text-danger">
                        No categories found. Please add a category first.
                      </small>
                    )}
                  </div>

                  {/* Validity Period */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Validity Period (months) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.validity_period_months ? 'is-invalid' : ''}`}
                      name="validity_period_months"
                      value={formData.validity_period_months}
                      onChange={handleChange}
                      placeholder="Enter validity period in months"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    {errors.validity_period_months && (
                      <div className="invalid-feedback">{errors.validity_period_months}</div>
                    )}
                  </div>

                  {/* Renewal Warning Days */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Renewal Warning Days *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.renewal_warning_days ? 'is-invalid' : ''}`}
                      name="renewal_warning_days"
                      value={formData.renewal_warning_days}
                      onChange={handleChange}
                      placeholder="Enter renewal warning days"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    {errors.renewal_warning_days && (
                      <div className="invalid-feedback">{errors.renewal_warning_days}</div>
                    )}
                  </div>

                  {/* Grace Period Days */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Grace Period Days *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.grace_period_days ? 'is-invalid' : ''}`}
                      name="grace_period_days"
                      value={formData.grace_period_days}
                      onChange={handleChange}
                      placeholder="Enter grace period days"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    {errors.grace_period_days && (
                      <div className="invalid-feedback">{errors.grace_period_days}</div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priority *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.priority ? 'is-invalid' : ''}`}
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      placeholder="Enter priority (higher number = higher priority)"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    <small className="text-muted">Higher number means higher priority</small>
                    {errors.priority && (
                      <div className="invalid-feedback">{errors.priority}</div>
                    )}
                  </div>

                  {/* Mandatory Check Interval */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mandatory Check Interval (months)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="mandatory_check_interval_months"
                      value={formData.mandatory_check_interval_months}
                      onChange={handleChange}
                      placeholder="Enter mandatory check interval"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    <small className="text-muted">Optional: How often to check compliance</small>
                  </div>

                  {/* Active Status */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <div className="form-check mt-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        id="isActive"
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>

                  {/* Mandatory Status */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Compliance Type</label>
                    <div className="form-check mt-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="is_mandatory"
                        checked={formData.is_mandatory}
                        onChange={handleChange}
                        id="isMandatory"
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="isMandatory">
                        Mandatory
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Enter rule description"
                      rows="4"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="ac-note mb-4">
                  <small className="text-muted">
                    Note: Fields marked with * are required.
                  </small>
                </div>

                <div className="ac-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  {isEditMode && (
                    <button 
                      type="button" 
                      className="btn btn-danger me-2"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || categories.length === 0}
                  >
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Rule' : 'Add Rule')}
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

export default AddComplianceRule;