import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddEmailSettings.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddEmailSetting = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    host_name: '',
    host_email: '',
    smtp_server: '',
    smtp_port: '',
    host_password: '123456',
    status: 'active'
  });

  // Check if in edit mode and fetch data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchEmailSettingData();
    }
  }, [id]);

  const fetchEmailSettingData = async () => {
    try {
      setFetchLoading(true);
      
      const response = await fetch(`${BASE_URL}/api/admin/host-mails/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Fetch by ID response:', result);
      
      if (result.status && result.data) {
        const settingData = result.data;
        setFormData({
          host_name: settingData.host_name || '',
          host_email: settingData.host_email || '',
          smtp_server: settingData.smtp_server || '',
          smtp_port: settingData.smtp_port || '',
          host_password: '', // Don't populate password for security
          status: settingData.status || 'active'
        });
        console.log('✅ Email setting loaded for edit:', settingData);
      } else {
        throw new Error(result.message || 'Failed to fetch email setting');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching email setting:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Email Setting',
        text: err.message || 'An error occurred while loading email setting',
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
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    console.log('Starting form validation...');
    
    const newErrors = {};

    if (!formData.host_name?.trim()) {
      newErrors.host_name = "Host name is required";
    }

    if (!formData.host_email?.trim()) {
      newErrors.host_email = "Host email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.host_email)) {
      newErrors.host_email = "Please enter a valid email address";
    }

    if (!formData.smtp_server?.trim()) {
      newErrors.smtp_server = "SMTP server is required";
    }

    if (!formData.smtp_port) {
      newErrors.smtp_port = "SMTP port is required";
    } else if (!/^\d+$/.test(formData.smtp_port)) {
      newErrors.smtp_port = "SMTP port must be a number";
    }

    // Password is required only for new records
    if (!isEditMode && !formData.host_password?.trim()) {
      newErrors.host_password = "Password is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      console.log('Validation errors:', newErrors);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('='.repeat(50));
    console.log(isEditMode ? 'EDIT FORM SUBMISSION STARTED' : 'CREATE FORM SUBMISSION STARTED');
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
    setError('');

    // Prepare payload
    const payload = {
      host_name: formData.host_name,
      host_email: formData.host_email,
      smtp_server: formData.smtp_server,
      smtp_port: parseInt(formData.smtp_port),
      status: formData.status
    };

    // Add password only for new records or if changed in edit mode
    if (formData.host_password) {
      payload.host_password = formData.host_password;
    }

    console.log('📦 Payload prepared for submission:');
    console.log(JSON.stringify(payload, null, 2));
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode 
      ? `${BASE_URL}/api/admin/host-mails/${id}/` 
      : `${BASE_URL}/api/admin/host-mails/`;
    
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
        
        let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} email setting`;
        
        // Handle field-specific errors
        if (errorData.data) {
          const fieldErrors = Object.entries(errorData.data)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          errorMessage = `${errorData.message || 'Validation failed'}: ${fieldErrors}`;
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Email setting ${isEditMode ? 'updated' : 'created'} successfully!`);
      console.log('📋 Server response:', data);
      
      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated!' : 'Created!',
        text: `Email setting has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log('🔄 Navigating back to email settings list...');
      navigate('/email-settings');
    } catch (err) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'creating'} email setting:`, err);
      
      setError(err.message);
      
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message,
        timer: 5000,
        showConfirmButton: true
      });
    } finally {
      console.log(`🏁 Form submission process completed.`);
      console.log('='.repeat(50));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/email-settings');
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
              <p className="mt-2">Loading email setting data...</p>
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
          <div className="aes-wrapper">
            {/* Header */}
            <div className="aes-header">
              <div>
                <h2>{isEditMode ? 'Edit Email Setting' : 'Add New Email Setting'}</h2>
                <p>{isEditMode ? 'Update the email setting details below' : 'Configure a new email setting below'}</p>
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
            {error && <div className="aes-error">{error}</div>}

            {/* Form */}
            <div className="aes-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Host Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Host Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.host_name ? 'is-invalid' : ''}`}
                      name="host_name"
                      value={formData.host_name || ''}
                      onChange={handleChange}
                      placeholder="e.g., Gmail SMTP, Outlook SMTP"
                    />
                    {errors.host_name && (
                      <div className="invalid-feedback">{errors.host_name}</div>
                    )}
                  </div>

                  {/* Host Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Host Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.host_email ? 'is-invalid' : ''}`}
                      name="host_email"
                      value={formData.host_email || ''}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                    {errors.host_email && (
                      <div className="invalid-feedback">{errors.host_email}</div>
                    )}
                  </div>

                  {/* SMTP Server */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Server *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.smtp_server ? 'is-invalid' : ''}`}
                      name="smtp_server"
                      value={formData.smtp_server || ''}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com"
                    />
                    {errors.smtp_server && (
                      <div className="invalid-feedback">{errors.smtp_server}</div>
                    )}
                  </div>

                  {/* SMTP Port */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Port *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.smtp_port ? 'is-invalid' : ''}`}
                      name="smtp_port"
                      value={formData.smtp_port || ''}
                      onChange={handleChange}
                      placeholder="587"
                    />
                    {errors.smtp_port && (
                      <div className="invalid-feedback">{errors.smtp_port}</div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      {isEditMode ? 'Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.host_password ? 'is-invalid' : ''}`}
                      name="host_password"
                      value={formData.host_password || ''}
                      onChange={handleChange}
                      placeholder={isEditMode ? "Enter new password" : "Enter password"}
                    />
                    {errors.host_password && (
                      <div className="invalid-feedback">{errors.host_password}</div>
                    )}
                    {isEditMode && (
                      <small className="text-muted">
                        Leave blank to keep the existing password
                      </small>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status *</label>
                    <select
                      className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                      name="status"
                      value={formData.status || 'active'}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    {errors.status && (
                      <div className="invalid-feedback">{errors.status}</div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="aes-actions">
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
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Email Setting' : 'Add Email Setting')}
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

export default AddEmailSetting;