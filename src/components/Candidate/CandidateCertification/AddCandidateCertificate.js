// AddCertificate.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CandidateSidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import "./AddCandidateCertificate.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaSpinner, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

const AddCertificate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params for edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  
  // State for dropdown data
  const [certificationCategories, setCertificationCategories] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  
  // State for multiple certificates
  const [certificates, setCertificates] = useState([
    {
      id: Date.now(), // temporary ID for React keys
      formData: {
        // Issuer fields
        issuer_type: '',
        issuer_type_other: '', // Added field for custom issuer type
        issuer_name: '',
        issuer_email: '',
        issuer_phone: '',
        issuer_website: '',
        issuer_address: '',
        issuer_city: '',
        issuer_state: '',
        issuer_country: '',
        issuer_postal_code: '',
        issuer_description: '',
        issuer_accreditation_number: '',
        
        // Certificate fields
        issue_date: '',
        expiry_date: '',
        certificate_number: '',
        issuing_authority: '',
        document: null,
        is_approved: true,
        approved_at: new Date().toISOString(),
        approval_remarks: '',
        status: 'pending',
        candidate: null,
        certification: '',
        competency: '',
        approved_by_mentor: null
      },
      selectedFile: null,
      existingDocument: null,
      errors: {}
    }
  ]);
  
  // Issuer type options
  const issuerTypeOptions = [
    { value: 'Educational Institution', label: 'Educational Institution' },
    { value: 'Client Company', label: 'Client Company' },
    { value: 'A2Z Organization', label: 'A2Z Organization' },
    { value: 'Training Center', label: 'Training Center' },
    { value: 'Government Body', label: 'Government Body' },
    { value: 'Professional Body', label: 'Professional Body' },
    { value: 'Other', label: 'Other' }
  ];
  
  // Get candidate data from localStorage
  const getCandidateData = () => {
    const candidateData = localStorage.getItem('candidate_user');
    if (candidateData) {
      try {
        return JSON.parse(candidateData);
      } catch (e) {
        console.error('Error parsing candidate data:', e);
        return null;
      }
    }
    return null;
  };

  const candidateData = getCandidateData();
  const candidateId = candidateData?.user_id || null;

  // Update candidate ID in all certificates
  useEffect(() => {
    if (candidateId) {
      setCertificates(prev => prev.map(cert => ({
        ...cert,
        formData: {
          ...cert.formData,
          candidate: candidateId
        }
      })));
    }
  }, [candidateId]);

  // Fetch certification categories and competencies on component mount
  useEffect(() => {
    fetchCertificationCategories();
    fetchCompetencies();
  }, []);

  // Fetch certification data for edit mode
  const fetchCertificationData = async (certificateId) => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/certifications/${certificateId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch certification data');
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const certificateData = result.data;
        
        // Format date for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        console.log('Fetched certificate data:', certificateData); // Debug log
        
        setCertificates([{
          id: Date.now(),
          formData: {
            issuer_type: certificateData.issuer_type || '',
            issuer_type_other: certificateData.issuer_type_other || '', // Load other issuer type
            issuer_name: certificateData.issuer_name || '',
            issuer_email: certificateData.issuer_email || '',
            issuer_phone: certificateData.issuer_phone || '',
            issuer_website: certificateData.issuer_website || '',
            issuer_address: certificateData.issuer_address || '',
            issuer_city: certificateData.issuer_city || '',
            issuer_state: certificateData.issuer_state || '',
            issuer_country: certificateData.issuer_country || '',
            issuer_postal_code: certificateData.issuer_postal_code || '',
            issuer_description: certificateData.issuer_description || '',
            issuer_accreditation_number: certificateData.issuer_accreditation_number || '',
            issue_date: formatDateForInput(certificateData.issue_date),
            expiry_date: formatDateForInput(certificateData.expiry_date),
            certificate_number: certificateData.certificate_number || '',
            issuing_authority: certificateData.issuing_authority || '',
            document: certificateData.document || null,
            is_approved: certificateData.is_approved !== undefined ? certificateData.is_approved : true,
            approved_at: certificateData.approved_at || new Date().toISOString(),
            approval_remarks: certificateData.approval_remarks || '',
            status: certificateData.status || 'pending',
            candidate: candidateId,
            certification: certificateData.certification || '',
            competency: certificateData.competency || '',
            approved_by_mentor: certificateData.approved_by_mentor || null
          },
          selectedFile: null,
          existingDocument: certificateData.document,
          errors: {}
        }]);
      }
    } catch (err) {
      console.error('Error fetching certification data:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text: err.message || 'Could not load certification data',
        showConfirmButton: true
      }).then(() => {
        navigate('/candidate-certificate');
      });
    } finally {
      setFetchLoading(false);
    }
  };

  // After dropdown data is loaded, fetch edit data if in edit mode
  useEffect(() => {
    if (isEditMode && id && certificationCategories.length > 0 && competencies.length > 0) {
      fetchCertificationData(id);
    }
  }, [isEditMode, id, certificationCategories, competencies]);

  // Fetch certification categories
  const fetchCertificationCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/certification-categories/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCertificationCategories(result.data);
        console.log('✅ Certification categories loaded:', result.data);
      }
    } catch (err) {
      console.error('Error fetching certification categories:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Certifications',
        text: err.message || 'An error occurred while loading certifications',
        showConfirmButton: true
      });
    }
  };

  // Fetch competencies
  const fetchCompetencies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/competencies/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCompetencies(result.data);
        console.log('✅ Competencies loaded:', result.data);
      }
    } catch (err) {
      console.error('Error fetching competencies:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Competencies',
        text: err.message || 'An error occurred while loading competencies',
        showConfirmButton: true
      });
    }
  };

  // Add new certificate entry
  const addCertificateEntry = () => {
    setCertificates(prev => [...prev, {
      id: Date.now(),
      formData: {
        issuer_type: '',
        issuer_type_other: '',
        issuer_name: '',
        issuer_email: '',
        issuer_phone: '',
        issuer_website: '',
        issuer_address: '',
        issuer_city: '',
        issuer_state: '',
        issuer_country: '',
        issuer_postal_code: '',
        issuer_description: '',
        issuer_accreditation_number: '',
        issue_date: '',
        expiry_date: '',
        certificate_number: '',
        issuing_authority: '',
        document: null,
        is_approved: true,
        approved_at: new Date().toISOString(),
        approval_remarks: '',
        status: 'pending',
        candidate: candidateId,
        certification: '',
        competency: '',
        approved_by_mentor: null
      },
      selectedFile: null,
      existingDocument: null,
      errors: {}
    }]);
  };

  // Remove certificate entry
  const removeCertificateEntry = (index) => {
    if (certificates.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'You must have at least one certificate entry',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    Swal.fire({
      title: 'Remove Certificate?',
      text: 'Are you sure you want to remove this certificate entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCertificates(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  const handleChange = (index, field, value) => {
    setCertificates(prev => prev.map((cert, i) => {
      if (i === index) {
        return {
          ...cert,
          formData: {
            ...cert.formData,
            [field]: value
          },
          errors: {
            ...cert.errors,
            [field]: ''
          }
        };
      }
      return cert;
    }));
  };

  const handleFileChange = (index, file) => {
    if (file) {
      setCertificates(prev => prev.map((cert, i) => {
        if (i === index) {
          return {
            ...cert,
            selectedFile: file,
            errors: {
              ...cert.errors,
              document: ''
            }
          };
        }
        return cert;
      }));
    }
  };

  const handleCertificationChange = (index, certificationId) => {
    setCertificates(prev => prev.map((cert, i) => {
      if (i === index) {
        return {
          ...cert,
          formData: {
            ...cert.formData,
            certification: parseInt(certificationId)
          }
        };
      }
      return cert;
    }));
  };

  const handleCompetencyChange = (index, competencyId) => {
    setCertificates(prev => prev.map((cert, i) => {
      if (i === index) {
        return {
          ...cert,
          formData: {
            ...cert.formData,
            competency: parseInt(competencyId)
          }
        };
      }
      return cert;
    }));
  };

  const validateSingleCertificate = (cert, index) => {
    const newErrors = {};
    const formData = cert.formData;

    // Issuer validation
    if (!formData.issuer_type) {
      newErrors.issuer_type = "Issuer type is required";
    }
    
    // Validate issuer_type_other if issuer_type is "Other"
    if (formData.issuer_type === 'Other' && !formData.issuer_type_other?.trim()) {
      newErrors.issuer_type_other = "Please specify the issuer type";
    }
    
    if (!formData.issuer_name?.trim()) {
      newErrors.issuer_name = "Issuer name is required";
    }
    if (formData.issuer_email && !/^\S+@\S+\.\S+$/.test(formData.issuer_email)) {
      newErrors.issuer_email = "Please enter a valid email address";
    }
    if (formData.issuer_website && !/^https?:\/\/.*/.test(formData.issuer_website)) {
      newErrors.issuer_website = "Please enter a valid URL starting with http:// or https://";
    }

    // Certificate validation
    if (!formData.issue_date) {
      newErrors.issue_date = "Issue date is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date = "Expiry date is required";
    }

    if (formData.issue_date && formData.expiry_date) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(formData.expiry_date);
      
      if (expiryDate <= issueDate) {
        newErrors.expiry_date = "Expiry date must be after issue date";
      }
    }

    if (!formData.certificate_number?.trim()) {
      newErrors.certificate_number = "Certificate number is required";
    }

    if (!formData.issuing_authority?.trim()) {
      newErrors.issuing_authority = "Issuing authority is required";
    }

    if (!formData.certification) {
      newErrors.certification = "Please select a certification";
    }

    if (!formData.competency) {
      newErrors.competency = "Please select a competency";
    }

    // Only require document for new certificates, not for edit mode
    if (!isEditMode && !cert.selectedFile && !cert.existingDocument) {
      newErrors.document = "Please select a document to upload";
    }

    if (!formData.candidate) {
      newErrors.candidate = "Candidate information not found";
    }

    return newErrors;
  };

  const validateAllCertificates = () => {
    let hasErrors = false;
    const updatedCertificates = [...certificates];
    const globalErrList = [];

    updatedCertificates.forEach((cert, index) => {
      const certErrors = validateSingleCertificate(cert, index);
      updatedCertificates[index].errors = certErrors;
      if (Object.keys(certErrors).length > 0) {
        hasErrors = true;
        globalErrList.push(`Certificate ${index + 1}: ${Object.values(certErrors).join(', ')}`);
      }
    });

    setCertificates(updatedCertificates);
    setGlobalErrors(globalErrList);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllCertificates()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        html: 'Please check all required fields and fix the errors below:<br/><br/>' + 
              globalErrors.map(err => `• ${err}`).join('<br/>'),
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${BASE_URL}/api/candidate/certifications/`;

      if (isEditMode) {
        // EDIT MODE — PUT with multipart if file changed, else JSON
        const certificate = certificates[0];

        let response;
        if (certificate.selectedFile) {
          // Send as multipart/form-data so the file is included
          const formData = new FormData();
          const fields = {
            issuer_type: certificate.formData.issuer_type,
            issuer_type_other: certificate.formData.issuer_type === 'Other' ? certificate.formData.issuer_type_other : '',
            issuer_name: certificate.formData.issuer_name,
            issuer_email: certificate.formData.issuer_email || '',
            issuer_phone: certificate.formData.issuer_phone || '',
            issuer_website: certificate.formData.issuer_website || '',
            issuer_address: certificate.formData.issuer_address || '',
            issuer_city: certificate.formData.issuer_city || '',
            issuer_state: certificate.formData.issuer_state || '',
            issuer_country: certificate.formData.issuer_country || '',
            issuer_postal_code: certificate.formData.issuer_postal_code || '',
            issuer_description: certificate.formData.issuer_description || '',
            issuer_accreditation_number: certificate.formData.issuer_accreditation_number || '',
            issue_date: certificate.formData.issue_date,
            expiry_date: certificate.formData.expiry_date,
            certificate_number: certificate.formData.certificate_number,
            issuing_authority: certificate.formData.issuing_authority,
            is_approved: certificate.formData.is_approved,
            approved_at: certificate.formData.approved_at,
            approval_remarks: certificate.formData.approval_remarks || '',
            status: certificate.formData.status,
            candidate: parseInt(certificate.formData.candidate),
            certification: parseInt(certificate.formData.certification),
            competency: parseInt(certificate.formData.competency),
          };

          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
          });

          if (certificate.formData.approved_by_mentor) {
            formData.append('approved_by_mentor', certificate.formData.approved_by_mentor);
          }

          formData.append('document', certificate.selectedFile);

          response = await fetch(`${BASE_URL}/api/candidate/certifications/${id}/`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          // No new file — plain JSON PUT
          const requestBody = {
            issuer_type: certificate.formData.issuer_type,
            issuer_type_other: certificate.formData.issuer_type === 'Other' ? certificate.formData.issuer_type_other : '',
            issuer_name: certificate.formData.issuer_name,
            issuer_email: certificate.formData.issuer_email || '',
            issuer_phone: certificate.formData.issuer_phone || '',
            issuer_website: certificate.formData.issuer_website || '',
            issuer_address: certificate.formData.issuer_address || '',
            issuer_city: certificate.formData.issuer_city || '',
            issuer_state: certificate.formData.issuer_state || '',
            issuer_country: certificate.formData.issuer_country || '',
            issuer_postal_code: certificate.formData.issuer_postal_code || '',
            issuer_description: certificate.formData.issuer_description || '',
            issuer_accreditation_number: certificate.formData.issuer_accreditation_number || '',
            issue_date: certificate.formData.issue_date,
            expiry_date: certificate.formData.expiry_date,
            certificate_number: certificate.formData.certificate_number,
            issuing_authority: certificate.formData.issuing_authority,
            is_approved: certificate.formData.is_approved,
            approved_at: certificate.formData.approved_at,
            approval_remarks: certificate.formData.approval_remarks || '',
            status: certificate.formData.status,
            candidate: parseInt(certificate.formData.candidate),
            certification: parseInt(certificate.formData.certification),
            competency: parseInt(certificate.formData.competency),
            approved_by_mentor: certificate.formData.approved_by_mentor || null,
          };

          response = await fetch(`${BASE_URL}/api/candidate/certifications/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
        }

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to update certification');
        }

      } else {
        // ADD MODE — one request per certificate as flat multipart/form-data
        const results = [];
        const failures = [];

        for (let index = 0; index < certificates.length; index++) {
          const cert = certificates[index];
          const formData = new FormData();

          // Append all flat fields directly
          formData.append('candidate', parseInt(cert.formData.candidate));
          formData.append('certification', parseInt(cert.formData.certification));
          formData.append('competency', parseInt(cert.formData.competency));
          formData.append('issuer_type', cert.formData.issuer_type);
          if (cert.formData.issuer_type === 'Other') {
            formData.append('issuer_type_other', cert.formData.issuer_type_other || '');
          }
          formData.append('issuer_name', cert.formData.issuer_name);
          formData.append('issuer_email', cert.formData.issuer_email || '');
          formData.append('issuer_phone', cert.formData.issuer_phone || '');
          formData.append('issuer_website', cert.formData.issuer_website || '');
          formData.append('issuer_address', cert.formData.issuer_address || '');
          formData.append('issuer_city', cert.formData.issuer_city || '');
          formData.append('issuer_state', cert.formData.issuer_state || '');
          formData.append('issuer_country', cert.formData.issuer_country || '');
          formData.append('issuer_postal_code', cert.formData.issuer_postal_code || '');
          formData.append('issuer_description', cert.formData.issuer_description || '');
          formData.append('issuer_accreditation_number', cert.formData.issuer_accreditation_number || '');
          formData.append('issue_date', cert.formData.issue_date);
          formData.append('expiry_date', cert.formData.expiry_date);
          formData.append('certificate_number', cert.formData.certificate_number);
          formData.append('issuing_authority', cert.formData.issuing_authority);
          formData.append('is_approved', cert.formData.is_approved);
          formData.append('approved_at', cert.formData.approved_at);
          formData.append('approval_remarks', cert.formData.approval_remarks || '');
          formData.append('status', cert.formData.status);

          if (cert.selectedFile) {
            formData.append('document', cert.selectedFile);
          }

          try {
            const response = await fetch(url, {
              method: 'POST',
              body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
              failures.push({ index: index + 1, error: responseData.message || 'Failed' });
            } else {
              results.push(responseData);
            }
          } catch (err) {
            failures.push({ index: index + 1, error: err.message });
          }
        }

        if (failures.length > 0) {
          const errorMessages = failures.map(f => `Certificate ${f.index}: ${f.error}`).join('\n');
          throw new Error(`Some certificates failed:\n${errorMessages}`);
        }
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `${certificates.length} certification(s) ${isEditMode ? 'updated' : 'added'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/candidate-certificate');

    } catch (err) {
      setError(err.message || 'Failed. Please try again.');
      Swal.fire({
        icon: 'error',
        title: `${isEditMode ? 'Update' : 'Submission'} Failed`,
        text: err.message || 'Please try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/candidate-certificate');
  };

  if (fetchLoading) {
    return (
      <div className="ccert-layout-wrapper">
        <CandidateSidebar />
        <div className="ccert-main-wrapper">
          <Header />
          <div className="ccert-content-area">
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading certification data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ccert-layout-wrapper">
      <CandidateSidebar />
      
      <div className="ccert-main-wrapper">
        <Header />
        
        <div className="ccert-content-area">
          <div className="cert-add-wrapper">
            {/* Header */}
            <div className="cert-add-header">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary back-btn"
                    onClick={handleCancel}
                    aria-label="Go back"
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <div>
                    <h2>{isEditMode ? 'Edit Certification' : 'Add Certifications'}</h2>
                    <p>
                      {isEditMode 
                        ? 'Update your professional certification details' 
                        : 'Upload your professional certifications and fill in the details below'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="cert-add-error alert alert-danger">{error}</div>}

            {/* Form */}
            <div className="cert-add-form-container">
              <form onSubmit={handleSubmit}>
                {certificates.map((cert, index) => (
                  <div key={cert.id} className="certificate-entry mb-5 p-4 border rounded position-relative">
                    {certificates.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={() => removeCertificateEntry(index)}
                        style={{ zIndex: 10 }}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                    
                    <h5 className="mb-3">Certificate #{index + 1}</h5>
                    
                    {/* Issuer Information Section */}
                    <div className="form-section">
                      <h4 className="section-title">Issuer Information</h4>
                      <p className="section-subtitle">Details about the organization that issued this certification</p>
                      
                      <div className="row">
                        {/* Issuer Type */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuer Type *</label>
                          <select
                            className={`form-control ${cert.errors.issuer_type ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_type || ''}
                            onChange={(e) => handleChange(index, 'issuer_type', e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select Issuer Type</option>
                            {issuerTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {cert.errors.issuer_type && (
                            <div className="invalid-feedback">{cert.errors.issuer_type}</div>
                          )}
                        </div>

                        {/* Conditional Other Issuer Type Input */}
                        {cert.formData.issuer_type === 'Other' && (
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Please Specify Issuer Type *</label>
                            <input
                              type="text"
                              className={`form-control ${cert.errors.issuer_type_other ? 'is-invalid' : ''}`}
                              value={cert.formData.issuer_type_other || ''}
                              onChange={(e) => handleChange(index, 'issuer_type_other', e.target.value)}
                              placeholder="Enter custom issuer type (e.g., Non-profit Organization)"
                              disabled={loading}
                            />
                            {cert.errors.issuer_type_other && (
                              <div className="invalid-feedback">{cert.errors.issuer_type_other}</div>
                            )}
                            <small className="text-muted">Please specify the type of issuing organization</small>
                          </div>
                        )}

                        {/* Issuer Name */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuer Name *</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_name ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_name || ''}
                            onChange={(e) => handleChange(index, 'issuer_name', e.target.value)}
                            placeholder="Enter organization name"
                            disabled={loading}
                          />
                          {cert.errors.issuer_name && (
                            <div className="invalid-feedback">{cert.errors.issuer_name}</div>
                          )}
                        </div>

                        {/* Issuer Email */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuer Email</label>
                          <input
                            type="email"
                            className={`form-control ${cert.errors.issuer_email ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_email || ''}
                            onChange={(e) => handleChange(index, 'issuer_email', e.target.value)}
                            placeholder="contact@organization.com"
                            disabled={loading}
                          />
                          {cert.errors.issuer_email && (
                            <div className="invalid-feedback">{cert.errors.issuer_email}</div>
                          )}
                        </div>

                        {/* Issuer Phone */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuer Phone</label>
                          <input
                            type="tel"
                            className={`form-control ${cert.errors.issuer_phone ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_phone || ''}
                            onChange={(e) => handleChange(index, 'issuer_phone', e.target.value)}
                            placeholder="+1 (234) 567-8900"
                            disabled={loading}
                          />
                          {cert.errors.issuer_phone && (
                            <div className="invalid-feedback">{cert.errors.issuer_phone}</div>
                          )}
                        </div>

                        {/* Issuer Website */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuer Website</label>
                          <input
                            type="url"
                            className={`form-control ${cert.errors.issuer_website ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_website || ''}
                            onChange={(e) => handleChange(index, 'issuer_website', e.target.value)}
                            placeholder="https://www.organization.com"
                            disabled={loading}
                          />
                          {cert.errors.issuer_website && (
                            <div className="invalid-feedback">{cert.errors.issuer_website}</div>
                          )}
                        </div>

                        {/* Issuer Accreditation Number */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Accreditation Number</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_accreditation_number ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_accreditation_number || ''}
                            onChange={(e) => handleChange(index, 'issuer_accreditation_number', e.target.value)}
                            placeholder="Enter accreditation number (if applicable)"
                            disabled={loading}
                          />
                          {cert.errors.issuer_accreditation_number && (
                            <div className="invalid-feedback">{cert.errors.issuer_accreditation_number}</div>
                          )}
                        </div>

                        {/* Issuer Address */}
                        <div className="col-12 mb-3">
                          <label className="form-label">Street Address</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_address ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_address || ''}
                            onChange={(e) => handleChange(index, 'issuer_address', e.target.value)}
                            placeholder="Street address"
                            disabled={loading}
                          />
                          {cert.errors.issuer_address && (
                            <div className="invalid-feedback">{cert.errors.issuer_address}</div>
                          )}
                        </div>

                        {/* Issuer City */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_city ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_city || ''}
                            onChange={(e) => handleChange(index, 'issuer_city', e.target.value)}
                            placeholder="City"
                            disabled={loading}
                          />
                          {cert.errors.issuer_city && (
                            <div className="invalid-feedback">{cert.errors.issuer_city}</div>
                          )}
                        </div>

                        {/* Issuer State */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">State/Province</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_state ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_state || ''}
                            onChange={(e) => handleChange(index, 'issuer_state', e.target.value)}
                            placeholder="State/Province"
                            disabled={loading}
                          />
                          {cert.errors.issuer_state && (
                            <div className="invalid-feedback">{cert.errors.issuer_state}</div>
                          )}
                        </div>

                        {/* Issuer Country */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_country ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_country || ''}
                            onChange={(e) => handleChange(index, 'issuer_country', e.target.value)}
                            placeholder="Country"
                            disabled={loading}
                          />
                          {cert.errors.issuer_country && (
                            <div className="invalid-feedback">{cert.errors.issuer_country}</div>
                          )}
                        </div>

                        {/* Issuer Postal Code */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Postal Code</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuer_postal_code ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_postal_code || ''}
                            onChange={(e) => handleChange(index, 'issuer_postal_code', e.target.value)}
                            placeholder="Postal/ZIP code"
                            disabled={loading}
                          />
                          {cert.errors.issuer_postal_code && (
                            <div className="invalid-feedback">{cert.errors.issuer_postal_code}</div>
                          )}
                        </div>

                        {/* Issuer Description */}
                        <div className="col-12 mb-3">
                          <label className="form-label">Issuer Description</label>
                          <textarea
                            className={`form-control ${cert.errors.issuer_description ? 'is-invalid' : ''}`}
                            value={cert.formData.issuer_description || ''}
                            onChange={(e) => handleChange(index, 'issuer_description', e.target.value)}
                            rows="3"
                            placeholder="Brief description of the issuing organization"
                            disabled={loading}
                          />
                          {cert.errors.issuer_description && (
                            <div className="invalid-feedback">{cert.errors.issuer_description}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Information Section */}
                    <div className="form-section mt-4">
                      <h4 className="section-title">Certificate Information</h4>
                      <p className="section-subtitle">Details about the certification being submitted</p>
                      
                      <div className="row">
                        {/* Certification Dropdown */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Certification *</label>
                          <select
                            className={`form-control ${cert.errors.certification ? 'is-invalid' : ''}`}
                            value={cert.formData.certification || ''}
                            onChange={(e) => handleCertificationChange(index, e.target.value)}
                            disabled={loading || fetchLoading}
                          >
                            <option value="">Select Certification</option>
                            {certificationCategories.map(certCat => (
                              <option key={certCat.id} value={certCat.id}>
                                {certCat.name}
                              </option>
                            ))}
                          </select>
                          {cert.errors.certification && (
                            <div className="invalid-feedback">{cert.errors.certification}</div>
                          )}
                        </div>

                        {/* Competency Dropdown */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Competency *</label>
                          <select
                            className={`form-control ${cert.errors.competency ? 'is-invalid' : ''}`}
                            value={cert.formData.competency || ''}
                            onChange={(e) => handleCompetencyChange(index, e.target.value)}
                            disabled={loading || fetchLoading}
                          >
                            <option value="">Select Competency</option>
                            {competencies.map(comp => (
                              <option key={comp.id} value={comp.id}>
                                {comp.competency_name}
                              </option>
                            ))}
                          </select>
                          {cert.errors.competency && (
                            <div className="invalid-feedback">{cert.errors.competency}</div>
                          )}
                        </div>

                        {/* Certificate Number */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Certificate Number *</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.certificate_number ? 'is-invalid' : ''}`}
                            value={cert.formData.certificate_number || ''}
                            onChange={(e) => handleChange(index, 'certificate_number', e.target.value)}
                            placeholder="Enter certificate number"
                            disabled={loading}
                          />
                          {cert.errors.certificate_number && (
                            <div className="invalid-feedback">{cert.errors.certificate_number}</div>
                          )}
                        </div>

                        {/* Issuing Authority */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issuing Authority *</label>
                          <input
                            type="text"
                            className={`form-control ${cert.errors.issuing_authority ? 'is-invalid' : ''}`}
                            value={cert.formData.issuing_authority || ''}
                            onChange={(e) => handleChange(index, 'issuing_authority', e.target.value)}
                            placeholder="Enter issuing authority (e.g., API, NACE, TWI, etc.)"
                            disabled={loading}
                          />
                          {cert.errors.issuing_authority && (
                            <div className="invalid-feedback">{cert.errors.issuing_authority}</div>
                          )}
                        </div>

                        {/* Issue Date */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Issue Date *</label>
                          <input
                            type="date"
                            className={`form-control ${cert.errors.issue_date ? 'is-invalid' : ''}`}
                            value={cert.formData.issue_date || ''}
                            onChange={(e) => handleChange(index, 'issue_date', e.target.value)}
                            disabled={loading}
                          />
                          {cert.errors.issue_date && (
                            <div className="invalid-feedback">{cert.errors.issue_date}</div>
                          )}
                        </div>

                        {/* Expiry Date */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Expiry Date *</label>
                          <input
                            type="date"
                            className={`form-control ${cert.errors.expiry_date ? 'is-invalid' : ''}`}
                            value={cert.formData.expiry_date || ''}
                            onChange={(e) => handleChange(index, 'expiry_date', e.target.value)}
                            disabled={loading}
                          />
                          {cert.errors.expiry_date && (
                            <div className="invalid-feedback">{cert.errors.expiry_date}</div>
                          )}
                        </div>

                        {/* Document Upload */}
                        <div className="col-12 mb-3">
                          <label className="form-label">{isEditMode ? 'Update Document (Optional)' : 'Certificate Document *'}</label>
                          <input
                            type="file"
                            className={`form-control ${cert.errors.document ? 'is-invalid' : ''}`}
                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            disabled={loading}
                          />
                          <small className="text-muted d-block mt-1">
                            Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)
                          </small>
                          {cert.errors.document && (
                            <div className="invalid-feedback">{cert.errors.document}</div>
                          )}
                          {cert.existingDocument && !cert.selectedFile && (
                            <div className="text-success mt-1">
                              <small>✓ Current document: <a href={cert.existingDocument} target="_blank" rel="noopener noreferrer">View uploaded file</a></small>
                            </div>
                          )}
                          {cert.selectedFile && (
                            <div className="text-info mt-1">
                              <small>New file selected: {cert.selectedFile.name}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Button - Only show in add mode */}
                {!isEditMode && (
                  <div className="text-center mb-4">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={addCertificateEntry}
                      disabled={loading}
                    >
                      <FaPlus /> Add Another Certificate
                    </button>
                  </div>
                )}

                {/* Form Actions */}
                <div className="cert-add-actions">
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
                    {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Certification' : `Submit ${certificates.length} Certificate(s)`)}
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

export default AddCertificate;