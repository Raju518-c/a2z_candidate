import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CandidateSidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import { FaSpinner, FaUserGraduate, FaUserTie, FaBuilding, FaLevelUpAlt, FaCheck, FaArrowLeft } from 'react-icons/fa';
import "./FindMentor.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const MentorRequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentorSpecializations, setMentorSpecializations] = useState([]);
  const [levels, setLevels] = useState([]);
  const [candidateData, setCandidateData] = useState(null);
  const [selectedMentorDetails, setSelectedMentorDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [isManualSelection, setIsManualSelection] = useState(false);

  const [formData, setFormData] = useState({
    mentor_status: 'requested',
    responded_at: '',
    status: 'active',
    current_progress: 0,
    completion_percentage: 0,
    mentor: '',
    candidate: '',
    department: '',
    target_level: ''
  });

  // Get candidate data from localStorage and pre-fill from navigation state
  useEffect(() => {
    const getCandidateData = () => {
      try {
        const candidateUser = localStorage.getItem('candidate_user');
        if (candidateUser) {
          const parsed = JSON.parse(candidateUser);
          console.log('Candidate data from localStorage:', parsed);
          setCandidateData(parsed);
          
          // Get selected mentor from location state if available
          const selectedMentor = location.state?.selectedMentor;
          const candidateIdFromState = location.state?.candidateId;
          
          if (selectedMentor) {
            console.log('Pre-selected mentor from navigation:', selectedMentor);
            setIsManualSelection(false);
            
            // Set form data with candidate ID and pre-selected values
            setFormData(prev => ({
              ...prev,
              candidate: candidateIdFromState || parsed.user_id || '',
              mentor: selectedMentor.id || '',
              department: selectedMentor.department || '',
              target_level: selectedMentor.target_level || '',
              mentor_status: 'requested',
              status: 'active'
            }));
          } else {
            console.log('No mentor pre-selected, manual selection mode');
            setIsManualSelection(true);
            
            // Set only candidate ID
            setFormData(prev => ({
              ...prev,
              candidate: parsed.user_id || '',
              mentor_status: 'requested',
              status: 'active'
            }));
          }
        } else {
          console.error('No candidate data found in localStorage');
          Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please login as a candidate to continue.',
            timer: 3000,
            showConfirmButton: true
          }).then(() => {
            navigate('/login');
          });
        }
      } catch (error) {
        console.error('Error parsing candidate data:', error);
      }
    };

    getCandidateData();
  }, [location.state, navigate]);

  // Fetch mentors on component mount
  useEffect(() => {
    fetchMentors();
    fetchDepartments();
    fetchLevels();
  }, []);

  // Find selected mentor details when mentor ID changes
  useEffect(() => {
    if (formData.mentor && mentors.length > 0) {
      const mentor = mentors.find(m => m.id === parseInt(formData.mentor));
      setSelectedMentorDetails(mentor);
      if (mentor && mentor.specializations) {
        setMentorSpecializations(mentor.specializations);
        
        // Auto-select the first specialization if there's only one and no department selected
        if (mentor.specializations.length === 1 && !formData.department) {
          setFormData(prev => ({
            ...prev,
            department: mentor.specializations[0].toString()
          }));
        }
        
        // Auto-select target level if not set
        if (mentor.mentor_level && !formData.target_level) {
          setFormData(prev => ({
            ...prev,
            target_level: mentor.mentor_level.toString()
          }));
        }
      }
    }
  }, [formData.mentor, mentors, formData.department, formData.target_level]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/mentor/mentors/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        // Filter active mentors
        const activeMentors = result.data.filter(mentor => 
          mentor.mentorship_status === 'active' || mentor.mentorship_status === null
        );
        setMentors(activeMentors);
        console.log('✅ Mentors fetched successfully:', activeMentors);
      } else {
        throw new Error(result.message || 'Failed to fetch mentors');
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Mentors',
        text: err.message || 'An error occurred while loading mentors',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
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
        const activeDepartments = result.data.filter(dept => dept.is_active);
        setDepartments(activeDepartments);
        console.log('✅ Departments fetched successfully:', activeDepartments);
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
        const activeLevels = result.data.filter(level => level.is_active);
        setLevels(activeLevels);
        console.log('✅ Levels fetched successfully:', activeLevels);
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
    const newErrors = {};

    if (!formData.mentor) {
      newErrors.mentor = "Please select a mentor";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department/specialization";
    }

    if (!formData.target_level) {
      newErrors.target_level = "Please select a target level";
    }

    const isValid = Object.keys(newErrors).length === 0;
    console.log('Validation result:', isValid ? 'PASSED' : 'FAILED', newErrors);
    
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

    setSubmitting(true);

    // Prepare payload according to requirements
    const payload = {
      mentor_status: "requested",
      responded_at: new Date().toISOString(),
      status: "active",
      current_progress: 0,
      completion_percentage: 0,
      mentor: parseInt(formData.mentor),
      candidate: parseInt(formData.candidate),
      department: parseInt(formData.department),
      target_level: parseInt(formData.target_level)
    };

    console.log('📦 Submitting payload:', payload);

    try {
      const response = await fetch(`${BASE_URL}/api/mentor/mentorship-assignments/`, {
        method: 'POST',
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
        throw new Error(responseData?.message || 'Failed to create mentorship request');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Request Sent!',
        text: 'Your mentorship request has been sent successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/candidate-mentorship');
    } catch (err) {
      console.error('❌ Error submitting request:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Failed to submit mentorship request. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/candidate-mentorship');
  };

  // Get level display
  const getLevelDisplay = (level) => {
    return `${level.name} (Level ${level.number})`;
  };

  // Get mentor display
  const getMentorDisplay = (mentor) => {
    return `${mentor.full_name} ${mentor.current_company ? `- ${mentor.current_company}` : ''} (Level ${mentor.mentor_level})`;
  };

  // Get department name by ID
  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === parseInt(deptId));
    return dept ? `${dept.name} (${dept.code})` : `Department ${deptId}`;
  };

  // Get department option for dropdown
  const getDepartmentOption = (deptId) => {
    const dept = departments.find(d => d.id === parseInt(deptId));
    return dept ? `${dept.name} (${dept.code})` : `Department ${deptId}`;
  };

  return (
    <div className="ta-layout-wrapper">
      <CandidateSidebar />
      
      <div className="ta-main-wrapper">
        <Header />
        
        <div className="ta-content-area">
          <div className="mrf-wrapper">
            {/* Header with Back Button */}
            <div className="mrf-header">
              <div className="d-flex align-items-center gap-3">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary back-btn"
                  onClick={handleCancel}
                  aria-label="Go back"
                >
                  <FaArrowLeft className="me-2" />
                  Back
                </button>
                <div>
                  <h2>Request Mentorship</h2>
                  <p>Confirm your mentorship request details</p>
                </div>
              </div>
              {!isManualSelection && selectedMentorDetails && (
                <span className="mrf-preselected-badge">
                  <FaCheck className="me-1" />
                  Mentor Pre-selected
                </span>
              )}
            </div>

            {/* Candidate Info Card */}
            {candidateData && (
              <div className="mrf-candidate-card">
                <div className="mrf-candidate-avatar">
                  {candidateData.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="mrf-candidate-details">
                  <h5>{candidateData.full_name}</h5>
                  <p>{candidateData.email} | {candidateData.phone_number}</p>
                  <span className="mrf-candidate-badge">Candidate ID: {candidateData.user_id}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="mrf-form-container">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Hidden fields */}
                  <input type="hidden" name="mentor_status" value="requested" />
                  <input type="hidden" name="status" value="active" />
                  <input type="hidden" name="current_progress" value="0" />
                  <input type="hidden" name="completion_percentage" value="0" />
                  <input type="hidden" name="candidate" value={formData.candidate} />

                  {/* Mentor Selection */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaUserGraduate className="me-2" />
                      Select Mentor *
                    </label>
                    {!isManualSelection && selectedMentorDetails ? (
                      <div className="mrf-readonly-field">
                        <div className="mrf-mentor-info">
                          <span className="mrf-mentor-name">{selectedMentorDetails.full_name}</span>
                          {selectedMentorDetails.current_company && (
                            <span className="mrf-mentor-company"> @ {selectedMentorDetails.current_company}</span>
                          )}
                          <span className="mrf-mentor-level">Level {selectedMentorDetails.mentor_level}</span>
                        </div>
                        <input type="hidden" name="mentor" value={formData.mentor} />
                      </div>
                    ) : (
                      <select
                        className={`form-select ${errors.mentor ? 'is-invalid' : ''}`}
                        name="mentor"
                        value={formData.mentor}
                        onChange={handleChange}
                        disabled={submitting || loading || mentors.length === 0}
                      >
                        <option value="">-- Select Mentor --</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {getMentorDisplay(mentor)}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.mentor && (
                      <div className="invalid-feedback">{errors.mentor}</div>
                    )}
                    {mentors.length === 0 && !loading && (
                      <small className="text-warning">No active mentors available</small>
                    )}
                  </div>

                  {/* Department/Specialization Selection */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaBuilding className="me-2" />
                      Select Specialization/Department *
                    </label>
                    {selectedMentorDetails && mentorSpecializations.length > 0 ? (
                      mentorSpecializations.length === 1 ? (
                        // Single specialization - show as read-only
                        <div className="mrf-readonly-field">
                          <div className="mrf-specialization-info">
                            <span className="mrf-specialization-name">
                              {getDepartmentName(mentorSpecializations[0])}
                            </span>
                            <span className="mrf-specialization-badge">Auto-selected</span>
                          </div>
                          <input 
                            type="hidden" 
                            name="department" 
                            value={mentorSpecializations[0]} 
                          />
                        </div>
                      ) : (
                        // Multiple specializations - show dropdown
                        <select
                          className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          disabled={submitting}
                        >
                          <option value="">-- Select Specialization --</option>
                          {mentorSpecializations.map((deptId) => (
                            <option key={deptId} value={deptId}>
                              {getDepartmentOption(deptId)}
                            </option>
                          ))}
                        </select>
                      )
                    ) : (
                      <select
                        className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled={submitting || departments.length === 0}
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.department && (
                      <div className="invalid-feedback">{errors.department}</div>
                    )}
                    {selectedMentorDetails && mentorSpecializations.length > 0 && (
                      <small className="text-muted">
                        {mentorSpecializations.length === 1 
                          ? "This is the only specialization this mentor offers"
                          : "Select the department/specialization you want mentorship in"}
                      </small>
                    )}
                  </div>

                  {/* Target Level */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <FaLevelUpAlt className="me-2" />
                      Target Level *
                    </label>
                    <select
                      className={`form-select ${errors.target_level ? 'is-invalid' : ''}`}
                      name="target_level"
                      value={formData.target_level}
                      onChange={handleChange}
                      disabled={submitting || levels.length === 0}
                    >
                      <option value="">-- Select Target Level --</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {getLevelDisplay(level)}
                        </option>
                      ))}
                    </select>
                    {errors.target_level && (
                      <div className="invalid-feedback">{errors.target_level}</div>
                    )}
                  </div>
                </div>

                {/* Summary Card */}
                {selectedMentorDetails && (
                  <div className="mrf-summary-card mt-4">
                    <h6>Mentorship Request Summary</h6>
                    <div className="mrf-summary-grid">
                      <div className="mrf-summary-item">
                        <span className="mrf-summary-label">Mentor:</span>
                        <span className="mrf-summary-value">{selectedMentorDetails.full_name}</span>
                      </div>
                      <div className="mrf-summary-item">
                        <span className="mrf-summary-label">Specialization:</span>
                        <span className="mrf-summary-value">
                          {formData.department ? getDepartmentName(formData.department) : 'Not selected'}
                        </span>
                      </div>
                      <div className="mrf-summary-item">
                        <span className="mrf-summary-label">Target Level:</span>
                        <span className="mrf-summary-value">
                          {formData.target_level ? 
                            levels.find(l => l.id === parseInt(formData.target_level))?.name || 'Selected' 
                            : 'Not selected'}
                        </span>
                      </div>
                      <div className="mrf-summary-item">
                        <span className="mrf-summary-label">Status:</span>
                        <span className="mrf-summary-value mrf-status-badge">Requested</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="mrf-actions mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn mrf-primary-btn"
                    disabled={submitting || loading || !formData.mentor || !formData.department || !formData.target_level}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="mrf-spinner me-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
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

export default MentorRequestForm;