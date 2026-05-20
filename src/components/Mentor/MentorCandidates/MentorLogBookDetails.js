
// MentorLogbookDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
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
  FaComment,
  FaHardHat,
  FaTachometerAlt,
  FaCloudSun,
  FaWrench,
  FaExclamationTriangle
} from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";
import "./MentorLogBookDetails.css";

const MentorLogbookDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logbook, setLogbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.logbookData) {
      setLogbook(location.state.logbookData);
      setLoading(false);
    } else {
      // Redirect back if no data
      navigate('/mentor-candidates');
    }
  }, [location, navigate]);

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
        return <span className="mlb-status-badge approved"><FaCheckCircle /> Approved</span>;
      case 'pending':
        return <span className="mlb-status-badge pending"><FaClock /> Pending Review</span>;
      case 'rejected':
        return <span className="mlb-status-badge rejected"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="mlb-status-badge pending">{status}</span>;
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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="mlb-loading-container">
              <FaSpinner className="mlb-spinner" />
              <p>Loading logbook details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!logbook) {
    return null;
  }

  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="container-fluid mlb-wrapper">
            
            {/* Back Button */}
            <button className="btn mlb-back-btn" onClick={handleGoBack}>
              <FaArrowLeft /> Back
            </button>

            {/* Header Section */}
            <div className="mlb-header">
              <div className="mlb-header-content">
                <h1 className="mlb-title">{logbook.title || "Digital Logbook Entry"}</h1>
                <div className="mlb-header-meta">
                  {getStatusBadge(logbook.verification_status)}
                  <span className="mlb-meta-item">
                    <FaCalendarAlt /> {formatDate(logbook.created_at)}
                  </span>
                  <span className="mlb-meta-item">
                    <FaUser /> {logbook.candidate_name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mlb-content">
              {/* Duration Section */}
              <div className="mlb-card">
                <h3><FaClock /> Duration Details</h3>
                <div className="mlb-duration-stats">
                  <div className="mlb-duration-item">
                    <span className="mlb-duration-label">Total Hours:</span>
                    <span className="mlb-duration-value">{logbook.hours || 0} hours</span>
                  </div>
                  <div className="mlb-duration-item">
                    <span className="mlb-duration-label">Total Duration:</span>
                    <span className="mlb-duration-value">{logbook.total_duration || 'N/A'}</span>
                  </div>
                  <div className="mlb-duration-item">
                    <span className="mlb-duration-label">Start Date:</span>
                    <span className="mlb-duration-value">{formatDate(logbook.start_date)}</span>
                  </div>
                  <div className="mlb-duration-item">
                    <span className="mlb-duration-label">End Date:</span>
                    <span className="mlb-duration-value">{formatDate(logbook.end_date)}</span>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="mlb-card">
                <h3><FaBriefcase /> Work Information</h3>
                <div className="mlb-info-grid">
                  <div className="mlb-info-item">
                    <label>Work Location:</label>
                    <p><FaMapMarkerAlt /> {logbook.work_location || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Ship Name:</label>
                    <p><FaShip /> {logbook.ship_name || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Ship Type:</label>
                    <p>{logbook.ship_type || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Work Type:</label>
                    <p>{logbook.work_type || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Work Environment:</label>
                    <p><FaTachometerAlt /> {logbook.work_environment || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Weather Conditions:</label>
                    <p><FaCloudSun /> {logbook.weather_conditions || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              {logbook.work_description && (
                <div className="mlb-card">
                  <h3><FaClipboardList /> Work Description</h3>
                  <p className="mlb-description">{logbook.work_description}</p>
                </div>
              )}

              {/* Team Information */}
              <div className="mlb-card">
                <h3><FaUsers /> Team & Role</h3>
                <div className="mlb-info-grid">
                  <div className="mlb-info-item">
                    <label>Team Size:</label>
                    <p>{logbook.team_size || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Team Role:</label>
                    <p>{logbook.team_role || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Supervisor Name:</label>
                    <p>{logbook.supervisor_name || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Supervisor Contact:</label>
                    <p>{logbook.supervisor_contact || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Client Name:</label>
                    <p>{logbook.client_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Equipment & Safety */}
              <div className="mlb-card">
                <h3><FaShieldAlt /> Equipment & Safety</h3>
                <div className="mlb-info-grid">
                  <div className="mlb-info-item">
                    <label>Equipment Used:</label>
                    <p><FaWrench /> {logbook.equipment_used || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Safety Precautions:</label>
                    <p>{logbook.safety_precautions || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Incidents Occurred:</label>
                    <p>{logbook.incidents_occurred ? 'Yes' : 'No'}</p>
                  </div>
                  {logbook.incidents_occurred && (
                    <div className="mlb-info-item full-width">
                      <label><FaExclamationTriangle /> Incident Description:</label>
                      <p>{logbook.incident_description || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quality & Compliance */}
              <div className="mlb-card">
                <h3><FaCertificate /> Quality & Compliance</h3>
                <div className="mlb-info-grid">
                  <div className="mlb-info-item">
                    <label>Quality Checks:</label>
                    <p>{logbook.quality_checks ? 'Performed' : 'Not Performed'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Quality Standards:</label>
                    <p>{logbook.quality_standards || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Inspection Required:</label>
                    <p>{logbook.inspection_required ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Inspection Passed:</label>
                    <p>{logbook.inspection_passed ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Certificates Required:</label>
                    <p>{logbook.certificates_required || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Certificates Obtained:</label>
                    <p>{logbook.certificates_obtained || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item">
                    <label>Compliance Standards:</label>
                    <p>{logbook.compliance_standards || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Evidence Documents */}
              {logbook.evidence_documents && logbook.evidence_documents.length > 0 && (
                <div className="mlb-card">
                  <h3><FaFile /> Evidence Documents</h3>
                  <div className="mlb-evidence-grid">
                    {logbook.evidence_documents.map((doc, index) => (
                      <div key={index} className="mlb-evidence-item">
                        <div className="mlb-evidence-icon">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="mlb-evidence-info">
                          <p className="mlb-evidence-filename">{doc.filename}</p>
                          <p className="mlb-evidence-meta">
                            Type: {doc.type} | Size: {(doc.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="mlb-evidence-date">
                            Uploaded: {formatDateTime(doc.upload_date)}
                          </p>
                        </div>
                        <div className="mlb-evidence-actions">
                          <button 
                            className="mlb-evidence-btn view"
                            onClick={() => handleViewFile(doc.path)}
                          >
                            <FaEye /> View
                          </button>
                          <button 
                            className="mlb-evidence-btn download"
                            onClick={() => handleFileDownload(doc.path, doc.filename)}
                          >
                            <FaDownload /> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Information */}
              <div className="mlb-card">
                <h3><FaStar /> Review Information</h3>
                <div className="mlb-review-details">
                  <div className="mlb-info-item">
                    <label>Verification Status:</label>
                    <p>{getStatusBadge(logbook.verification_status)}</p>
                  </div>
                  {logbook.reviewed_by && (
                    <>
                      <div className="mlb-info-item">
                        <label>Reviewed By:</label>
                        <p><FaUser /> {logbook.reviewed_by}</p>
                      </div>
                      <div className="mlb-info-item">
                        <label>Reviewed At:</label>
                        <p><FaCalendarAlt /> {formatDateTime(logbook.reviewed_at)}</p>
                      </div>
                      <div className="mlb-info-item full-width">
                        <label><FaComment /> Review Comments:</label>
                        <p className="mlb-review-comments">{logbook.review_comments || 'No comments provided'}</p>
                      </div>
                    </>
                  )}
                  <div className="mlb-info-item">
                    <label>Submitted By:</label>
                    <p><FaUser /> {logbook.submitted_by || 'N/A'}</p>
                  </div>
                  <div className="mlb-info-item full-width">
                    <label>Submission Notes:</label>
                    <p>{logbook.submission_notes || 'No submission notes'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorLogbookDetails;