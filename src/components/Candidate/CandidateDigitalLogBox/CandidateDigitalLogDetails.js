// CandidateDigitalLogbookDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaShip,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaFile,
  FaVideo,
  FaImage,
  FaSpinner,
  FaDownload,
  FaEye,
  FaInfoCircle,
  FaClipboardList,
  FaShieldAlt,
  FaUsers,
  FaCertificate,
  FaStar,
  FaComment
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import Swal from 'sweetalert2';
import "./CandidateDigitalLogDetails.css";

const CandidateDigitalLogbookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEntryDetails();
  }, [id]);

  const fetchEntryDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/candidate/digital-logbook/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        const foundEntry = result.data.find(item => item.id === parseInt(id));
        if (foundEntry) {
          setEntry(foundEntry);
          console.log('✅ Entry details loaded:', foundEntry);
        } else {
          throw new Error('Entry not found');
        }
      } else {
        throw new Error(result.message || 'Failed to fetch entry details');
      }
    } catch (err) {
      console.error('Error fetching entry details:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Entry',
        text: err.message || 'An error occurred while loading entry details',
        confirmButtonText: 'Go Back',
      }).then(() => {
        navigate('/candidate/logbook');
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="cdld-status-badge approved"><FaCheckCircle /> Approved</span>;
      case 'pending':
        return <span className="cdld-status-badge pending"><FaClock /> Pending Review</span>;
      case 'rejected':
        return <span className="cdld-status-badge rejected"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="cdld-status-badge pending"><FaClock /> {status}</span>;
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'photo':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'document':
        return <FaFile />;
      default:
        return <FaFile />;
    }
  };

  const handleFileDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `${BASE_URL}${filePath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (filePath) => {
    window.open(`${BASE_URL}${filePath}`, '_blank');
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="container-fluid cdld-wrapper">
              <div className="text-center p-5">
                <FaSpinner className="fa-spin fa-3x" />
                <p className="mt-2">Loading entry details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="ta-layout-wrapper">
      <CandidateSidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="container-fluid cdld-wrapper">
            
            {/* Back Button */}
            <button 
              className="btn cdld-back-btn"
              onClick={() => navigate('/candidate-digital')}
            >
              <FaArrowLeft /> Back to Logbook
            </button>

            {/* Header Section */}
            <div className="cdld-header">
              <div className="cdld-header-content">
                <h1 className="cdld-title">{entry.title || "Untitled Entry"}</h1>
                <div className="cdld-header-meta">
                  {getStatusBadge(entry.verification_status)}
                  <span className="cdld-meta-item">
                    <FaCalendarAlt /> {formatDate(entry.created_at)}
                  </span>
                  <span className="cdld-meta-item">
                    <FaUser /> {entry.candidate_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="cdld-tabs">
              <button 
                className={`cdld-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaInfoCircle /> Overview
              </button>
              <button 
                className={`cdld-tab ${activeTab === 'evidence' ? 'active' : ''}`}
                onClick={() => setActiveTab('evidence')}
              >
                <FaFile /> Evidence ({entry.evidence_documents?.length || 0})
              </button>
              <button 
                className={`cdld-tab ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTab('review')}
              >
                <FaStar /> Review Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="cdld-content">
              {activeTab === 'overview' && (
                <div className="cdld-overview">
                  {/* Duration Section */}
                  <div className="cdld-card">
                    <h3><FaClock /> Duration Details</h3>
                    <div className="cdld-duration-stats">
                      <div className="cdld-duration-item">
                        <span className="cdld-duration-label">Total Hours:</span>
                        <span className="cdld-duration-value">{entry.hours || 0} hours</span>
                      </div>
                      <div className="cdld-duration-item">
                        <span className="cdld-duration-label">Start Date:</span>
                        <span className="cdld-duration-value">{formatDate(entry.start_date)}</span>
                      </div>
                      <div className="cdld-duration-item">
                        <span className="cdld-duration-label">End Date:</span>
                        <span className="cdld-duration-value">{formatDate(entry.end_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="cdld-card">
                    <h3><FaBriefcase /> Work Information</h3>
                    <div className="cdld-info-grid">
                      <div className="cdld-info-item">
                        <label>Work Location:</label>
                        <p><FaMapMarkerAlt /> {entry.work_location || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Ship Name:</label>
                        <p><FaShip /> {entry.ship_name || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Ship Type:</label>
                        <p>{entry.ship_type || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Work Type:</label>
                        <p>{entry.work_type || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Work Environment:</label>
                        <p>{entry.work_environment || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Weather Conditions:</label>
                        <p>{entry.weather_conditions || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Team Information */}
                  <div className="cdld-card">
                    <h3><FaUsers /> Team & Role</h3>
                    <div className="cdld-info-grid">
                      <div className="cdld-info-item">
                        <label>Team Size:</label>
                        <p>{entry.team_size || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Team Role:</label>
                        <p>{entry.team_role || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Supervisor Name:</label>
                        <p>{entry.supervisor_name || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Supervisor Contact:</label>
                        <p>{entry.supervisor_contact || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Client Name:</label>
                        <p>{entry.client_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Work Description */}
                  <div className="cdld-card">
                    <h3><FaClipboardList /> Work Description</h3>
                    <p className="cdld-description">{entry.work_description || 'No description provided'}</p>
                  </div>

                  {/* Equipment & Safety */}
                  <div className="cdld-card">
                    <h3><FaShieldAlt /> Equipment & Safety</h3>
                    <div className="cdld-info-grid">
                      <div className="cdld-info-item">
                        <label>Equipment Used:</label>
                        <p>{entry.equipment_used || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Safety Precautions:</label>
                        <p>{entry.safety_precautions || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Incidents Occurred:</label>
                        <p>{entry.incidents_occurred ? 'Yes' : 'No'}</p>
                      </div>
                      {entry.incidents_occurred && (
                        <div className="cdld-info-item full-width">
                          <label>Incident Description:</label>
                          <p>{entry.incident_description || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quality & Compliance */}
                  <div className="cdld-card">
                    <h3><FaCertificate /> Quality & Compliance</h3>
                    <div className="cdld-info-grid">
                      <div className="cdld-info-item">
                        <label>Quality Checks:</label>
                        <p>{entry.quality_checks ? 'Performed' : 'Not Performed'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Quality Standards:</label>
                        <p>{entry.quality_standards || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Inspection Required:</label>
                        <p>{entry.inspection_required ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Inspection Passed:</label>
                        <p>{entry.inspection_passed ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Certificates Required:</label>
                        <p>{entry.certificates_required || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Certificates Obtained:</label>
                        <p>{entry.certificates_obtained || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Compliance Standards:</label>
                        <p>{entry.compliance_standards || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="cdld-evidence">
                  <div className="cdld-card">
                    <h3><FaFile /> Evidence Documents</h3>
                    {entry.evidence_documents && entry.evidence_documents.length > 0 ? (
                      <div className="cdld-evidence-grid">
                        {entry.evidence_documents.map((doc, index) => (
                          <div key={index} className="cdld-evidence-item">
                            <div className="cdld-evidence-icon">
                              {getFileIcon(doc.type)}
                            </div>
                            <div className="cdld-evidence-info">
                              <p className="cdld-evidence-filename">{doc.filename}</p>
                              <p className="cdld-evidence-meta">
                                Type: {doc.type} | Size: {(doc.size / 1024).toFixed(2)} KB
                              </p>
                              <p className="cdld-evidence-date">
                                Uploaded: {formatDateTime(doc.upload_date)}
                              </p>
                            </div>
                            <div className="cdld-evidence-actions">
                              <button 
                                className="cdld-evidence-btn view"
                                onClick={() => handleViewFile(doc.path)}
                              >
                                <FaEye /> View
                              </button>
                              <button 
                                className="cdld-evidence-btn download"
                                onClick={() => handleFileDownload(doc.path, doc.filename)}
                              >
                                <FaDownload /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No evidence documents uploaded.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="cdld-review">
                  <div className="cdld-card">
                    <h3><FaStar /> Review Information</h3>
                    <div className="cdld-review-details">
                      <div className="cdld-info-item">
                        <label>Verification Status:</label>
                        <p>{getStatusBadge(entry.verification_status)}</p>
                      </div>
                      {entry.reviewed_by && (
                        <>
                          <div className="cdld-info-item">
                            <label>Reviewed By:</label>
                            <p><FaUser /> {entry.reviewed_by}</p>
                          </div>
                          <div className="cdld-info-item">
                            <label>Reviewed At:</label>
                            <p><FaCalendarAlt /> {formatDateTime(entry.reviewed_at)}</p>
                          </div>
                          <div className="cdld-info-item full-width">
                            <label><FaComment /> Review Comments:</label>
                            <p className="cdld-review-comments">{entry.review_comments || 'No comments provided'}</p>
                          </div>
                        </>
                      )}
                      <div className="cdld-info-item">
                        <label>Submitted By:</label>
                        <p><FaUser /> {entry.submitted_by || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item full-width">
                        <label>Submission Notes:</label>
                        <p>{entry.submission_notes || 'No submission notes'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Competency Information */}
                  <div className="cdld-card">
                    <h3><FaBuilding /> Competency Details</h3>
                    <div className="cdld-info-grid">
                      <div className="cdld-info-item">
                        <label>Competency Name:</label>
                        <p>{entry.competency_name || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Department:</label>
                        <p>{entry.department_name || 'N/A'}</p>
                      </div>
                      <div className="cdld-info-item">
                        <label>Level:</label>
                        <p>{entry.level_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDigitalLogbookDetails;