// CandidateComplianceDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import { FaShieldAlt, FaExclamationTriangle, FaCheck, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "./CandidateCompliance.css";
import { BASE_URL } from "../../../ApiUrl";

const CandidateComplianceDashboard = () => {
  const navigate = useNavigate();
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = `${BASE_URL}/api/candidate/compliance-certificates/`;

  // Fetch compliance certificates on component mount
  useEffect(() => {
    fetchComplianceCertificates();
  }, []);

  const fetchComplianceCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch compliance certificates");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setComplianceData(result.data);
        console.log("Fetched compliance data:", result.data);
      } else {
        throw new Error(result.message || "No data received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching compliance:", err);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete certificate
  const handleDeleteCertificate = async (certificateId, certificateName) => {
    const result = await Swal.fire({
      title: 'Delete Certificate?',
      html: `Are you sure you want to delete <strong>${certificateName}</strong>?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setDeleteLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/candidate/compliance-certificates/${certificateId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete certificate");
        }

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Certificate has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh the list
        fetchComplianceCertificates();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Failed to delete certificate. Please try again.',
        });
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Calculate statistics from fetched data
  const calculateStats = () => {
    const total = complianceData.length;
    const compliant = complianceData.filter(item => item.compliance_status === "compliant").length;
    const nonCompliant = complianceData.filter(item => item.compliance_status === "non_compliant").length;
    const pending = complianceData.filter(item => item.status === "pending").length;
    
    return { total, compliant, nonCompliant, pending };
  };

  const stats = calculateStats();
  const complianceScore = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
  const deployable = stats.nonCompliant === 0;
  const needsAttention = stats.nonCompliant + stats.pending;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "compliant":
        return "success";
      case "non_compliant":
        return "warning";
      default:
        return "warning";
    }
  };

  return (
    <div className="ccd-layout-wrapper">
      <CandidateSidebar />

      <div className="ccd-main-content">
        <Header />

        <div className="ccd-content-wrapper">
          <div className="container-fluid">

            {/* ================= HEADER ================= */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="ccd-title">Compliance & Safety</h2>
                <p className="ccd-subtitle">
                  Your compliance status and safety requirements
                </p>
              </div>

              <div>
                <button 
                  className="btn ccd-add-btn me-2"
                  onClick={() => navigate('/candidate-compliance/add-certificate')}
                >
                  <FaPlus className="me-1" /> Add Certificate
                </button>
                {/* <button className="btn ccd-review-btn">
                  Schedule Review
                </button> */}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading compliance data...</p>
              </div>
            ) : (
              <>
                {/* ================= SUMMARY ================= */}
                <div className="row g-4 mb-4">
                  {/* Compliance Score */}
                  <div className="col-lg-6">
                    <div className="ccd-card d-flex align-items-center">
                      <div className="ccd-circle">
                        {complianceScore}%
                      </div>
                      <div className="ms-4">
                        <h5>Compliance Score</h5>
                        <p className="ccd-muted">{stats.compliant} of {stats.total} requirements met</p>
                        <div>
                          <span className="ccd-badge-success">{stats.compliant} Compliant</span>
                          {stats.nonCompliant > 0 && (
                            <span className="ccd-badge-warning ms-2">{stats.nonCompliant} Non-Compliant</span>
                          )}
                          {stats.pending > 0 && (
                            <span className="ccd-badge-warning ms-2">{stats.pending} Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deployable */}
                  <div className="col-lg-3">
                    <div className="ccd-card text-center">
                      <FaShieldAlt className={deployable ? "ccd-icon-success" : "ccd-icon-warning"} />
                      <h4>{deployable ? "Yes" : "No"}</h4>
                      <p className="ccd-muted">Deployable Status</p>
                    </div>
                  </div>

                  {/* Attention */}
                  <div className="col-lg-3">
                    <div className="ccd-card text-center">
                      <FaExclamationTriangle className="ccd-icon-warning" />
                      <h4>{needsAttention}</h4>
                      <p className="ccd-muted">Items Need Attention</p>
                    </div>
                  </div>
                </div>

                {/* ================= MAIN SECTION ================= */}
                <div className="row g-4">

                  {/* REQUIREMENTS - Now populated from API */}
                  <div className="col-lg-8">
                    <div className="ccd-card">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Compliance Requirements</h4>
                      </div>
                      <p className="ccd-muted">
                        All your safety and compliance items
                      </p>

                      {complianceData.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted">No compliance certificates found.</p>
                          <button 
                            className="btn btn-primary mt-2"
                            onClick={() => navigate('/candidate-compliance/add-certificate')}
                          >
                            <FaPlus /> Add Your First Certificate
                          </button>
                        </div>
                      ) : (
                        complianceData.map((item) => (
                          <Requirement 
                            key={item.id}
                            status={getStatusClass(item.compliance_status)}
                            title={item.compliance_rule_name}
                            subtitle={`Certificate: ${item.certificate_number || 'N/A'}`}
                            badge={item.compliance_status === "compliant" ? "Compliant" : "Non-Compliant"}
                            expiry={item.expiry_date ? `Expires: ${formatDate(item.expiry_date)}` : null}
                            checked={`Checked: ${formatDate(item.issue_date)}`}
                            onEdit={() => navigate(`/candidate-compliance/edit-certificate/${item.id}`)}
                            onDelete={() => handleDeleteCertificate(item.id, item.compliance_rule_name)}
                            issuingAuthority={item.issuing_authority}
                            deleteLoading={deleteLoading}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANEL */}
                  <div className="col-lg-4">
                    {/* PPE Checklist */}
                    <div className="ccd-card mb-4">
                      <h5>PPE Checklist</h5>
                      <p className="ccd-muted">Personal Protective Equipment</p>

                      <PPE label="Safety Helmet" />
                      <PPE label="Safety Glasses" />
                      <PPE label="Safety Boots" />
                      <PPE label="Hi-Vis Vest" />
                      <PPE label="Gloves" />
                      <PPE label="Hearing Protection" />
                      <PPE label="Coveralls" warning />
                      <PPE label="Fall Protection Harness" />

                      <div className="ccd-progress">
                        <div className="ccd-progress-fill" />
                      </div>

                      <p className="text-end small">Completion 7/8</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="ccd-card">
                      <h5>Quick Actions</h5>
                      <button 
                        className="ccd-action-btn"
                        onClick={() => navigate('/candidate-compliance/add-certificate')}
                      >
                        Add New Certificate
                      </button>
                      <button className="ccd-action-btn">Report Incident</button>
                      <button className="ccd-action-btn">Book Medical</button>
                      <button className="ccd-action-btn">Update PPE</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */
const Requirement = ({ 
  title, 
  subtitle, 
  badge, 
  expiry, 
  checked, 
  status, 
  onEdit, 
  onDelete, 
  issuingAuthority,
  deleteLoading 
}) => (
  <div className={`ccd-req ${status}`}>
    <div className="ccd-req-content">
      <div className="ccd-req-main">
        <strong>{title}</strong>
        {badge && <span className="ccd-small-badge">{badge}</span>}
      </div>
      {subtitle && <p className="ccd-muted">{subtitle}</p>}
      {issuingAuthority && <p className="ccd-muted small">Authority: {issuingAuthority}</p>}
    </div>
    <div className="ccd-req-actions">
      <div className="ccd-req-dates">
        {expiry && <p className="ccd-expiry">{expiry}</p>}
        {checked && <p className="ccd-muted small">{checked}</p>}
      </div>
      <div className="ccd-req-buttons">
        {onEdit && (
          <button 
            className="ccd-edit-btn"
            onClick={onEdit}
            title="Edit Certificate"
          >
            <FaEdit />
          </button>
        )}
        {onDelete && (
          <button 
            className="ccd-delete-btn"
            onClick={onDelete}
            disabled={deleteLoading}
            title="Delete Certificate"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  </div>
);

const PPE = ({ label, warning }) => (
  <div className={`ccd-ppe ${warning ? "warning" : ""}`}>
    <span>{label}</span>
    {warning ? "⚠" : <FaCheck />}
  </div>
);

export default CandidateComplianceDashboard;