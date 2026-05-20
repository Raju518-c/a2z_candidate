import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CandidateSidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import "./AddCandidateLogEntry.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaArrowLeft, FaCloudUploadAlt, FaTrash, FaFile, FaSpinner } from 'react-icons/fa';

const AddLogbookEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [competencies, setCompetencies] = useState([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);

  // Selected files for upload
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_description: '',
    work_location: '',
    ship_name: '',
    ship_type: '',
    ship_type_other: '',
    work_type: '',
    work_type_other: '',
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    start_date: '',
    end_date: '',
    work_environment: '',
    work_environment_other: '',
    weather_conditions: '',
    weather_conditions_other: '',
    team_size: 1,
    team_role: '',
    team_role_other: '',
    equipment_used: '',
    safety_precautions: '',
    incidents_occurred: false,
    incident_description: '',
    quality_checks: false,
    quality_standards: '',
    inspection_required: false,
    inspection_passed: false,
    certificates_required: '',
    certificates_obtained: '',
    compliance_standards: '',
    evidence_type: 'document',
    evidence_type_other: '',
    evidence_link: '',
    reviewed_by: '',
    reviewed_at: '',
    review_comments: '',
    submitted_by: '',
    submission_notes: '',
    supervisor_name: '',
    supervisor_contact: '',
    client_name: '',
    competency: ''
  });

  useEffect(() => {
    fetchCompetencies();
    
    try {
      const candidateUser = localStorage.getItem('candidate_user');
      if (candidateUser) {
        const parsed = JSON.parse(candidateUser);
        setFormData(prev => ({
          ...prev,
          submitted_by: parsed.full_name || parsed.email || 'Candidate'
        }));
      }
    } catch (error) {
      console.error('Error parsing candidate_user:', error);
    }
  }, []);

  // Fetch entry data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchLogbookEntry();
    }
  }, [isEditMode, id]);

  const fetchLogbookEntry = async () => {
    try {
      setFetchingData(true);
      const response = await fetch(`${BASE_URL}/api/candidate/digital-logbook/${id}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        const entryData = result.data;
        
        // Prepare form data with existing values
        setFormData({
          title: entryData.title || '',
          description: entryData.description || '',
          work_description: entryData.work_description || '',
          work_location: entryData.work_location || '',
          ship_name: entryData.ship_name || '',
          ship_type: entryData.ship_type || '',
          ship_type_other: entryData.ship_type_other || '',
          work_type: entryData.work_type || '',
          work_type_other: entryData.work_type_other || '',
          months: entryData.months || 0,
          weeks: entryData.weeks || 0,
          days: entryData.days || 0,
          hours: entryData.hours || 0,
          minutes: entryData.minutes || 0,
          start_date: entryData.start_date || '',
          end_date: entryData.end_date || '',
          work_environment: entryData.work_environment || '',
          work_environment_other: entryData.work_environment_other || '',
          weather_conditions: entryData.weather_conditions || '',
          weather_conditions_other: entryData.weather_conditions_other || '',
          team_size: entryData.team_size || 1,
          team_role: entryData.team_role || '',
          team_role_other: entryData.team_role_other || '',
          equipment_used: entryData.equipment_used || '',
          safety_precautions: entryData.safety_precautions || '',
          incidents_occurred: entryData.incidents_occurred || false,
          incident_description: entryData.incident_description || '',
          quality_checks: entryData.quality_checks || false,
          quality_standards: entryData.quality_standards || '',
          inspection_required: entryData.inspection_required || false,
          inspection_passed: entryData.inspection_passed || false,
          certificates_required: entryData.certificates_required || '',
          certificates_obtained: entryData.certificates_obtained || '',
          compliance_standards: entryData.compliance_standards || '',
          evidence_type: entryData.evidence_type || 'document',
          evidence_type_other: entryData.evidence_type_other || '',
          evidence_link: entryData.evidence_link || '',
          submitted_by: entryData.submitted_by || formData.submitted_by,
          submission_notes: entryData.submission_notes || '',
          supervisor_name: entryData.supervisor_name || '',
          supervisor_contact: entryData.supervisor_contact || '',
          client_name: entryData.client_name || '',
          competency: entryData.competency || ''
        });
        
        console.log('✅ Logbook entry loaded for editing:', entryData);
      } else {
        throw new Error(result.message || 'Failed to fetch logbook entry');
      }
    } catch (err) {
      console.error('Error fetching logbook entry:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Entry',
        text: err.message || 'An error occurred while loading the logbook entry',
        timer: 3000,
        showConfirmButton: true
      });
      navigate('/candidate-digital');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCompetencies = async () => {
    try {
      setLoadingCompetencies(true);
      const response = await fetch(`${BASE_URL}/api/candidate/competencies/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCompetencies(result.data);
        console.log('✅ Competencies fetched successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch competencies');
      }
    } catch (err) {
      console.error('Error fetching competencies:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Competencies',
        text: err.message || 'An error occurred while loading competencies',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoadingCompetencies(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? 0 : Number(value)) : 
              value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) return;

    if (file.size > maxSize) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is 10MB per file.`,
        showConfirmButton: true
      });
      e.target.value = '';
      return;
    }

    switch (fileType) {
      case 'evidence': setEvidenceFile(file); break;
      case 'photo': setPhotoFile(file); break;
      case 'video': setVideoFile(file); break;
      case 'document': setDocumentFile(file); break;
      default: break;
    }
  };

  const handleRemoveFile = (fileType) => {
    switch(fileType) {
      case 'evidence':
        setEvidenceFile(null);
        break;
      case 'photo':
        setPhotoFile(null);
        break;
      case 'video':
        setVideoFile(null);
        break;
      case 'document':
        setDocumentFile(null);
        break;
      default:
        break;
    }
    const input = document.getElementById(`${fileType}-files`);
    if (input) input.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.work_description?.trim()) {
      newErrors.work_description = "Work description is required";
    }

    if (!formData.work_location?.trim()) {
      newErrors.work_location = "Work location is required";
    }

    if (!formData.ship_name?.trim()) {
      newErrors.ship_name = "Ship/Asset name is required";
    }

    if (!formData.ship_type) {
      newErrors.ship_type = "Ship type is required";
    } else if (formData.ship_type === 'other' && !formData.ship_type_other?.trim()) {
      newErrors.ship_type_other = "Please specify ship type";
    }

    if (!formData.work_type) {
      newErrors.work_type = "Work type is required";
    } else if (formData.work_type === 'other' && !formData.work_type_other?.trim()) {
      newErrors.work_type_other = "Please specify work type";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = "End date cannot be earlier than start date";
    }

    if (!formData.work_environment) {
      newErrors.work_environment = "Work environment is required";
    } else if (formData.work_environment === 'other' && !formData.work_environment_other?.trim()) {
      newErrors.work_environment_other = "Please specify work environment";
    }

    if (!formData.weather_conditions) {
      newErrors.weather_conditions = "Weather conditions are required";
    } else if (formData.weather_conditions === 'other' && !formData.weather_conditions_other?.trim()) {
      newErrors.weather_conditions_other = "Please specify weather conditions";
    }

    if (!formData.team_role) {
      newErrors.team_role = "Team role is required";
    } else if (formData.team_role === 'other' && !formData.team_role_other?.trim()) {
      newErrors.team_role_other = "Please specify team role";
    }

    if (formData.team_size < 1) {
      newErrors.team_size = "Team size must be at least 1";
    }

    if (formData.incidents_occurred && !formData.incident_description?.trim()) {
      newErrors.incident_description = "Please describe the incident";
    }

    if (formData.quality_checks && !formData.quality_standards?.trim()) {
      newErrors.quality_standards = "Please specify quality standards followed";
    }

    if (formData.inspection_required && formData.inspection_passed === null) {
      newErrors.inspection_passed = "Please specify if inspection passed";
    }

    if (!formData.competency) {
      newErrors.competency = "Please select a competency";
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

    const MAX_TOTAL = 20 * 1024 * 1024;
    const files = [evidenceFile, photoFile, videoFile, documentFile].filter(Boolean);
    const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);

    if (totalFileSize > MAX_TOTAL) {
      Swal.fire({
        icon: 'error',
        title: 'Total Upload Too Large',
        text: `Combined file size is ${(totalFileSize / (1024 * 1024)).toFixed(1)}MB. Please keep total uploads under 20MB.`,
        showConfirmButton: true
      });
      return;
    }

    setLoading(true);
    setError('');

    const formDataToSend = new FormData();

    const excludedFields = ['evidence_documents', 'verification_status'];

    Object.keys(formData).forEach(key => {
      if (excludedFields.includes(key)) {
        return;
      }
      
      const val = formData[key];
      if (val !== null && val !== undefined && val !== '') {
        formDataToSend.append(key, val ?? "");
      }
    });

    if (evidenceFile) formDataToSend.append('evidence_files', evidenceFile);
    if (photoFile) formDataToSend.append('photo_files', photoFile);
    if (videoFile) formDataToSend.append('video_files', videoFile);
    if (documentFile) formDataToSend.append('document_files', documentFile);

    const url = isEditMode 
      ? `${BASE_URL}/api/candidate/digital-logbook/${id}/`
      : `${BASE_URL}/api/candidate/digital-logbook/`;
    
    const method = isEditMode ? 'PUT' : 'POST';

    console.log(`📦 ${isEditMode ? 'Updating' : 'Creating'} logbook entry`);
    console.log(`Method: ${method}, URL: ${url}`);
    console.log(`Total file size: ${(totalFileSize / (1024 * 1024)).toFixed(2)}MB`);

    try {
      let response;
      try {
        response = await fetch(url, {
          method: method,
          headers: { 'Accept': 'application/json' },
          body: formDataToSend,
          credentials: "include"
        });
      } catch (networkErr) {
        console.error('Network/CORS error:', networkErr);
        throw new Error(
          'Request blocked — this is usually caused by the file upload being too large ' +
          'or a network/CORS issue. Please try with smaller files (under 10MB each).'
        );
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            'The server rejected the upload (413 Request Entity Too Large). ' +
            'Please reduce file sizes to under 5MB each and try again.'
          );
        }

        let responseData = null;
        try { responseData = await response.json(); } catch (_) {}

        if (responseData?.data) {
          const serverErrors = {};
          Object.keys(responseData.data).forEach(key => {
            serverErrors[key] = Array.isArray(responseData.data[key])
              ? responseData.data[key][0]
              : responseData.data[key];
          });
          setErrors(serverErrors);
          throw new Error('Please check the form for errors');
        }

        throw new Error(
          responseData?.message || `Failed to ${isEditMode ? 'update' : 'create'} logbook entry (Status: ${response.status})`
        );
      }

      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Updated!' : 'Created!',
        text: `Logbook entry has been ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/candidate-digital');

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} logbook entry.`);
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Update Failed' : 'Creation Failed',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} logbook entry.`,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/candidate-digital');
  };

  // Dropdown options
  const shipTypeOptions = [
    { value: 'cargo', label: 'Cargo Vessel' },
    { value: 'container', label: 'Container Ship' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'bulk_carrier', label: 'Bulk Carrier' },
    { value: 'passenger', label: 'Passenger Ship' },
    { value: 'ferry', label: 'Ferry' },
    { value: 'tugboat', label: 'Tugboat' },
    { value: 'offshore', label: 'Offshore Vessel' },
    { value: 'naval', label: 'Naval Vessel' },
    { value: 'other', label: 'Other' }
  ];

  const workTypeOptions = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'coating', label: 'Coating/Painting' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'testing', label: 'Testing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'installation', label: 'Installation' },
    { value: 'survey', label: 'Survey' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'other', label: 'Other' }
  ];

  const workEnvironmentOptions = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'shipyard', label: 'Shipyard' },
    { value: 'onboard', label: 'Onboard Vessel' },
    { value: 'offshore', label: 'Offshore Platform' },
    { value: 'port', label: 'Port Facility' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'field', label: 'Field Work' },
    { value: 'office', label: 'Office' },
    { value: 'other', label: 'Other' }
  ];

  const weatherConditionsOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'rain', label: 'Rainy' },
    { value: 'wind', label: 'Windy' },
    { value: 'hot', label: 'Hot' },
    { value: 'cold', label: 'Cold' },
    { value: 'humid', label: 'Humid' },
    { value: 'rough_sea', label: 'Rough Sea' },
    { value: 'other', label: 'Other' }
  ];

  const teamRoleOptions = [
    { value: 'leader', label: 'Team Leader' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'member', label: 'Team Member' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'solo', label: 'Solo Work' },
    { value: 'other', label: 'Other' }
  ];

  const evidenceTypeOptions = [
    { value: 'document', label: 'Document Upload' },
    { value: 'link', label: 'External Link' },
    { value: 'project', label: 'Project Work' },
    { value: 'assessment', label: 'Assessment Result' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'photo', label: 'Photographic Evidence' },
    { value: 'video', label: 'Video Evidence' },
    { value: 'other', label: 'Other' }
  ];

  if (loadingCompetencies || fetchingData) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="ale-wrapper">
              <div className="text-center p-5">
                <FaSpinner className="fa-spin fa-3x" />
                <p className="mt-2">{fetchingData ? 'Loading entry...' : 'Loading competencies...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      <CandidateSidebar />
      
      <div className="ta-main-wrapper">
        <Header />
        
        <div className="ta-content-area">
          <div className="ale-wrapper">
            <div className="ale-header">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-outline-secondary back-btn"
                  onClick={handleCancel}
                >
                  <FaArrowLeft /> Back
                </button>
                <div>
                  <h2>{isEditMode ? 'Edit Logbook Entry' : 'Add New Logbook Entry'}</h2>
                  <p>Record your field activities, inspections, and work details</p>
                </div>
              </div>
            </div>

            {error && <div className="ale-error alert alert-danger">{error}</div>}

            <div className="ale-form-container">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter logbook entry title"
                        disabled={loading}
                      />
                      {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Competency *</label>
                      <select
                        className={`form-select ${errors.competency ? 'is-invalid' : ''}`}
                        name="competency"
                        value={formData.competency}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Competency</option>
                        {competencies.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.candidate_name} - {comp.competency_name}
                          </option>
                        ))}
                      </select>
                      {errors.competency && <div className="invalid-feedback">{errors.competency}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Short Description (Optional)</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Brief description (optional)"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Work Description *</label>
                      <textarea
                        className={`form-control ${errors.work_description ? 'is-invalid' : ''}`}
                        name="work_description"
                        value={formData.work_description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Provide detailed description of the work performed"
                        disabled={loading}
                      />
                      {errors.work_description && <div className="invalid-feedback">{errors.work_description}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Work Location *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.work_location ? 'is-invalid' : ''}`}
                        name="work_location"
                        value={formData.work_location}
                        onChange={handleChange}
                        placeholder="e.g., Jurong Shipyard, Singapore"
                        disabled={loading}
                      />
                      {errors.work_location && <div className="invalid-feedback">{errors.work_location}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ship/Asset Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.ship_name ? 'is-invalid' : ''}`}
                        name="ship_name"
                        value={formData.ship_name}
                        onChange={handleChange}
                        placeholder="e.g., FPSO Harmony, Rig Delta"
                        disabled={loading}
                      />
                      {errors.ship_name && <div className="invalid-feedback">{errors.ship_name}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ship Type *</label>
                      <select
                        className={`form-select ${errors.ship_type ? 'is-invalid' : ''}`}
                        name="ship_type"
                        value={formData.ship_type}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Ship Type</option>
                        {shipTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.ship_type && <div className="invalid-feedback">{errors.ship_type}</div>}
                    </div>

                    {formData.ship_type === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Ship Type *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.ship_type_other ? 'is-invalid' : ''}`}
                          name="ship_type_other"
                          value={formData.ship_type_other}
                          onChange={handleChange}
                          placeholder="Please specify ship type"
                          disabled={loading}
                        />
                        {errors.ship_type_other && <div className="invalid-feedback">{errors.ship_type_other}</div>}
                      </div>
                    )}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Work Type *</label>
                      <select
                        className={`form-select ${errors.work_type ? 'is-invalid' : ''}`}
                        name="work_type"
                        value={formData.work_type}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Work Type</option>
                        {workTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.work_type && <div className="invalid-feedback">{errors.work_type}</div>}
                    </div>

                    {formData.work_type === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Work Type *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.work_type_other ? 'is-invalid' : ''}`}
                          name="work_type_other"
                          value={formData.work_type_other}
                          onChange={handleChange}
                          placeholder="Please specify work type"
                          disabled={loading}
                        />
                        {errors.work_type_other && <div className="invalid-feedback">{errors.work_type_other}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Tracking Section */}
                <div className="form-section">
                  <h3 className="section-title">Time & Duration</h3>
                  <div className="row">
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Months</label>
                      <input
                        type="number"
                        className="form-control"
                        name="months"
                        value={formData.months}
                        onChange={handleChange}
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">Weeks</label>
                      <input
                        type="number"
                        className="form-control"
                        name="weeks"
                        value={formData.weeks}
                        onChange={handleChange}
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">Days</label>
                      <input
                        type="number"
                        className="form-control"
                        name="days"
                        value={formData.days}
                        onChange={handleChange}
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">Hours</label>
                      <input
                        type="number"
                        className="form-control"
                        name="hours"
                        value={formData.hours}
                        onChange={handleChange}
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">Minutes</label>
                      <input
                        type="number"
                        className="form-control"
                        name="minutes"
                        value={formData.minutes}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                    </div>
                  </div>
                </div>

                {/* Work Environment Section */}
                <div className="form-section">
                  <h3 className="section-title">Work Environment</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Work Environment *</label>
                      <select
                        className={`form-select ${errors.work_environment ? 'is-invalid' : ''}`}
                        name="work_environment"
                        value={formData.work_environment}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Environment</option>
                        {workEnvironmentOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.work_environment && <div className="invalid-feedback">{errors.work_environment}</div>}
                    </div>

                    {formData.work_environment === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Environment *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.work_environment_other ? 'is-invalid' : ''}`}
                          name="work_environment_other"
                          value={formData.work_environment_other}
                          onChange={handleChange}
                          placeholder="Please specify environment"
                          disabled={loading}
                        />
                        {errors.work_environment_other && <div className="invalid-feedback">{errors.work_environment_other}</div>}
                      </div>
                    )}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Weather Conditions *</label>
                      <select
                        className={`form-select ${errors.weather_conditions ? 'is-invalid' : ''}`}
                        name="weather_conditions"
                        value={formData.weather_conditions}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Weather</option>
                        {weatherConditionsOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.weather_conditions && <div className="invalid-feedback">{errors.weather_conditions}</div>}
                    </div>

                    {formData.weather_conditions === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Weather *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.weather_conditions_other ? 'is-invalid' : ''}`}
                          name="weather_conditions_other"
                          value={formData.weather_conditions_other}
                          onChange={handleChange}
                          placeholder="Please specify weather conditions"
                          disabled={loading}
                        />
                        {errors.weather_conditions_other && <div className="invalid-feedback">{errors.weather_conditions_other}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Section */}
                <div className="form-section">
                  <h3 className="section-title">Team & Equipment</h3>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Team Size *</label>
                      <input
                        type="number"
                        className={`form-control ${errors.team_size ? 'is-invalid' : ''}`}
                        name="team_size"
                        value={formData.team_size}
                        onChange={handleChange}
                        min="1"
                        disabled={loading}
                      />
                      {errors.team_size && <div className="invalid-feedback">{errors.team_size}</div>}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Team Role *</label>
                      <select
                        className={`form-select ${errors.team_role ? 'is-invalid' : ''}`}
                        name="team_role"
                        value={formData.team_role}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select Role</option>
                        {teamRoleOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.team_role && <div className="invalid-feedback">{errors.team_role}</div>}
                    </div>

                    {formData.team_role === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Role *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.team_role_other ? 'is-invalid' : ''}`}
                          name="team_role_other"
                          value={formData.team_role_other}
                          onChange={handleChange}
                          placeholder="Please specify team role"
                          disabled={loading}
                        />
                        {errors.team_role_other && <div className="invalid-feedback">{errors.team_role_other}</div>}
                      </div>
                    )}

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Equipment Used</label>
                      <textarea
                        className="form-control"
                        name="equipment_used"
                        value={formData.equipment_used}
                        onChange={handleChange}
                        rows="2"
                        placeholder="List equipment and tools used"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Safety Precautions</label>
                      <textarea
                        className="form-control"
                        name="safety_precautions"
                        value={formData.safety_precautions}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Describe safety measures taken"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Incidents Section */}
                <div className="form-section">
                  <h3 className="section-title">Incidents & Safety</h3>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="incidents_occurred"
                          name="incidents_occurred"
                          checked={formData.incidents_occurred}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="incidents_occurred">
                          Were there any incidents/accidents?
                        </label>
                      </div>
                    </div>

                    {formData.incidents_occurred && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Incident Description *</label>
                        <textarea
                          className={`form-control ${errors.incident_description ? 'is-invalid' : ''}`}
                          name="incident_description"
                          value={formData.incident_description}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Describe any incidents that occurred"
                          disabled={loading}
                        />
                        {errors.incident_description && <div className="invalid-feedback">{errors.incident_description}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quality Section */}
                <div className="form-section">
                  <h3 className="section-title">Quality & Inspection</h3>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="quality_checks"
                          name="quality_checks"
                          checked={formData.quality_checks}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="quality_checks">
                          Were quality checks performed?
                        </label>
                      </div>
                    </div>

                    {formData.quality_checks && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Quality Standards *</label>
                        <textarea
                          className={`form-control ${errors.quality_standards ? 'is-invalid' : ''}`}
                          name="quality_standards"
                          value={formData.quality_standards}
                          onChange={handleChange}
                          rows="2"
                          placeholder="e.g., ISO 9001, Class Society Requirements"
                          disabled={loading}
                        />
                        {errors.quality_standards && <div className="invalid-feedback">{errors.quality_standards}</div>}
                      </div>
                    )}

                    <div className="col-md-12 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="inspection_required"
                          name="inspection_required"
                          checked={formData.inspection_required}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="inspection_required">
                          Was inspection required?
                        </label>
                      </div>
                    </div>

                    {formData.inspection_required && (
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="inspection_passed"
                            name="inspection_passed"
                            checked={formData.inspection_passed}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor="inspection_passed">
                            Did the work pass inspection?
                          </label>
                        </div>
                        {errors.inspection_passed && <div className="text-danger small">{errors.inspection_passed}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Certifications Section */}
                <div className="form-section">
                  <h3 className="section-title">Certifications & Compliance</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Certificates Required</label>
                      <textarea
                        className="form-control"
                        name="certificates_required"
                        value={formData.certificates_required}
                        onChange={handleChange}
                        rows="2"
                        placeholder="List certificates required"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Certificates Obtained</label>
                      <textarea
                        className="form-control"
                        name="certificates_obtained"
                        value={formData.certificates_obtained}
                        onChange={handleChange}
                        rows="2"
                        placeholder="List certificates obtained"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Compliance Standards</label>
                      <textarea
                        className="form-control"
                        name="compliance_standards"
                        value={formData.compliance_standards}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Compliance standards met"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Evidence Section */}
                <div className="form-section">
                  <h3 className="section-title">Evidence & Documentation</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Evidence Type</label>
                      <select
                        className="form-select"
                        name="evidence_type"
                        value={formData.evidence_type}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        {evidenceTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {formData.evidence_type === 'other' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Specify Evidence Type</label>
                        <input
                          type="text"
                          className="form-control"
                          name="evidence_type_other"
                          value={formData.evidence_type_other}
                          onChange={handleChange}
                          placeholder="Please specify evidence type"
                          disabled={loading}
                        />
                      </div>
                    )}

                    {formData.evidence_type === 'link' && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Evidence Link</label>
                        <input
                          type="url"
                          className="form-control"
                          name="evidence_link"
                          value={formData.evidence_link}
                          onChange={handleChange}
                          placeholder="https://example.com/evidence"
                          disabled={loading}
                        />
                      </div>
                    )}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Evidence Files (Max 10MB)</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          className="file-input"
                          id="evidence-files"
                          onChange={(e) => handleFileChange(e, 'evidence')}
                          disabled={loading}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="evidence-files" className="file-upload-label">
                          <FaCloudUploadAlt /> Choose File
                        </label>
                      </div>
                      {evidenceFile && (
                        <div className="selected-files mt-2">
                          <div className="selected-file">
                            <FaFile /> {evidenceFile.name} ({(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB)
                            <button type="button" onClick={() => handleRemoveFile('evidence')} className="remove-file">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Photo Evidence (Max 10MB)</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          className="file-input"
                          id="photo-files"
                          onChange={(e) => handleFileChange(e, 'photo')}
                          disabled={loading}
                          accept=".jpg,.jpeg,.png"
                        />
                        <label htmlFor="photo-files" className="file-upload-label">
                          <FaCloudUploadAlt /> Choose Photo
                        </label>
                      </div>
                      {photoFile && (
                        <div className="selected-files mt-2">
                          <div className="selected-file">
                            <FaFile /> {photoFile.name} ({(photoFile.size / (1024 * 1024)).toFixed(2)} MB)
                            <button type="button" onClick={() => handleRemoveFile('photo')} className="remove-file">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Video Evidence (Max 10MB)</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          className="file-input"
                          id="video-files"
                          onChange={(e) => handleFileChange(e, 'video')}
                          disabled={loading}
                          accept=".mp4,.mov,.avi"
                        />
                        <label htmlFor="video-files" className="file-upload-label">
                          <FaCloudUploadAlt /> Choose Video
                        </label>
                      </div>
                      {videoFile && (
                        <div className="selected-files mt-2">
                          <div className="selected-file">
                            <FaFile /> {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                            <button type="button" onClick={() => handleRemoveFile('video')} className="remove-file">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Document Files (Max 10MB)</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          className="file-input"
                          id="document-files"
                          onChange={(e) => handleFileChange(e, 'document')}
                          disabled={loading}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <label htmlFor="document-files" className="file-upload-label">
                          <FaCloudUploadAlt /> Choose Document
                        </label>
                      </div>
                      {documentFile && (
                        <div className="selected-files mt-2">
                          <div className="selected-file">
                            <FaFile /> {documentFile.name} ({(documentFile.size / (1024 * 1024)).toFixed(2)} MB)
                            <button type="button" onClick={() => handleRemoveFile('document')} className="remove-file">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personnel Section */}
                <div className="form-section">
                  <h3 className="section-title">Personnel & Review</h3>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Supervisor Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="supervisor_name"
                        value={formData.supervisor_name}
                        onChange={handleChange}
                        placeholder="Supervisor's full name"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Supervisor Contact</label>
                      <input
                        type="text"
                        className="form-control"
                        name="supervisor_contact"
                        value={formData.supervisor_contact}
                        onChange={handleChange}
                        placeholder="Phone or email"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Client Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        placeholder="Client company name"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">Submission Notes</label>
                      <textarea
                        className="form-control"
                        name="submission_notes"
                        value={formData.submission_notes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Any additional notes"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="ale-actions">
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
                    ) : (isEditMode ? 'Update Entry' : 'Create Entry')}
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

export default AddLogbookEntry;