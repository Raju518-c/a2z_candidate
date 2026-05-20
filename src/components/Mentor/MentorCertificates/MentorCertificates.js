import React, { useState, useEffect } from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileAlt,
  FaSearch,
  FaEye,
  FaDownload,
  FaTimes,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaFile,
  FaCheck,
  FaBan,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCertificate,
  FaUserTie
} from "react-icons/fa";
import "./MentorCertificates.css";
import { BASE_URL } from "../../../ApiUrl";
import Swal from "sweetalert2";

const MentorCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("certificate");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch certificates from API
  useEffect(() => {
    fetchCertificates();
    fetchCandidates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/certifications/`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch certificates");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCertificates(result.data);
        console.log("Fetched certificates:", result.data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/candidates/`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCandidates(result.data);
        console.log("Fetched candidates:", result.data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  // Handle accept action
  const handleAccept = async (certId, certNumber) => {
    const result = await Swal.fire({
      title: 'Approve Certificate?',
      text: `Are you sure you want to approve certificate "${certNumber}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        // Add your API call here to approve certificate
        // Example:
        // const response = await fetch(`${BASE_URL}/api/mentor/certifications/${certId}/approve/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: 'approved' })
        // });
        
        await Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Certificate has been approved successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchCertificates(); // Refresh data
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to approve certificate. Please try again.',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle reject action
  const handleReject = async (certId, certNumber) => {
    const result = await Swal.fire({
      title: 'Reject Certificate?',
      text: `Are you sure you want to reject certificate "${certNumber}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      input: 'textarea',
      inputPlaceholder: 'Please provide a reason for rejection...',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason for rejection!';
        }
      }
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        // Add your API call here to reject certificate
        // Example:
        // const response = await fetch(`${BASE_URL}/api/mentor/certifications/${certId}/reject/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ 
        //     status: 'rejected',
        //     rejection_reason: result.value 
        //   })
        // });
        
        await Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Certificate has been rejected.',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchCertificates(); // Refresh data
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to reject certificate. Please try again.',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Get certificate status - FIXED: Prioritize API status field
  const getCertificateStatus = (cert) => {
    // First check if status field exists in API response
    if (cert.status) {
      // Map API status to our display status
      const statusMap = {
        'pending': 'pending',
        'approved': 'valid',
        'rejected': 'expired',
        'expired': 'expired',
        'valid': 'valid'
      };
      return statusMap[cert.status.toLowerCase()] || cert.status.toLowerCase();
    }
    
    // Fallback logic if no status field
    const today = new Date();
    const expiryDate = new Date(cert.expiry_date);
    
    if (!cert.is_approved) return "pending";
    if (expiryDate < today) return "expired";
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiryDate <= thirtyDaysFromNow) return "expiring";
    return "valid";
  };

  // Get status text and class
  const getStatusInfo = (status) => {
    switch(status) {
      case "valid":
        return { text: "Valid", class: "tc-status-green" };
      case "expiring":
        return { text: "Expiring Soon", class: "tc-status-yellow" };
      case "expired":
        return { text: "Expired", class: "tc-status-red" };
      case "pending":
        return { text: "Pending", class: "tc-status-gray" };
      default:
        return { text: status || "Unknown", class: "tc-status-gray" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate statistics
  const getTotalCertificates = () => certificates.length;
  
  const getValidCertificates = () => {
    return certificates.filter(cert => getCertificateStatus(cert) === "valid").length;
  };
  
  const getExpiringCertificates = () => {
    return certificates.filter(cert => getCertificateStatus(cert) === "expiring").length;
  };
  
  const getExpiredCertificates = () => {
    return certificates.filter(cert => getCertificateStatus(cert) === "expired").length;
  };

  const getPendingCertificates = () => {
    return certificates.filter(cert => getCertificateStatus(cert) === "pending").length;
  };

  // Filter certificates based on search
  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getCandidateName(cert.candidate)?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle view details
  const handleViewDetails = async (cert) => {
    setSelectedCert(cert);
    setActiveTab("certificate");
    
    // Find candidate details
    if (cert.candidate) {
      const candidate = candidates.find(c => c.id === cert.candidate);
      setSelectedCandidate(candidate || null);
    } else {
      setSelectedCandidate(null);
    }
    
    setShowModal(true);
  };

  // Get document URL
  const getDocumentUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}${path}`;
  };

  // Handle download
  const handleDownload = (url, filename) => {
    window.open(url, '_blank');
  };

  // Get candidate initials
  const getInitials = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate?.full_name) {
      return candidate.full_name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "CA";
  };

  // Get candidate name
  const getCandidateName = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.full_name || `Candidate ${candidateId}`;
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'M') return 'Male';
    if (gender === 'F') return 'Female';
    if (gender === 'O') return 'Other';
    return 'Not specified';
  };

  // Get issuer type display
  const getIssuerTypeDisplay = (type) => {
    const types = {
      'Client Company': 'Client Company',
      'Training Center': 'Training Center',
      'Educational Institution': 'Educational Institution',
      'Government Body': 'Government Body',
      'Professional Organization': 'Professional Organization',
      'Other': 'Other'
    };
    return types[type] || type || 'Not specified';
  };

  return (
    <div className="tc-layout-wrapper">
      <MentorSidebar />

      <div className="tc-main-wrapper">
        <Header />

        <div className="tc-content-area">
          {/* Title */}
          <div className="tc-page-header">
            <h4>Certifications</h4>
            <p>Monitor candidate certifications and compliance status</p>
          </div>

          {/* Stat Cards */}
          <div className="row g-4 tc-stat-row">
            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-green">
                  <FaCheckCircle size={32} />
                </div>
                <div>
                  <h3 className="tc-green">{getValidCertificates()}</h3>
                  <p>Valid Certificates</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-yellow">
                  <FaClock size={32} />
                </div>
                <div>
                  <h3 className="tc-yellow">{getExpiringCertificates()}</h3>
                  <p>Expiring Soon</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-red">
                  <FaTimesCircle size={32} />
                </div>
                <div>
                  <h3 className="tc-red">{getExpiredCertificates()}</h3>
                  <p>Expired</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-blue">
                  <FaFileAlt size={32} />
                </div>
                <div>
                  <h3 className="tc-blue">{getTotalCertificates()}</h3>
                  <p>Total Certificates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="tc-search-wrapper">
            <div className="tc-search-box">
              <FaSearch className="tc-search-icon" size={18} />
              <input
                type="text"
                className="tc-search-input"
                placeholder="Search by certificate name, issuing authority, issuer name, or candidate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Certificates Table */}
          <div className="tc-table-card">
            <div className="tc-table-header">
              <div>
                <h5 className="mb-0">Certifications Overview</h5>
                <p className="text-muted mb-0 small">Manage and track candidate certifications</p>
              </div>
              <div className="tc-total-count">
                Total: {filteredCertificates.length} certificates
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading certificates...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table tc-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>CERTIFICATE NAME</th>
                      <th>CANDIDATE</th>
                      <th>ISSUING AUTHORITY</th>
                      <th>ISSUE DATE</th>
                      <th>EXPIRY DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.length > 0 ? (
                      filteredCertificates.map((cert) => {
                        const status = getCertificateStatus(cert);
                        const statusInfo = getStatusInfo(status);
                        
                        return (
                          <tr key={cert.id}>
                            <td>
                              <div className="tc-cert-name">
                                <FaFileAlt className="tc-cert-icon" size={16} />
                                <span>{cert.certificate_number}</span>
                              </div>
                            </td>
                            <td>
                              <div className="tc-candidate">
                                <div className="tc-avatar">
                                  {getInitials(cert.candidate)}
                                </div>
                                {getCandidateName(cert.candidate)}
                              </div>
                            </td>
                            <td>{cert.issuing_authority}</td>
                            <td>{formatDate(cert.issue_date)}</td>
                            <td>{formatDate(cert.expiry_date)}</td>
                            <td>
                              <span className={`tc-status ${statusInfo.class}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td>
                              <div className="tc-action-buttons">
                                <button
                                  className="tc-view-btn"
                                  onClick={() => handleViewDetails(cert)}
                                  title="View Details"
                                >
                                  <FaEye size={16} />
                                </button>
                                {status === "pending" && (
                                  <>
                                    <button
                                      className="tc-accept-btn"
                                      onClick={() => handleAccept(cert.id, cert.certificate_number)}
                                      disabled={actionLoading}
                                      title="Approve Certificate"
                                    >
                                      <FaCheck size={16} />
                                    </button>
                                    <button
                                      className="tc-reject-btn"
                                      onClick={() => handleReject(cert.id, cert.certificate_number)}
                                      disabled={actionLoading}
                                      title="Reject Certificate"
                                    >
                                      <FaTimes size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <p className="text-muted mb-0">No certificates found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Certificate Details with Action Buttons */}
      {showModal && selectedCert && (
        <div className="tc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h5>Certificate Details</h5>
              <button className="tc-modal-close" onClick={() => setShowModal(false)}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="tc-modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
                onClick={() => setActiveTab('certificate')}
              >
                <FaCertificate size={18} /> Certificate Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'issuer' ? 'active' : ''}`}
                onClick={() => setActiveTab('issuer')}
              >
                <FaBuilding size={18} /> Issuer Details
              </button>
              <button 
                className={`tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidate')}
              >
                <FaUser size={18} /> Candidate Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'document' ? 'active' : ''}`}
                onClick={() => setActiveTab('document')}
              >
                <FaFile size={18} /> Document
              </button>
            </div>

            <div className="tc-modal-body">
              {/* Certificate Information Tab */}
              {activeTab === 'certificate' && (
                <div className="info-section">
                  <h4>Certificate Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Certificate Number:</label>
                      <span>{selectedCert.certificate_number}</span>
                    </div>
                    <div className="info-item">
                      <label>Issuing Authority:</label>
                      <span>{selectedCert.issuing_authority}</span>
                    </div>
                    <div className="info-item">
                      <label>Issue Date:</label>
                      <span>{formatDate(selectedCert.issue_date)}</span>
                    </div>
                    <div className="info-item">
                      <label>Expiry Date:</label>
                      <span>{formatDate(selectedCert.expiry_date)}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={`tc-status ${getStatusInfo(getCertificateStatus(selectedCert)).class}`}>
                        {getStatusInfo(getCertificateStatus(selectedCert)).text}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Approval Status:</label>
                      <span>{selectedCert.is_approved ? "Approved" : "Pending"}</span>
                    </div>
                    {selectedCert.approved_at && (
                      <div className="info-item">
                        <label>Approved At:</label>
                        <span>{formatDateTime(selectedCert.approved_at)}</span>
                      </div>
                    )}
                    {selectedCert.approval_remarks && (
                      <div className="info-item">
                        <label>Approval Remarks:</label>
                        <span>{selectedCert.approval_remarks}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Created At:</label>
                      <span>{formatDateTime(selectedCert.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Updated:</label>
                      <span>{formatDateTime(selectedCert.updated_at)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Issuer Details Tab - NEW */}
              {activeTab === 'issuer' && (
                <div className="info-section">
                  <h4>Issuer Information</h4>
                  <div className="issuer-profile-header">
                    <div className="issuer-avatar">
                      <FaBuilding size={60} />
                    </div>
                    <div className="issuer-name-title">
                      <h3>{selectedCert.issuer_name || "N/A"}</h3>
                      <p className="text-muted">{getIssuerTypeDisplay(selectedCert.issuer_type)}</p>
                    </div>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <label><FaUserTie size={14} className="info-icon" /> Issuer Name:</label>
                      <span>{selectedCert.issuer_name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaBuilding size={14} className="info-icon" /> Issuer Type:</label>
                      <span>{getIssuerTypeDisplay(selectedCert.issuer_type)}</span>
                    </div>
                    <div className="info-item">
                      <label><FaEnvelope size={14} className="info-icon" /> Email:</label>
                      <span>{selectedCert.issuer_email || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaPhone size={14} className="info-icon" /> Phone:</label>
                      <span>{selectedCert.issuer_phone || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaGlobe size={14} className="info-icon" /> Website:</label>
                      <span>
                        {selectedCert.issuer_website ? (
                          <a href={selectedCert.issuer_website} target="_blank" rel="noopener noreferrer">
                            {selectedCert.issuer_website}
                          </a>
                        ) : "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label><FaIdCard size={14} className="info-icon" /> Accreditation Number:</label>
                      <span>{selectedCert.issuer_accreditation_number || "N/A"}</span>
                    </div>
                    <div className="info-item full-width">
                      <label><FaMapMarkerAlt size={14} className="info-icon" /> Address:</label>
                      <span>{selectedCert.issuer_address || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>City:</label>
                      <span>{selectedCert.issuer_city || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>State:</label>
                      <span>{selectedCert.issuer_state || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Country:</label>
                      <span>{selectedCert.issuer_country || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Postal Code:</label>
                      <span>{selectedCert.issuer_postal_code || "N/A"}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Description:</label>
                      <span>{selectedCert.issuer_description || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidate Information Tab */}
              {activeTab === 'candidate' && (
                <div className="info-section">
                  <h4>Candidate Information</h4>
                  {selectedCandidate ? (
                    <>
                      <div className="candidate-profile-header">
                        <div className="candidate-avatar">
                          <FaUser size={60} />
                        </div>
                        <div className="candidate-name-title">
                          <h3>{selectedCandidate.full_name}</h3>
                          <p className="text-muted">Candidate ID: {selectedCandidate.id}</p>
                        </div>
                      </div>
                      
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Full Name:</label>
                          <span>{selectedCandidate.full_name}</span>
                        </div>
                        <div className="info-item">
                          <label>Email:</label>
                          <span>{selectedCandidate.email}</span>
                        </div>
                        <div className="info-item">
                          <label>Phone Number:</label>
                          <span>{selectedCandidate.phone_number}</span>
                        </div>
                        <div className="info-item">
                          <label>Date of Birth:</label>
                          <span>{formatDate(selectedCandidate.date_of_birth)}</span>
                        </div>
                        <div className="info-item">
                          <label>Gender:</label>
                          <span>{getGenderDisplay(selectedCandidate.gender)}</span>
                        </div>
                        <div className="info-item">
                          <label>Blood Group:</label>
                          <span>{selectedCandidate.blood_group || "N/A"}</span>
                        </div>
                        <div className="info-item">
                          <label>Address:</label>
                          <span>{selectedCandidate.address}</span>
                        </div>
                        <div className="info-item">
                          <label>City:</label>
                          <span>{selectedCandidate.city}</span>
                        </div>
                        <div className="info-item">
                          <label>State:</label>
                          <span>{selectedCandidate.state}</span>
                        </div>
                        <div className="info-item">
                          <label>Country:</label>
                          <span>{selectedCandidate.country}</span>
                        </div>
                        <div className="info-item">
                          <label>Pincode:</label>
                          <span>{selectedCandidate.pincode}</span>
                        </div>
                        <div className="info-item">
                          <label>Emergency Contact:</label>
                          <span>{selectedCandidate.emergency_contact_name} ({selectedCandidate.emergency_contact_phone})</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-warning">
                      <p>No candidate information available for this certificate.</p>
                      <p className="mb-0"><strong>Candidate ID:</strong> {selectedCert.candidate}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Document Tab */}
              {activeTab === 'document' && (
                <div className="info-section">
                  <h4>Certificate Document</h4>
                  {selectedCert.document ? (
                    <div className="document-preview">
                      <div className="document-card">
                        <FaFileAlt className="document-icon" size={48} />
                        <div className="document-info">
                          <p className="document-name">
                            {selectedCert.document.split('/').pop()}
                          </p>
                          <p className="document-size">
                            Certificate Document
                          </p>
                          <button 
                            className="btn-download"
                            onClick={() => handleDownload(
                              getDocumentUrl(selectedCert.document), 
                              selectedCert.document.split('/').pop()
                            )}
                          >
                            <FaDownload size={18} /> Download Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <p>No document available for this certificate.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="tc-modal-footer">
              {/* Action buttons in modal footer for pending certificates */}
              {getCertificateStatus(selectedCert) === "pending" && (
                <div className="tc-modal-actions">
                  <button
                    className="tc-accept-btn-modal"
                    onClick={() => {
                      handleAccept(selectedCert.id, selectedCert.certificate_number);
                      setShowModal(false);
                    }}
                    disabled={actionLoading}
                  >
                    <FaCheck size={18} /> Approve Certificate
                  </button>
                  <button
                    className="tc-reject-btn-modal"
                    onClick={() => {
                      handleReject(selectedCert.id, selectedCert.certificate_number);
                      setShowModal(false);
                    }}
                    disabled={actionLoading}
                  >
                    <FaTimes size={18} /> Reject Certificate
                  </button>
                </div>
              )}
              <button className="tc-close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorCertificatesPage;