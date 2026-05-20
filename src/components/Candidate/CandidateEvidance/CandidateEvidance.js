import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CandidateSidebar from '../Layout/CandidateSidebar';
import Header from '../Layout/CandidateHeader';
import { FaSpinner, FaCloudUploadAlt, FaArrowLeft, FaLink, FaTrash, FaFile, FaSave, FaTimes } from 'react-icons/fa';
import { BASE_URL } from '../../../ApiUrl';
import Swal from 'sweetalert2';
import './CandidateEvidance.css';

const AddEvidence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const mode = queryParams.get('mode');
  const evidenceId = queryParams.get('evidenceId');
  const levelNumber = queryParams.get('level');
  const competencyId = queryParams.get('competencyId');
  const levelName = queryParams.get('levelName');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedBy, setSubmittedBy] = useState('');
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);

  // Get candidate information from localStorage
  useEffect(() => {
    try {
      const candidateUser = localStorage.getItem('candidate_user');
      if (candidateUser) {
        const parsed = JSON.parse(candidateUser);
        setSubmittedBy(parsed.full_name || parsed.email || 'Candidate');
      }
    } catch (error) {
      console.error('Error parsing candidate_user from localStorage:', error);
    }
  }, []);

  const [evidenceData, setEvidenceData] = useState({
    evidence_type: 'document',
    title: '',
    description: '',
    evidence_link: '',
    competency: competencyId ? parseInt(competencyId) : '',
    submission_notes: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch evidence data if in edit mode
  useEffect(() => {
    const fetchEvidenceData = async () => {
      if (mode === 'edit' && evidenceId) {
        setLoadingData(true);
        try {
          const response = await fetch(`${BASE_URL}/api/candidate/competency-evidence/${evidenceId}/`);
          if (!response.ok) {
            throw new Error('Failed to fetch evidence data');
          }
          const result = await response.json();
          
          if (result.status && result.data) {
            const data = result.data;
            setEvidenceData({
              evidence_type: data.evidence_type,
              title: data.title,
              description: data.description,
              evidence_link: data.evidence_link || '',
              competency: data.competency,
              submission_notes: data.submission_notes || '',
            });
            setExistingDocuments(data.evidence_documents || []);
          }
        } catch (error) {
          console.error('Error fetching evidence data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load evidence data for editing.',
          });
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchEvidenceData();
  }, [mode, evidenceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setEvidenceData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (5MB max)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'File Size Warning',
        text: `${invalidFiles.length} file(s) exceed 5MB and will not be uploaded.`,
        timer: 3000,
        showConfirmButton: true
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Clear file error if any
    if (errors.evidence_documents) {
      setErrors(prev => ({ ...prev, evidence_documents: '' }));
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDocument = (docName) => {
    setFilesToRemove(prev => [...prev, docName]);
    setExistingDocuments(prev => prev.filter(doc => doc !== docName));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!evidenceData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!evidenceData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!evidenceData.evidence_type) {
      newErrors.evidence_type = "Evidence type is required";
    }

    if (!evidenceData.competency) {
      newErrors.competency = "Competency is required";
    }

    // Validate based on evidence type
    if (evidenceData.evidence_type === 'link') {
      if (!evidenceData.evidence_link?.trim()) {
        newErrors.evidence_link = "Link is required for external link evidence";
      } else if (!isValidUrl(evidenceData.evidence_link)) {
        newErrors.evidence_link = "Please enter a valid URL";
      }
    } else {
      if (selectedFiles.length === 0 && existingDocuments.length === 0 && mode !== 'edit') {
        newErrors.evidence_documents = "At least one file is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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

    try {
      // Create FormData
      const formData = new FormData();
      
      // Add all text fields
      formData.append('evidence_type', evidenceData.evidence_type);
      formData.append('title', evidenceData.title);
      formData.append('description', evidenceData.description);
      formData.append('evidence_link', evidenceData.evidence_link || '');
      formData.append('verification_status', 'pending');
      formData.append('submitted_by', submittedBy || 'Candidate');
      formData.append('submission_notes', evidenceData.description);
      formData.append('competency', evidenceData.competency);
      
      // Add existing documents (keeping those not removed)
      const updatedDocuments = existingDocuments.filter(doc => !filesToRemove.includes(doc));
      
      if (updatedDocuments.length > 0 || selectedFiles.length > 0) {
        formData.append('evidence_documents', JSON.stringify(updatedDocuments));
      } else if (mode === 'edit') {
        formData.append('evidence_documents', JSON.stringify([]));
      }
      
      // Add new files
      selectedFiles.forEach((file, index) => {
        formData.append(`evidence_documents_files`, file);
      });

      // If removing files, we need to send a flag or include them in the data
      if (filesToRemove.length > 0) {
        formData.append('files_to_remove', JSON.stringify(filesToRemove));
      }

      const url = mode === 'edit' 
        ? `${BASE_URL}/api/candidate/competency-evidence/${evidenceId}/`
        : `${BASE_URL}/api/candidate/competency-evidence/`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        
        if (errorData.data) {
          setErrors(prev => ({
            ...prev,
            ...errorData.data
          }));
        }
        
        throw new Error(errorData.message || `Failed to ${mode === 'edit' ? 'update' : 'upload'} evidence`);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: mode === 'edit' ? 'Evidence updated successfully.' : 'Evidence uploaded successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/candidate-competence');
      
    } catch (err) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'uploading'} evidence:`, err);
      
      Swal.fire({
        icon: 'error',
        title: mode === 'edit' ? 'Update Failed' : 'Upload Failed',
        text: err.message || `Failed to ${mode === 'edit' ? 'update' : 'upload'} evidence. Please try again.`,
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/candidate-competence');
  };

  if (loadingData) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="aev-wrapper">
              <div className="aev-loading-container">
                <FaSpinner className="aev-spinner-large" />
                <p>Loading evidence data...</p>
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
          <div className="aev-container">
            {/* Header Section */}
            <div className="aev-header-section">
              <button className="aev-back-button" onClick={handleCancel}>
                <FaArrowLeft /> Back to Competency
              </button>
              <div className="aev-header-content">
                <h1 className="aev-page-title">{mode === 'edit' ? 'Edit Evidence' : 'Add Evidence'}</h1>
                <p className="aev-page-description">
                  {levelName 
                    ? `${mode === 'edit' ? 'Update' : 'Upload'} evidence for ${levelName}` 
                    : mode === 'edit' ? 'Update your evidence' : 'Upload supporting documents, certificates, or other evidence'}
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="aev-form-card">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Two Column Layout */}
                <div className="aev-form-grid">
                  {/* Evidence Type Field */}
                  <div className="aev-form-field">
                    <label className="aev-field-label">
                      Evidence Type <span className="aev-required-star">*</span>
                    </label>
                    <select
                      className={`aev-select ${errors.evidence_type ? 'aev-field-error' : ''}`}
                      name="evidence_type"
                      value={evidenceData.evidence_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="document">📄 Document Upload</option>
                      <option value="link">🔗 External Link</option>
                      <option value="project">📁 Project Work</option>
                      <option value="assessment">📊 Assessment Result</option>
                      <option value="certificate">🎓 Certificate</option>
                      <option value="other">📎 Other</option>
                    </select>
                    {errors.evidence_type && (
                      <div className="aev-field-error-message">{errors.evidence_type}</div>
                    )}
                  </div>

                  {/* Title Field */}
                  <div className="aev-form-field">
                    <label className="aev-field-label">
                      Title <span className="aev-required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`aev-input ${errors.title ? 'aev-field-error' : ''}`}
                      name="title"
                      value={evidenceData.title}
                      onChange={handleChange}
                      placeholder="Enter evidence title"
                      disabled={loading}
                    />
                    {errors.title && (
                      <div className="aev-field-error-message">{errors.title}</div>
                    )}
                  </div>

                  {/* Description Field - Full Width */}
                  <div className="aev-form-field aev-field-fullwidth">
                    <label className="aev-field-label">
                      Description <span className="aev-required-star">*</span>
                    </label>
                    <textarea
                      className={`aev-textarea ${errors.description ? 'aev-field-error' : ''}`}
                      name="description"
                      value={evidenceData.description}
                      onChange={handleChange}
                      placeholder="Enter detailed description of the evidence"
                      rows="4"
                      disabled={loading}
                    />
                    {errors.description && (
                      <div className="aev-field-error-message">{errors.description}</div>
                    )}
                  </div>

                  {/* Competency Field */}
                  <div className="aev-form-field aev-field-fullwidth">
                    <label className="aev-field-label">
                      Competency <span className="aev-required-star">*</span>
                    </label>
                    <div className="aev-competency-display">
                      <div className="aev-competency-badge">
                        {levelName ? `${levelName}` : `Competency ID: ${evidenceData.competency}`}
                      </div>
                      <div className="aev-competency-id">ID: {evidenceData.competency}</div>
                    </div>
                    <small className="aev-field-hint">This competency is automatically assigned from the level you selected</small>
                  </div>

                  {/* Link Field - Conditional */}
                  {evidenceData.evidence_type === 'link' && (
                    <div className="aev-form-field aev-field-fullwidth">
                      <label className="aev-field-label">
                        Evidence Link <span className="aev-required-star">*</span>
                      </label>
                      <div className="aev-link-input-wrapper">
                        <FaLink className="aev-link-input-icon" />
                        <input
                          type="url"
                          className={`aev-input aev-link-input-field ${errors.evidence_link ? 'aev-field-error' : ''}`}
                          name="evidence_link"
                          value={evidenceData.evidence_link}
                          onChange={handleChange}
                          placeholder="https://example.com/document"
                          disabled={loading}
                        />
                      </div>
                      {errors.evidence_link && (
                        <div className="aev-field-error-message">{errors.evidence_link}</div>
                      )}
                      <small className="aev-field-hint">Enter the URL where the evidence is hosted</small>
                    </div>
                  )}

                  {/* Existing Documents Section */}
                  {existingDocuments.length > 0 && (
                    <div className="aev-form-field aev-field-fullwidth">
                      <label className="aev-field-label">Existing Documents</label>
                      <div className="aev-existing-docs-container">
                        {existingDocuments.map((doc, index) => (
                          <div key={index} className="aev-doc-item">
                            <FaFile className="aev-doc-icon" />
                            <span className="aev-doc-name">{doc}</span>
                            <button
                              type="button"
                              className="aev-remove-doc-btn"
                              onClick={() => handleRemoveExistingDocument(doc)}
                              disabled={loading}
                              title="Remove document"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                      <small className="aev-field-hint aev-hint-warning">
                        Click the trash icon to remove documents you want to delete
                      </small>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="aev-form-field aev-field-fullwidth">
                    <label className="aev-field-label">
                      Upload New Documents
                      {evidenceData.evidence_type !== 'link' && existingDocuments.length === 0 && selectedFiles.length === 0 && mode !== 'edit' && (
                        <span className="aev-required-star"> *</span>
                      )}
                    </label>
                    <div className="aev-upload-area">
                      <input
                        type="file"
                        className="aev-file-input"
                        name="evidence_documents"
                        onChange={handleFileChange}
                        disabled={loading}
                        id="file-upload"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="file-upload" className="aev-upload-label">
                        <FaCloudUploadAlt className="aev-upload-icon" />
                        <span>Choose Files</span>
                      </label>
                      <p className="aev-upload-hint">or drag and drop files here</p>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="aev-selected-files-container">
                        <h4 className="aev-selected-title">New Files ({selectedFiles.length})</h4>
                        <div className="aev-selected-list">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="aev-selected-file">
                              <FaFile className="aev-selected-file-icon" />
                              <div className="aev-selected-file-info">
                                <span className="aev-selected-file-name">{file.name}</span>
                                <span className="aev-selected-file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                              </div>
                              <button
                                type="button"
                                className="aev-remove-file-btn"
                                onClick={() => handleRemoveFile(index)}
                                disabled={loading}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {errors.evidence_documents && (
                      <div className="aev-field-error-message">{errors.evidence_documents}</div>
                    )}
                    
                    <small className="aev-field-hint">
                      {evidenceData.evidence_type !== 'link'
                        ? `Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB per file)`
                        : 'Optional: Upload files if you have them'}
                    </small>
                  </div>

                  {/* Info Box */}
                  {/* <div className="aev-form-field aev-field-fullwidth">
                    <div className="aev-info-panel">
                      <div className="aev-info-grid">
                        <div className="aev-info-item">
                          <span className="aev-info-label">Level</span>
                          <span className="aev-info-value">{levelName || 'N/A'}</span>
                        </div>
                        <div className="aev-info-item">
                          <span className="aev-info-label">Competency ID</span>
                          <span className="aev-info-value">{evidenceData.competency || 'N/A'}</span>
                        </div>
                        <div className="aev-info-item">
                          <span className="aev-info-label">Submitted by</span>
                          <span className="aev-info-value">{submittedBy || 'Candidate'}</span>
                        </div>
                        <div className="aev-info-item">
                          <span className="aev-info-label">Status</span>
                          <span className="aev-info-value aev-status-pending">Pending Review</span>
                        </div>
                        {mode === 'edit' && (
                          <div className="aev-info-item">
                            <span className="aev-info-label">Mode</span>
                            <span className="aev-info-value aev-mode-edit">Editing Existing Evidence</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Form Actions */}
                <div className="aev-form-actions">
                  <button 
                    type="button" 
                    className="aev-btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="aev-btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="aev-spinner" /> 
                        {mode === 'edit' ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <FaSave /> {mode === 'edit' ? 'Update Evidence' : 'Submit Evidence'}
                      </>
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

export default AddEvidence;