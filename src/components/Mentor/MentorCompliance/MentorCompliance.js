import React, { useState, useEffect } from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import { FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle, FaEye, FaDownload, FaTimes, FaShieldAlt, FaHeartbeat, FaBalanceScale, FaCheck, FaBan } from "react-icons/fa";
import "./MentorCompliance.css";
import { BASE_URL } from "../../../ApiUrl";
import Swal from "sweetalert2";

const MentorCompliancePage = () => {
  const [complianceCertificates, setComplianceCertificates] = useState([]);
  const [complianceRules, setComplianceRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchComplianceCertificates();
    fetchComplianceRules();
  }, []);

  const fetchComplianceCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/compliance-certificates/`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch compliance certificates");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setComplianceCertificates(result.data);
        console.log("Fetched compliance certificates:", result.data);
      }
    } catch (error) {
      console.error("Error fetching compliance certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceRules = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch compliance rules");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setComplianceRules(result.data);
        console.log("Fetched compliance rules:", result.data);
      }
    } catch (error) {
      console.error("Error fetching compliance rules:", error);
    }
  };

  // Handle accept action
  const handleAccept = async (candidateId) => {
    const result = await Swal.fire({
      title: 'Approve Compliance?',
      text: `Are you sure you want to approve compliance for ${getCandidateName(candidateId)}?`,
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
        // Add your API call here to update compliance status
        // Example:
        // const response = await fetch(`${BASE_URL}/api/mentor/compliance/${candidateId}/approve/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: 'approved' })
        // });
        
        await Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Compliance has been approved successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchComplianceCertificates(); // Refresh data
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to approve compliance. Please try again.',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle reject action
  const handleReject = async (candidateId) => {
    const result = await Swal.fire({
      title: 'Reject Compliance?',
      text: `Are you sure you want to reject compliance for ${getCandidateName(candidateId)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        // Add your API call here to update compliance status
        // Example:
        // const response = await fetch(`${BASE_URL}/api/mentor/compliance/${candidateId}/reject/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: 'rejected' })
        // });
        
        await Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Compliance has been rejected.',
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchComplianceCertificates(); // Refresh data
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to reject compliance. Please try again.',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get compliance status for a specific rule type
  const getComplianceStatusForRule = (candidateId, ruleCategory) => {
    const candidateCerts = complianceCertificates.filter(
      cert => cert.candidate === candidateId && 
      cert.compliance_rule_name?.toLowerCase().includes(ruleCategory.toLowerCase())
    );
    
    if (candidateCerts.length === 0) return "Expired";
    
    const latestCert = candidateCerts[candidateCerts.length - 1];
    const today = new Date();
    const expiryDate = new Date(latestCert.expiry_date);
    
    if (expiryDate < today) return "Expired";
    if (latestCert.compliance_status === "non_compliant") return "Expired";
    if (latestCert.compliance_status === "partially_compliant") return "At Risk";
    return "Valid";
  };

  // Get overall compliance status for a candidate
  const getOverallComplianceStatus = (candidateId) => {
    const safetyStatus = getComplianceStatusForRule(candidateId, "safety");
    const medicalStatus = getComplianceStatusForRule(candidateId, "medical");
    const ethicsStatus = getComplianceStatusForRule(candidateId, "ethics");
    
    if (safetyStatus === "Expired" || medicalStatus === "Expired" || ethicsStatus === "Expired") {
      return "Non-Compliant";
    }
    if (safetyStatus === "At Risk" || medicalStatus === "At Risk" || ethicsStatus === "At Risk") {
      return "At Risk";
    }
    return "Compliant";
  };

  // Get incidents count for a candidate
  const getIncidentsCount = (candidateId) => {
    const incidentCerts = complianceCertificates.filter(
      cert => cert.candidate === candidateId && 
      cert.compliance_rule_name?.toLowerCase().includes("incident")
    );
    return incidentCerts.length;
  };

  // Get candidate initials
  const getInitials = (candidateId) => {
    const candidate = complianceCertificates.find(cert => cert.candidate === candidateId);
    if (candidate?.candidate_name) {
      return candidate.candidate_name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return `C${candidateId}`;
  };

  // Get candidate name
  const getCandidateName = (candidateId) => {
    const candidate = complianceCertificates.find(cert => cert.candidate === candidateId);
    return candidate?.candidate_name || `Candidate ${candidateId}`;
  };

  // Get unique candidates from certificates
  const getUniqueCandidates = () => {
    const uniqueCandidates = new Map();
    complianceCertificates.forEach(cert => {
      if (!uniqueCandidates.has(cert.candidate)) {
        uniqueCandidates.set(cert.candidate, {
          id: cert.candidate,
          name: cert.candidate_name
        });
      }
    });
    return Array.from(uniqueCandidates.values());
  };

  // Calculate statistics
  const getFullyCompliantCount = () => {
    const candidates = getUniqueCandidates();
    return candidates.filter(c => getOverallComplianceStatus(c.id) === "Compliant").length;
  };

  const getAtRiskCount = () => {
    const candidates = getUniqueCandidates();
    return candidates.filter(c => getOverallComplianceStatus(c.id) === "At Risk").length;
  };

  const getNonCompliantCount = () => {
    const candidates = getUniqueCandidates();
    return candidates.filter(c => getOverallComplianceStatus(c.id) === "Non-Compliant").length;
  };

  const getExpiringSoonCount = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return complianceCertificates.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate > today && cert.is_approved;
    }).length;
  };

  // Handle view details
  const handleViewDetails = (candidateId) => {
    const candidateCerts = complianceCertificates.filter(cert => cert.candidate === candidateId);
    setSelectedCertificate({
      candidateId,
      candidateName: getCandidateName(candidateId),
      certificates: candidateCerts
    });
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

  // Filter candidates based on search
  const filteredCandidates = getUniqueCandidates().filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render badge based on status
  const renderBadge = (value) => {
    let badgeClass = "tc-badge";
    if (value === "Valid") badgeClass += " tc-valid";
    else if (value === "Expired") badgeClass += " tc-expired";
    else if (value === "At Risk") badgeClass += " tc-at-risk";
    else badgeClass += " tc-expired";
    
    return <span className={badgeClass}>{value}</span>;
  };

  return (
    <div className="tc-layout-wrapper">
      <MentorSidebar />

      <div className="tc-main-wrapper">
        <Header />

        <div className="tc-content-area">
          {/* Title */}
          <div className="tc-page-header">
            <h4>Compliance Management</h4>
            <p>Monitor safety certifications and compliance status</p>
          </div>

          {/* Stat Cards */}
          <div className="row g-4 tc-stat-row">
            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-green">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3 className="tc-green">{getFullyCompliantCount()}</h3>
                  <p>Fully Compliant</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-yellow">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h3 className="tc-yellow">{getAtRiskCount()}</h3>
                  <p>At Risk</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-red">
                  <FaTimesCircle />
                </div>
                <div>
                  <h3 className="tc-red">{getNonCompliantCount()}</h3>
                  <p>Non-Compliant</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="tc-stat-card">
                <div className="tc-stat-icon tc-icon-blue">
                  <FaClock />
                </div>
                <div>
                  <h3 className="tc-blue">{getExpiringSoonCount()}</h3>
                  <p>Expiring Soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="tc-search-wrapper">
            <div className="tc-search-box">
              <input
                type="text"
                className="tc-search-input"
                placeholder="Search by candidate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Compliance Table */}
          <div className="tc-table-card">
            <div className="tc-table-header">
              <div>
                <h5 className="mb-0">Compliance Overview</h5>
                <p className="text-muted mb-0 small">Track candidate compliance status across all categories</p>
              </div>
              <div className="tc-total-count">
                Total: {filteredCandidates.length} candidates
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading compliance data...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table tc-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>CANDIDATE</th>
                      <th>SAFETY INDUCTION</th>
                      <th>MEDICAL VALIDITY</th>
                      <th>ETHICS VIOLATIONS</th>
                      <th>INCIDENTS</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((candidate) => {
                        const safetyStatus = getComplianceStatusForRule(candidate.id, "safety");
                        const medicalStatus = getComplianceStatusForRule(candidate.id, "medical");
                        const ethicsStatus = getComplianceStatusForRule(candidate.id, "ethics");
                        const incidentsCount = getIncidentsCount(candidate.id);
                        const overallStatus = getOverallComplianceStatus(candidate.id);
                        
                        return (
                          <tr key={candidate.id}>
                            <td>
                              <div className="tc-candidate">
                                <div className="tc-avatar">{getInitials(candidate.id)}</div>
                                {candidate.name}
                              </div>
                            </td>
                            <td>{renderBadge(safetyStatus)}</td>
                            <td>{renderBadge(medicalStatus)}</td>
                            <td>{renderBadge(ethicsStatus)}</td>
                            <td className="tc-incidents">
                              {incidentsCount} {incidentsCount === 1 ? 'record' : 'records'}
                            </td>
                            <td>
                              <span className={`tc-status ${
                                overallStatus === "Compliant" ? "tc-status-green" : 
                                overallStatus === "At Risk" ? "tc-status-yellow" : "tc-status-red"
                              }`}>
                                {overallStatus}
                              </span>
                            </td>
                            <td>
                              <div className="tc-action-buttons">
                                <button
                                  className="tc-view-btn"
                                  onClick={() => handleViewDetails(candidate.id)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="tc-accept-btn"
                                  onClick={() => handleAccept(candidate.id)}
                                  disabled={actionLoading}
                                  title="Accept"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="tc-reject-btn"
                                  onClick={() => handleReject(candidate.id)}
                                  disabled={actionLoading}
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <p className="text-muted mb-0">No compliance data found</p>
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

      {/* Modal for Compliance Details */}
      {showModal && selectedCertificate && (
        <div className="tc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h5>Compliance Details - {selectedCertificate.candidateName}</h5>
              <button className="tc-modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="tc-modal-body">
              {selectedCertificate.certificates.length > 0 ? (
                selectedCertificate.certificates.map((cert, index) => (
                  <div key={cert.id} className="tc-detail-section">
                    <h6>
                      {cert.compliance_rule_name}
                      <span className={`tc-status ml-2 ${
                        cert.compliance_status === "compliant" ? "tc-status-green" :
                        cert.compliance_status === "non_compliant" ? "tc-status-red" : "tc-status-yellow"
                      }`}>
                        {cert.compliance_status}
                      </span>
                    </h6>
                    <div className="tc-detail-grid">
                      <div className="tc-detail-item">
                        <label>Certificate Number:</label>
                        <span>{cert.certificate_number}</span>
                      </div>
                      <div className="tc-detail-item">
                        <label>Issuing Authority:</label>
                        <span>{cert.issuing_authority}</span>
                      </div>
                      <div className="tc-detail-item">
                        <label>Issue Date:</label>
                        <span>{formatDate(cert.issue_date)}</span>
                      </div>
                      <div className="tc-detail-item">
                        <label>Expiry Date:</label>
                        <span>{formatDate(cert.expiry_date)}</span>
                      </div>
                      <div className="tc-detail-item">
                        <label>Approval Status:</label>
                        <span>{cert.is_approved ? "Approved" : "Pending"}</span>
                      </div>
                      {cert.approved_at && (
                        <div className="tc-detail-item">
                          <label>Approved At:</label>
                          <span>{formatDate(cert.approved_at)}</span>
                        </div>
                      )}
                    </div>

                    {cert.document && (
                      <div className="tc-document-card mt-3">
                        <FaShieldAlt className="tc-document-icon" />
                        <div className="tc-document-info">
                          <p className="tc-document-name">
                            {cert.document.split('/').pop()}
                          </p>
                          <button
                            className="tc-download-btn"
                            onClick={() => handleDownload(
                              getDocumentUrl(cert.document),
                              cert.document.split('/').pop()
                            )}
                          >
                            <FaDownload /> Download Certificate
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {index < selectedCertificate.certificates.length - 1 && <hr />}
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No compliance certificates found</p>
              )}
            </div>

            <div className="tc-modal-footer">
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

export default MentorCompliancePage;