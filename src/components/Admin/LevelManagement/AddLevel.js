import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddLevel.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddLevel = () => {
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
    number: '', // Start with empty string, but will accept 0
    description: '',
    is_active: true,
    min_score_required: '',
    max_score: ''
  });

  // Fetch level data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchLevelData();
    }
  }, [id]);

  const fetchLevelData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/levels/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const levelData = result.data;
        setFormData({
          name: levelData.name || '',
          code: levelData.code || '',
          number: levelData.number !== undefined && levelData.number !== null ? levelData.number : '',
          description: levelData.description || '',
          is_active: levelData.is_active !== undefined ? levelData.is_active : true,
          min_score_required: levelData.min_score_required !== undefined && levelData.min_score_required !== null ? levelData.min_score_required : '',
          max_score: levelData.max_score !== undefined && levelData.max_score !== null ? levelData.max_score : ''
        });
        console.log('✅ Level data loaded for edit:', levelData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching level data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Level',
        text: err.message || 'An error occurred while loading level data',
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
              (name === 'number' || name === 'min_score_required' || name === 'max_score') ? 
              (value === '' ? '' : Number(value)) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Level name is required";
    }

    if (!formData.code?.trim()) {
      newErrors.code = "Level code is required";
    }

    // Check for number field - allow 0 as valid
    if (formData.number === '' || formData.number === null || formData.number === undefined) {
      newErrors.number = "Level number is required";
    } else if (formData.number < 0) {
      newErrors.number = "Level number must be 0 or greater";
    }

    // Check for min_score_required - allow 0 as valid
    if (formData.min_score_required === '' || formData.min_score_required === null || formData.min_score_required === undefined) {
      newErrors.min_score_required = "Minimum score required is required";
    } else if (formData.min_score_required < 0) {
      newErrors.min_score_required = "Minimum score must be 0 or greater";
    }

    // Check for max_score - allow 0 as valid
    if (formData.max_score === '' || formData.max_score === null || formData.max_score === undefined) {
      newErrors.max_score = "Maximum score is required";
    } else if (formData.max_score < 0) {
      newErrors.max_score = "Maximum score must be 0 or greater";
    }

    // Validate that max_score is greater than min_score_required
    if (formData.max_score !== '' && formData.min_score_required !== '' && 
        Number(formData.max_score) <= Number(formData.min_score_required)) {
      newErrors.max_score = "Maximum score must be greater than minimum score required";
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

    // Prepare payload - ensure numbers are properly converted
    const payload = {
      name: formData.name,
      code: formData.code,
      number: Number(formData.number),
      description: formData.description || '',
      is_active: formData.is_active,
      min_score_required: Number(formData.min_score_required),
      max_score: Number(formData.max_score)
    };

    console.log('Submitting payload:', payload); // Debug log

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode 
      ? `${BASE_URL}/api/admin/levels/${id}/` 
      : `${BASE_URL}/api/admin/levels/`;

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
        throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'create'} level`);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Level has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/level');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} level. Please try again.`);
      
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} level. Please try again.`,
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
        const response = await fetch(`${BASE_URL}/api/admin/levels/${id}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete level');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Level has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/level');
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.message || 'Failed to delete level. Please try again.',
          timer: 3000,
          showConfirmButton: true
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/level');
  };

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
              <p className="mt-2">Loading level data...</p>
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
                <h2>{isEditMode ? 'Edit Level' : 'Add New Level'}</h2>
                <p>{isEditMode ? 'Update the level details below' : 'Fill in the level details below'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="ac-error alert alert-danger">{error}</div>}

            {/* Form */}
            <div className="ac-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Level Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Level Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      placeholder="Enter level name (e.g., Trainee, Junior Surveyor)"
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  {/* Level Code */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Level Code *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                      name="code"
                      value={formData.code || ''}
                      onChange={handleChange}
                      placeholder="Enter level code (e.g., LVL0, JR-SRV)"
                      disabled={loading}
                    />
                    {errors.code && (
                      <div className="invalid-feedback">{errors.code}</div>
                    )}
                  </div>

                  {/* Level Number */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Level Number *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.number ? 'is-invalid' : ''}`}
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="Enter level number (0, 1, 2, etc.)"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    <small className="text-muted">Level numbers start from 0</small>
                    {errors.number && (
                      <div className="invalid-feedback">{errors.number}</div>
                    )}
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

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Enter level description"
                      rows="3"
                      disabled={loading}
                    />
                  </div>

                  {/* Minimum Score Required */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Minimum Score Required *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.min_score_required ? 'is-invalid' : ''}`}
                      name="min_score_required"
                      value={formData.min_score_required}
                      onChange={handleChange}
                      placeholder="Enter minimum score required"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    {errors.min_score_required && (
                      <div className="invalid-feedback">{errors.min_score_required}</div>
                    )}
                  </div>

                  {/* Maximum Score */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Maximum Score *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.max_score ? 'is-invalid' : ''}`}
                      name="max_score"
                      value={formData.max_score}
                      onChange={handleChange}
                      placeholder="Enter maximum score"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    {errors.max_score && (
                      <div className="invalid-feedback">{errors.max_score}</div>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="ac-note mb-4">
                  <small className="text-muted">
                    Note: Fields marked with * are required. Level numbers can start from 0.
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
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Level' : 'Add Level')}
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

export default AddLevel;