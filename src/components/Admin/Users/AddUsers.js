import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddUsers.css"; // Create this CSS file (you can copy from AddCandidate.css)
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddUser = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    email: '',
    password: '',
  });

  // Fetch user data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/admin-users/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const userData = result.data;
        // Don't populate password field for security
        setFormData({
          username: userData.username || '',
          phone_number: userData.phone_number || '',
          email: userData.email || '',
          password: '', // Password field remains empty for edit mode
        });
        console.log('✅ User data loaded for edit:', userData);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load User',
        text: err.message || 'An error occurred while loading user data',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed - ${name}:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Username validation
    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
      console.log('Validation failed: Username is empty');
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
      console.log('Validation failed: Username too short');
    }

    // Phone number validation
    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
      console.log('Validation failed: Phone number is empty');
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
      console.log('Validation failed: Invalid phone number format');
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      console.log('Validation failed: Email is empty');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      console.log('Validation failed: Invalid email format');
    }

    // Password validation (only for create mode or if password field is filled in edit mode)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
        console.log('Validation failed: Password is empty');
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
        console.log('Validation failed: Password too short');
      }
    } else if (formData.password && formData.password.length < 6) {
      // In edit mode, only validate if they're trying to change password
      newErrors.password = "Password must be at least 6 characters long";
      console.log('Validation failed: New password too short');
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
    console.log(isEditMode ? 'EDIT USER FORM SUBMISSION STARTED' : 'CREATE USER FORM SUBMISSION STARTED');
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

    // Prepare payload
    const payload = {
      username: formData.username,
      phone_number: formData.phone_number,
      email: formData.email,
    };

    // Only include password if it's provided (for create mode or password change in edit mode)
    if (formData.password) {
      payload.password = formData.password;
    }

    console.log('📦 Payload prepared for submission:');
    console.log(JSON.stringify(payload, null, 2));
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode 
      ? `${BASE_URL}/api/admin/admin-users/${id}/` 
      : `${BASE_URL}/api/admin/admin-users/`;
    
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
        
        // Handle field-specific errors from server
        if (errorData.errors) {
          const serverErrors = {};
          Object.keys(errorData.errors).forEach(key => {
            serverErrors[key] = errorData.errors[key][0];
          });
          setErrors(serverErrors);
          throw new Error('Please check the form for errors');
        }
        
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
      }

      const data = await response.json();
      console.log(`✅ User ${isEditMode ? 'updated' : 'created'} successfully!`);
      console.log('📋 Server response:', data);
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated!' : 'Created!',
        text: `User has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log('🔄 Navigating back to users list...');
      navigate('/users'); // Adjust this route as needed
    } catch (err) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'creating'} user:`);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`);
      
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`,
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
    console.log('Cancel button clicked - navigating back to users list');
    navigate('/users'); // Adjust this route as needed
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Log component mount
  useEffect(() => {
    console.log(`📝 ${isEditMode ? 'EditUser' : 'AddUser'} component mounted`);
    console.log('Initial form state:', formData);
    
    return () => {
      console.log(`📝 ${isEditMode ? 'EditUser' : 'AddUser'} component unmounted`);
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
              <p className="mt-2">Loading user data...</p>
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
          <div className="au-wrapper"> {/* au = AddUser */}
            {/* Header */}
            <div className="au-header">
              <div>
                <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                <p>{isEditMode ? 'Update the user details below' : 'Fill in the user details below'}</p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {/* Error Message */}
            {error && <div className="au-error alert alert-danger">{error}</div>}

            {/* Form */}
            <div className="au-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Username */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      name="username"
                      value={formData.username || ''}
                      onChange={handleChange}
                      placeholder="Enter username"
                      disabled={loading}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      disabled={loading}
                    />
                    {errors.phone_number && (
                      <div className="invalid-feedback">{errors.phone_number}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Password {!isEditMode && <span className="text-danger">*</span>}
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                    </div>
                    {isEditMode && (
                      <small className="text-muted">
                        Leave password blank to keep current password
                      </small>
                    )}
                    {!isEditMode && (
                      <small className="text-muted">
                        Password must be at least 6 characters long
                      </small>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="au-actions mt-4">
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
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update User' : 'Add User'
                    )}
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

export default AddUser;