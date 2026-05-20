import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CandidateSidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import "./AddCandidateCompliance.css";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';

const AddCertificate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params for edit mode
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  
  // State for dropdown data
  const [complianceCategories, setComplianceCategories] = useState([]);
  const [complianceRules, setComplianceRules] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [filteredRules, setFilteredRules] = useState([]);
  
  // State for selected file
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
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

  const [formData, setFormData] = useState({
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
    issuing_authority: '',
    is_approved: true,
    approved_at: new Date().toISOString(),
    approval_remarks: '',
    status: 'pending',
    candidate: candidateId,
    compliance_rule: '',
    approved_by_mentor: null
  });

  // Fetch compliance categories on component mount
  useEffect(() => {
    fetchComplianceCategories();
    fetchComplianceRules();
  }, []);

  // After complianceRules are loaded, fetch edit data if in edit mode
  useEffect(() => {
    if (isEditMode && id && complianceRules.length > 0 && !initialDataLoaded) {
      fetchComplianceCertificateData(id);
    }
  }, [isEditMode, id, complianceRules, initialDataLoaded]);

  // Filter rules when category changes
  useEffect(() => {
    if (selectedCategory && complianceRules.length > 0) {
      const rules = complianceRules.filter(
        rule => rule.complience_category?.category_name === selectedCategory
      );
      setFilteredRules(rules);
    } else {
      setFilteredRules([]);
    }
  }, [selectedCategory, complianceRules]);

  // Fetch existing certificate data for edit mode
  const fetchComplianceCertificateData = async (certificateId) => {
    setFetchLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/compliance-certificates/${certificateId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificate data');
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        const certificateData = result.data;
        
        console.log('Certificate data loaded:', certificateData);
        console.log('Compliance rules available:', complianceRules);
        
        // Find the compliance rule to get its category
        const rule = complianceRules.find(r => r.id === certificateData.compliance_rule);
        
        if (rule) {
          console.log('Found matching rule:', rule);
          console.log('Rule category:', rule.complience_category);
          
          // Set the category based on the rule's category name
          const categoryName = rule.complience_category?.category_name;
          if (categoryName) {
            setSelectedCategory(categoryName);
          }
          
          // Set the selected rule ID
          setSelectedRule(certificateData.compliance_rule.toString());
        } else {
          console.warn('Rule not found for ID:', certificateData.compliance_rule);
        }
        
        setFormData({
          issue_date: certificateData.issue_date?.split('T')[0] || '',
          expiry_date: certificateData.expiry_date?.split('T')[0] || '',
          certificate_number: certificateData.certificate_number || '',
          issuing_authority: certificateData.issuing_authority || '',
          is_approved: certificateData.is_approved !== undefined ? certificateData.is_approved : true,
          approved_at: certificateData.approved_at || new Date().toISOString(),
          approval_remarks: certificateData.approval_remarks || '',
          status: certificateData.status || 'pending',
          candidate: candidateId,
          compliance_rule: certificateData.compliance_rule || '',
          approved_by_mentor: certificateData.approved_by_mentor || null
        });
        
        // Store existing document info
        if (certificateData.document) {
          setExistingDocument(certificateData.document);
        }
        
        setInitialDataLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching certificate data:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Data',
        text: err.message || 'Could not load certificate data',
        showConfirmButton: true
      }).then(() => {
        navigate('/candidate-compliance');
      });
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch compliance categories
  const fetchComplianceCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setComplianceCategories(result.data);
        console.log('✅ Compliance categories loaded:', result.data);
      }
    } catch (err) {
      console.error('Error fetching compliance categories:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Categories',
        text: err.message || 'An error occurred while loading categories',
        showConfirmButton: true
      });
    }
  };

  // Fetch compliance rules
  const fetchComplianceRules = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setComplianceRules(result.data);
        console.log('✅ Compliance rules loaded:', result.data);
      }
    } catch (err) {
      console.error('Error fetching compliance rules:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Rules',
        text: err.message || 'An error occurred while loading rules',
        showConfirmButton: true
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Clear document error if any
      if (errors.document) {
        setErrors(prev => ({ ...prev, document: '' }));
      }
    }
  };

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setSelectedCategory(categoryName);
    // Reset selected rule when category changes
    setSelectedRule('');
    setFormData(prev => ({ ...prev, compliance_rule: '' }));
  };

  const handleRuleChange = (e) => {
    const ruleId = e.target.value;
    setSelectedRule(ruleId);
    setFormData(prev => ({ ...prev, compliance_rule: parseInt(ruleId) }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.issue_date) {
      newErrors.issue_date = "Issue date is required";
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date = "Expiry date is required";
    }

    // Validate that expiry date is after issue date
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

    if (!selectedCategory) {
      newErrors.category = "Please select a compliance category";
    }

    if (!formData.compliance_rule) {
      newErrors.compliance_rule = "Please select a compliance rule";
    }

    // Only require document for new entries, not for edits
    if (!isEditMode && !selectedFile) {
      newErrors.document = "Please select a document to upload";
    }

    if (!candidateId) {
      newErrors.candidate = "Candidate information not found";
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

    try {
      let response;
      let url;
      let method;
      let requestBody;

      if (isEditMode) {
        // EDIT MODE - Use PUT request with JSON
        url = `${BASE_URL}/api/candidate/compliance-certificates/${id}/`;
        method = 'PUT';
        
        requestBody = {
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          certificate_number: formData.certificate_number,
          issuing_authority: formData.issuing_authority,
          is_approved: formData.is_approved,
          approved_at: formData.approved_at,
          approval_remarks: formData.approval_remarks,
          status: formData.status,
          candidate: parseInt(candidateId),
          compliance_rule: parseInt(formData.compliance_rule),
        };

        if (formData.approved_by_mentor !== null && formData.approved_by_mentor !== '') {
          requestBody.approved_by_mentor = formData.approved_by_mentor;
        }

        console.log('Updating with data:', requestBody);

        response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        // ADD MODE - Use POST request with FormData
        url = `${BASE_URL}/api/candidate/compliance-certificates/`;
        method = 'POST';
        
        const formDataToSend = new FormData();
        
        formDataToSend.append('issue_date', formData.issue_date);
        formDataToSend.append('expiry_date', formData.expiry_date);
        formDataToSend.append('certificate_number', formData.certificate_number);
        formDataToSend.append('issuing_authority', formData.issuing_authority);
        formDataToSend.append('is_approved', formData.is_approved);
        formDataToSend.append('approved_at', formData.approved_at);
        formDataToSend.append('approval_remarks', formData.approval_remarks || '');
        formDataToSend.append('status', formData.status);
        formDataToSend.append('candidate', parseInt(candidateId));
        formDataToSend.append('compliance_rule', parseInt(formData.compliance_rule));
        
        if (formData.approved_by_mentor !== null && formData.approved_by_mentor !== '') {
          formDataToSend.append('approved_by_mentor', formData.approved_by_mentor);
        }
        
        if (selectedFile) {
          formDataToSend.append('document', selectedFile);
        }

        console.log('Submitting FormData:');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ' + (pair[0] === 'document' ? pair[1].name : pair[1]));
        }
        
        requestBody = formDataToSend;
        
        response = await fetch(url, {
          method: method,
          body: requestBody,
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (responseData.data) {
          const backendErrors = responseData.data;
          const newErrors = {};
          
          // Map backend errors to form fields
          if (backendErrors.document) newErrors.document = backendErrors.document[0];
          if (backendErrors.certificate_number) newErrors.certificate_number = backendErrors.certificate_number[0];
          if (backendErrors.issuing_authority) newErrors.issuing_authority = backendErrors.issuing_authority[0];
          if (backendErrors.issue_date) newErrors.issue_date = backendErrors.issue_date[0];
          if (backendErrors.expiry_date) newErrors.expiry_date = backendErrors.expiry_date[0];
          if (backendErrors.compliance_rule) newErrors.compliance_rule = backendErrors.compliance_rule[0];
          if (backendErrors.candidate) newErrors.candidate = backendErrors.candidate[0];
          
          setErrors(newErrors);
          throw new Error(responseData.message || 'Please fix the validation errors');
        }
        throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'add'} compliance certificate`);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Compliance certificate has been ${isEditMode ? 'updated' : 'added'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/candidate-compliance');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} compliance certificate. Please try again.`);
      
      Swal.fire({
        icon: 'error',
        title: `${isEditMode ? 'Update' : 'Submission'} Failed`,
        text: err.message || `Failed to ${isEditMode ? 'update' : 'add'} compliance certificate. Please try again.`,
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/candidate-compliance');
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
              <p className="mt-2">Loading certificate data...</p>
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
        <h2>{isEditMode ? 'Edit Compliance Certificate' : 'Add Compliance Certificate'}</h2>
        <p>
          {isEditMode 
            ? 'Update your compliance certificate details' 
            : 'Upload your compliance certificate and fill in the details below'}
        </p>
      </div>
    </div>
  </div>
</div>

            {/* Error Message */}
            {error && <div className="cert-add-error alert alert-danger">{error}</div>}

            {/* Form */}
            <div className="cert-add-form-container">
              <form onSubmit={handleSubmit} encType={isEditMode ? '' : 'multipart/form-data'}>
                <div className="row">
                  {/* Compliance Category Dropdown */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Compliance Category *</label>
                    <select
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      disabled={loading || fetchLoading}
                    >
                      <option value="">Select Compliance Category</option>
                      {complianceCategories.map(category => (
                        <option key={category.id} value={category.category_name}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                  </div>

                  {/* Compliance Rule Dropdown */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Compliance Rule *</label>
                    <select
                      className={`form-control ${errors.compliance_rule ? 'is-invalid' : ''}`}
                      value={selectedRule}
                      onChange={handleRuleChange}
                      disabled={loading || fetchLoading || !selectedCategory}
                    >
                      <option value="">Select Compliance Rule</option>
                      {filteredRules.map(rule => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                    </select>
                    {errors.compliance_rule && (
                      <div className="invalid-feedback">{errors.compliance_rule}</div>
                    )}
                    {selectedCategory && filteredRules.length === 0 && (
                      <small className="text-muted">No rules available for this category</small>
                    )}
                  </div>

                  {/* Certificate Number */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Certificate Number *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.certificate_number ? 'is-invalid' : ''}`}
                      name="certificate_number"
                      value={formData.certificate_number || ''}
                      onChange={handleChange}
                      placeholder="Enter certificate number"
                      disabled={loading}
                    />
                    {errors.certificate_number && (
                      <div className="invalid-feedback">{errors.certificate_number}</div>
                    )}
                  </div>

                  {/* Issuing Authority */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Issuing Authority *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.issuing_authority ? 'is-invalid' : ''}`}
                      name="issuing_authority"
                      value={formData.issuing_authority || ''}
                      onChange={handleChange}
                      placeholder="Enter issuing authority (e.g., OSHA, ISO, etc.)"
                      disabled={loading}
                    />
                    {errors.issuing_authority && (
                      <div className="invalid-feedback">{errors.issuing_authority}</div>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Issue Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.issue_date ? 'is-invalid' : ''}`}
                      name="issue_date"
                      value={formData.issue_date || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.issue_date && (
                      <div className="invalid-feedback">{errors.issue_date}</div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.expiry_date ? 'is-invalid' : ''}`}
                      name="expiry_date"
                      value={formData.expiry_date || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.expiry_date && (
                      <div className="invalid-feedback">{errors.expiry_date}</div>
                    )}
                  </div>

                  {/* Document Upload - Only show for new entries or allow update for edits */}
                  <div className="col-12 mb-3">
                    <label className="form-label">{isEditMode ? 'Update Document (Optional)' : 'Document *'}</label>
                    <input
                      type="file"
                      className={`form-control ${errors.document ? 'is-invalid' : ''}`}
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={loading}
                    />
                    {errors.document && (
                      <div className="invalid-feedback">{errors.document}</div>
                    )}
                    {/* <small className="text-muted">
                      Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX (Max size: 5MB)
                      {isEditMode && existingDocument && (
                        <span className="d-block mt-1 text-success">
                          Current document: {existingDocument.split('/').pop()}
                        </span>
                      )}
                    </small> */}
                  </div>
                </div>

                {/* Note */}
                {/* <div className="cert-add-note mb-4">
                  <small className="text-muted">
                    Note: Fields marked with * are required. Please ensure all information is accurate.
                    The document will be reviewed by the mentor for approval.
                  </small>
                </div> */}

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
                    {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Certificate' : 'Submit Certificate')}
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