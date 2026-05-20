import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaFilter,
  FaPlus,
  FaDownload,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";
import "./CandidateCertificate.css";

const CandidateCertifications = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    expiringSoon: 0,
    nextRenewal: 'No renewals'
  });

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
  const candidateId = candidateData?.user_id;

  // Fetch certifications on component mount
  useEffect(() => {
    if (candidateId) {
      fetchCertifications();
    }
  }, [candidateId]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/candidate/certifications/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCertifications(result.data);
        calculateStats(result.data);
        console.log('✅ Certifications loaded:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch certifications');
      }
    } catch (err) {
      console.error('Error fetching certifications:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Certifications',
        text: err.message || 'An error occurred while loading certifications',
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (certData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let active = 0;
    let expiringSoon = 0;
    let nextRenewalDate = null;
    
    console.log('=== Calculating Stats ===');
    console.log('Today:', today.toISOString().split('T')[0]);
    console.log('30 days from now:', thirtyDaysFromNow.toISOString().split('T')[0]);
    
    certData.forEach(cert => {
      const expiryDate = new Date(cert.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      
      const issueDate = new Date(cert.issue_date);
      issueDate.setHours(0, 0, 0, 0);
      
      console.log(`Certificate: ${cert.certificate_number}`);
      console.log(`  Expiry: ${expiryDate.toISOString().split('T')[0]}`);
      console.log(`  Status: ${cert.status}`);
      console.log(`  Is Approved: ${cert.is_approved}`);
      
      // Active Certification Logic:
      // 1. Certificate status is 'approved' OR is_approved is true
      // 2. Expiry date is in the future (expiryDate > today)
      // 3. Issue date is today or in the past (issueDate <= today)
      const isActiveStatus = cert.status === 'approved' || cert.is_approved === true;
      
      if (isActiveStatus && expiryDate > today && issueDate <= today) {
        active++;
        console.log(`  ✅ ACTIVE`);
        
        // Expiring Soon Logic:
        // 1. Certificate is active (already checked above)
        // 2. Expiry date is within next 30 days (expiryDate <= thirtyDaysFromNow)
        if (expiryDate <= thirtyDaysFromNow) {
          expiringSoon++;
          console.log(`  ⚠️ EXPIRING SOON`);
        }
        
        // Track next renewal date (closest expiry date)
        if (!nextRenewalDate || expiryDate < nextRenewalDate) {
          nextRenewalDate = expiryDate;
        }
      } else {
        console.log(`  ❌ NOT ACTIVE - Reasons:`);
        if (!isActiveStatus) console.log(`     - Not approved (status: ${cert.status})`);
        if (expiryDate <= today) console.log(`     - Expired`);
        if (issueDate > today) console.log(`     - Not yet issued`);
      }
    });
    
    console.log('=== Final Stats ===');
    console.log('Active:', active);
    console.log('Expiring Soon:', expiringSoon);
    console.log('Next Renewal:', nextRenewalDate);
    
    setStats({
      active,
      expiringSoon,
      nextRenewal: nextRenewalDate ? formatNextRenewalDate(nextRenewalDate) : 'No renewals'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNextRenewalDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewalDate = new Date(date);
    renewalDate.setHours(0, 0, 0, 0);
    
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return `in ${diffDays} days`;
    if (diffDays <= 30) return formattedDate;
    
    return formattedDate;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day remaining';
    if (diffDays <= 30) return `${diffDays} days remaining`;
    return `${diffDays} days remaining`;
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry > today ? 'valid' : 'expired';
  };

  // FIXED: Use status field as primary source for approval status
  const getApprovalStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return {
          text: 'Approved',
          class: 'approved',
          icon: <FaCheckCircle />
        };
      case 'pending':
        return {
          text: 'Pending',
          class: 'pending',
          icon: <FaClock />
        };
      case 'rejected':
        return {
          text: 'Rejected',
          class: 'rejected',
          icon: <FaTimesCircle />
        };
      default:
        return {
          text: 'Pending',
          class: 'pending',
          icon: <FaClock />
        };
    }
  };

  // FIXED: Use status field to determine if certificate is approved
  const isCertificateApproved = (status) => {
    return status?.toLowerCase() === 'approved';
  };

  const getCardStatusClass = (status, expiryDate, issueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const issue = new Date(issueDate);
    issue.setHours(0, 0, 0, 0);
    
    const isApproved = isCertificateApproved(status);
    
    if (!isApproved) return 'pending';
    if (expiry <= today) return 'expired';
    if (issue > today) return 'pending';
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry <= thirtyDaysFromNow) return 'expiring';
    return 'valid';
  };

  const handleAddCertificate = () => {
    navigate("/candidate-certifications/add");
  };

  const handleEditCertificate = (certId) => {
    navigate(`/candidate-certifications/add/${certId}`);
  };

  const handleDeleteCertificate = async (certId, certName) => {
    const result = await Swal.fire({
      title: 'Delete Certificate?',
      html: `Are you sure you want to delete <strong>${certName}</strong>?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/candidate/certifications/${certId}/`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedCertifications = certifications.filter(cert => cert.id !== certId);
        setCertifications(updatedCertifications);
        calculateStats(updatedCertifications);
        
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Certificate has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error deleting certification:', err);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.message || 'Failed to delete certificate. Please try again.',
          showConfirmButton: true
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDownloadCertificate = async (certId) => {
    try {
      const certification = certifications.find(cert => cert.id === certId);
      if (certification && certification.document) {
        const fileUrl = `${BASE_URL}${certification.document}`;
        window.open(fileUrl, '_blank');
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No Document',
          text: 'No document available for this certification.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Error downloading certificate:', err);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to download certificate. Please try again.',
        showConfirmButton: true
      });
    }
  };

  const handleVerifyCertificate = (certNumber) => {
    Swal.fire({
      icon: 'info',
      title: 'Verification',
      text: `Verifying certificate: ${certNumber}`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  if (loading) {
    return (
      <div className="ccert-layout-wrapper">
        <CandidateSidebar />
        <div className="ccert-main-wrapper">
          <Header />
          <div className="ccert-content-area">
            <div className="ccert-loading-container">
              <FaSpinner className="ccert-spinner" />
              <p>Loading certifications...</p>
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

        <div className="ccert-content-area container-fluid">
          <div className="ccert-page-header">
            <div>
              <h3 className="ccert-title">Certifications</h3>
              <p className="ccert-sub">
                Manage your professional certifications and credentials
              </p>
            </div>

            <div className="ccert-header-actions">
              <button className="ccert-btn-outline">
                <FaFilter /> Filter
              </button>

              <button className="ccert-btn-primary" onClick={handleAddCertificate}>
                <FaPlus /> Add Certification
              </button>
            </div>
          </div>

          <div className="ccert-stats-grid">
            <StatCard
              icon={<FaCheckCircle />}
              value={stats.active.toString()}
              label="Active Certifications"
              type="success"
            />

            <StatCard
              icon={<FaExclamationTriangle />}
              value={stats.expiringSoon.toString()}
              label="Expiring Soon"
              type="warning"
            />

            <StatCard
              icon={<FaCalendarAlt />}
              value={stats.nextRenewal}
              label="Next Renewal"
              type="info"
            />
          </div>

          <div className="ccert-card">
            <div className="ccert-card-header">
              <div>
                <h5>Your Certifications</h5>
                <p className="ccert-muted">All your professional credentials</p>
              </div>
              <span className="ccert-count-badge">{certifications.length} Total</span>
            </div>

            {certifications.length === 0 ? (
              <div className="ccert-empty-state">
                <div className="ccert-empty-icon">
                  <FaCheckCircle />
                </div>
                <h6>No Certifications Found</h6>
                <p className="ccert-muted">Start by adding your first certification</p>
                <button className="ccert-btn-primary" onClick={handleAddCertificate}>
                  <FaPlus /> Add Certification
                </button>
              </div>
            ) : (
              <div className="ccert-certificates-list">
                {certifications.map(cert => {
                  // FIXED: Pass only status to getApprovalStatusInfo
                  const approvalInfo = getApprovalStatusInfo(cert.status);
                  const expiryStatus = getExpiryStatus(cert.expiry_date);
                  const cardStatus = getCardStatusClass(cert.status, cert.expiry_date, cert.issue_date);
                  
                  return (
                    <CertificationCard
                      key={cert.id}
                      id={cert.id}
                      cardStatus={cardStatus}
                      approvalStatus={cert.status}
                      approvalStatusText={approvalInfo.text}
                      approvalStatusClass={approvalInfo.class}
                      approvalIcon={approvalInfo.icon}
                      title={cert.certificate_number}
                      org={cert.issuing_authority}
                      certificationName={cert.certification_name || "Certification"}
                      issued={formatDisplayDate(cert.issue_date)}
                      expiry={formatDisplayDate(cert.expiry_date)}
                      remaining={calculateRemainingDays(cert.expiry_date)}
                      expiryStatus={expiryStatus}
                      onEdit={handleEditCertificate}
                      onDelete={handleDeleteCertificate}
                      onDownload={handleDownloadCertificate}
                      onVerify={handleVerifyCertificate}
                      document={cert.document}
                      actionLoading={actionLoading}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="ccert-card">
            <div className="ccert-card-header">
              <div>
                <h5>Recommended Certifications</h5>
                <p className="ccert-muted">
                  Based on your career progression
                </p>
              </div>
            </div>

            <div className="ccert-recommended-grid">
              <RecommendedCard
                title="API 570 Piping Inspector"
                exam="March 2024"
                level="high"
              />

              <RecommendedCard
                title="CSWIP 3.2 Senior Welding Inspector"
                exam="April 2024"
                level="medium"
              />

              <RecommendedCard
                title="ASNT NDT Level II (UT)"
                exam="February 2024"
                level="high"
              />

              <RecommendedCard
                title="NACE CIP Level 2"
                exam="May 2024"
                level="medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ icon, value, label, type }) => (
  <div className="ccert-stat-card">
    <div className={`ccert-stat-icon ${type}`}>
      {icon}
    </div>
    <div className="ccert-stat-content">
      <h4>{value}</h4>
      <p>{label}</p>
    </div>
  </div>
);

/* ================= CERTIFICATION CARD ================= */
const CertificationCard = ({
  id,
  cardStatus,
  approvalStatus,
  approvalStatusText,
  approvalStatusClass,
  approvalIcon,
  title,
  org,
  certificationName,
  issued,
  expiry,
  remaining,
  expiryStatus,
  onEdit,
  onDelete,
  onDownload,
  onVerify,
  document,
  actionLoading
}) => (
  <div className={`ccert-certificate-item ${cardStatus}`}>
    <div className="ccert-certificate-main">
      <div className="ccert-certificate-icon">
        {approvalIcon}
      </div>

      <div className="ccert-certificate-info">
        <div className="ccert-certificate-header">
          <h6>{title}</h6>
          <span className={`ccert-status-tag ${approvalStatusClass}`}>
            {approvalStatusText}
          </span>
        </div>
        
        <p className="ccert-organization">{org}</p>
        
        <div className="ccert-certificate-meta">
          <span className="ccert-meta-tag">{certificationName}</span>
        </div>

        <div className="ccert-dates-grid">
          <div className="ccert-date-item">
            <span className="ccert-date-label">Issue Date</span>
            <span className="ccert-date-value">{issued}</span>
          </div>
          <div className="ccert-date-item">
            <span className="ccert-date-label">Expiry Date</span>
            <span className="ccert-date-value">{expiry}</span>
          </div>
        </div>
      </div>

      <div className="ccert-certificate-actions">
        <button 
          className="ccert-action-btn ccert-edit-btn"
          onClick={() => onEdit(id)}
          title="Edit Certificate"
        >
          <FaEdit />
        </button>
        <button 
          className="ccert-action-btn ccert-delete-btn"
          onClick={() => onDelete(id, title)}
          disabled={actionLoading}
          title="Delete Certificate"
        >
          <FaTrash />
        </button>
        <button 
          className="ccert-action-btn ccert-download-btn"
          onClick={() => onDownload(id)}
          disabled={!document}
          title="Download Certificate"
        >
          <FaDownload />
        </button>
        <button 
          className="ccert-action-btn ccert-verify-btn"
          onClick={() => onVerify(title)}
          title="Verify Certificate"
        >
          <FaExternalLinkAlt />
        </button>
      </div>
    </div>

    {approvalStatus === 'approved' && expiryStatus === 'valid' && (
      <div className="ccert-certificate-progress">
        <div className={`ccert-progress-bar ${cardStatus}`} />
      </div>
    )}
  </div>
);

const RecommendedCard = ({ title, exam, level }) => (
  <div className="ccert-recommend-item">
    <div className="ccert-recommend-header">
      <h6>{title}</h6>
      <span className={`ccert-relevance-badge ${level}`}>
        {level === "high" ? "High" : "Medium"}
      </span>
    </div>
    <p className="ccert-exam-date">Next exam: {exam}</p>
    <button className="ccert-learn-more-btn">
      Learn More
    </button>
  </div>
);

export default CandidateCertifications;