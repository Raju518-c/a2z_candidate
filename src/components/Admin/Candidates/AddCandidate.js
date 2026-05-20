import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import "./AddCandidate.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const AddCandidate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'M',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    medical_expiry_date: '',
    candidate_status: 'pending', // Add candidate_status field with correct value
  });

  // Fetch candidate data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchCandidateData();
    }
  }, [id]);

  const fetchCandidateData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${BASE_URL}/api/candidate/candidates/${id}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const candidateData = result.data;
        // Format dates for input fields (YYYY-MM-DD)
        const formattedData = {
          full_name: candidateData.full_name || '',
          date_of_birth: candidateData.date_of_birth ? candidateData.date_of_birth.split('T')[0] : '',
          gender: candidateData.gender || 'M',
          phone_number: candidateData.phone_number || '',
          email: candidateData.email || '',
          address: candidateData.address || '',
          city: candidateData.city || '',
          state: candidateData.state || '',
          country: candidateData.country || '',
          pincode: candidateData.pincode || '',
          emergency_contact_name: candidateData.emergency_contact_name || '',
          emergency_contact_phone: candidateData.emergency_contact_phone || '',
          blood_group: candidateData.blood_group || '',
          medical_expiry_date: candidateData.medical_expiry_date ? candidateData.medical_expiry_date.split('T')[0] : '',
          candidate_status: candidateData.candidate_status || 'pending',
        };
        setFormData(formattedData);
        console.log('✅ Candidate data loaded for edit:', formattedData);
      } else {
        throw new Error(result.message || 'Failed to fetch candidate data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching candidate data:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Candidate',
        text: err.message || 'An error occurred while loading candidate data',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    console.log('Current form data:', formData);
    
    const newErrors = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }

    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state?.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country?.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    if (!formData.emergency_contact_name?.trim()) {
      newErrors.emergency_contact_name = "Emergency contact name is required";
    }

    if (!formData.emergency_contact_phone?.trim()) {
      newErrors.emergency_contact_phone = "Emergency contact phone is required";
    } else if (!/^\d{10}$/.test(formData.emergency_contact_phone.replace(/\D/g, ''))) {
      newErrors.emergency_contact_phone = "Please enter a valid 10-digit phone number";
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

  // Prepare payload
  const payload = {
    full_name: formData.full_name,
    date_of_birth: formData.date_of_birth,
    gender: formData.gender,
    phone_number: formData.phone_number,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    pincode: formData.pincode,
    emergency_contact_name: formData.emergency_contact_name,
    emergency_contact_phone: formData.emergency_contact_phone,
    blood_group: formData.blood_group || '',
    medical_expiry_date: formData.medical_expiry_date || '',
    safety_induction_status: true,
  };

  // Add candidate_status for both create and edit
  if (isEditMode) {
    payload.candidate_status = formData.candidate_status;
  } else {
    // For new candidates, you can set default status
    payload.candidate_status = 'active'; // or 'pending' based on your requirement
  }

  // Remove empty values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
      delete payload[key];
    }
  });

  console.log('📦 Payload:', payload);
  
  const method = isEditMode ? 'PUT' : 'POST';
  const url = isEditMode 
    ? `${BASE_URL}/api/candidate/candidates/${id}/` 
    : `${BASE_URL}/api/candidate/candidates/`;

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
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
      throw new Error(responseData?.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate`);
    }

    await Swal.fire({
      icon: 'success',
      title: isEditMode ? 'Updated!' : 'Created!',
      text: `Candidate has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
    
    navigate('/candidate');
  } catch (err) {
    console.error(`❌ Error:`, err);
    setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate.`);
    
    Swal.fire({
      icon: 'error',
      title: isEditMode ? 'Update Failed' : 'Creation Failed',
      text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} candidate.`,
      timer: 3000,
      showConfirmButton: true
    });
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate('/candidate');
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
              <p className="mt-2">Loading candidate data...</p>
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
                <h2>{isEditMode ? 'Edit Candidate' : 'Add New Candidate'}</h2>
                <p>{isEditMode ? 'Update the candidate details below' : 'Fill in the candidate details below'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="ac-error alert alert-danger">{error}</div>}

            {/* Form */}
            <div className="ac-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">

                  {/* Full Name */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      disabled={loading}
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">{errors.full_name}</div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                      name="date_of_birth"
                      value={formData.date_of_birth || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.date_of_birth && (
                      <div className="invalid-feedback">{errors.date_of_birth}</div>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Gender *</label>
                    <select
                      className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                      name="gender"
                      value={formData.gender || 'M'}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                    {errors.gender && (
                      <div className="invalid-feedback">{errors.gender}</div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Phone Number *</label>
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
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Email *</label>
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

                  {/* Address */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      placeholder="Enter address"
                      disabled={loading}
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      placeholder="Enter city"
                      disabled={loading}
                    />
                    {errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>

                  {/* State */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      placeholder="Enter state"
                      disabled={loading}
                    />
                    {errors.state && (
                      <div className="invalid-feedback">{errors.state}</div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      placeholder="Enter country"
                      disabled={loading}
                    />
                    {errors.country && (
                      <div className="invalid-feedback">{errors.country}</div>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                      name="pincode"
                      value={formData.pincode || ''}
                      onChange={handleChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      disabled={loading}
                    />
                    {errors.pincode && (
                      <div className="invalid-feedback">{errors.pincode}</div>
                    )}
                  </div>

                  {/* Emergency Contact Name */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Emergency Contact Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.emergency_contact_name ? 'is-invalid' : ''}`}
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={handleChange}
                      placeholder="Enter emergency contact name"
                      disabled={loading}
                    />
                    {errors.emergency_contact_name && (
                      <div className="invalid-feedback">{errors.emergency_contact_name}</div>
                    )}
                  </div>

                  {/* Emergency Contact Phone */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.emergency_contact_phone ? 'is-invalid' : ''}`}
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone || ''}
                      onChange={handleChange}
                      placeholder="Enter emergency contact phone"
                      maxLength="10"
                      disabled={loading}
                    />
                    {errors.emergency_contact_phone && (
                      <div className="invalid-feedback">{errors.emergency_contact_phone}</div>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      name="blood_group"
                      value={formData.blood_group || ''}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Medical Expiry Date */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Medical Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="medical_expiry_date"
                      value={formData.medical_expiry_date || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Candidate Status - Only show in edit mode */}
                  {isEditMode && (
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Candidate Status</label>
                      <select
                        className="form-select"
                        name="candidate_status"
                        value={formData.candidate_status || 'pending'}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  )}
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
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (isEditMode ? 'Update Candidate' : 'Add Candidate')}
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

export default AddCandidate;