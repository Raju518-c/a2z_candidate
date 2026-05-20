import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./ComplianceManagement.css";
import {
  FaShieldAlt,
  FaHeartbeat,
  FaExclamationTriangle,
  FaBalanceScale,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLayerGroup,
  FaTimes,
  FaSave,
  FaFile,
  FaDownload,
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const ComplianceManagement = () => {
  const navigate = useNavigate();
  const [complianceRules, setComplianceRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complianceCertificates, setComplianceCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [activeTab, setActiveTab] = useState("certificate");

  const [summaryData, setSummaryData] = useState({
    safetyInduction: 0,
    medicalValidity: 0,
    incidentTracking: 0,
    ethicsViolations: 0
  });

  useEffect(() => {
    fetchComplianceRules();
    fetchCategories();
    fetchComplianceCertificates();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const result = await response.json();
      if (result.status && result.data) {
        setCategories(result.data);
      } else if (Array.isArray(result)) {
        setCategories(result);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load categories',
        timer: 3000
      });
    }
  };

  const fetchComplianceCertificates = async () => {
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
    }
  };

  const handleViewDetails = (certificate) => {
    setSelectedCertificate(certificate);
    setActiveTab("certificate");
    setShowModal(true);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a category name',
        timer: 2000
      });
      return;
    }

    setCategoryLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_name: newCategoryName })
      });

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      const result = await response.json();
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Category added successfully',
        timer: 2000,
        showConfirmButton: false
      });

      setNewCategoryName("");
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to add category',
        timer: 3000
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleStartEdit = (categoryId, categoryName) => {
    setEditingCategory(categoryId);
    setNewCategoryName(categoryName);
    setEditCategoryName(categoryName);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setEditCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a category name',
        timer: 2000
      });
      return;
    }

    setCategoryLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/${editingCategory}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_name: newCategoryName })
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Category updated successfully',
        timer: 2000,
        showConfirmButton: false
      });

      setEditingCategory(null);
      setNewCategoryName("");
      setEditCategoryName("");
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update category',
        timer: 3000
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const ruleCount = complianceRules.filter(rule => rule.category === categoryId).length;
    
    if (ruleCount > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete',
        text: `This category has ${ruleCount} rule(s). Please delete or move the rules first.`,
        timer: 3000
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${categoryName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/compliance-categories/${categoryId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Category deleted successfully',
          timer: 2000,
          showConfirmButton: false
        });

        await fetchCategories();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete category',
          timer: 3000
        });
      }
    }
  };

  const fetchComplianceRules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/`);

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const result = await response.json();

      if (result.status && result.data) {
        setComplianceRules(result.data);
        updateSummaryData(result.data);
      } else if (Array.isArray(result)) {
        setComplianceRules(result);
        updateSummaryData(result);
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load compliance rules',
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSummaryData = (rules) => {
    const counts = {
      safetyInduction: 0,
      medicalValidity: 0,
      incidentTracking: 0,
      ethicsViolations: 0
    };
    
    rules.forEach(rule => {
      const categoryName = rule.complience_category?.category_name?.toLowerCase() || '';
      
      if (categoryName.includes('safety')) {
        counts.safetyInduction++;
      } else if (categoryName.includes('medical')) {
        counts.medicalValidity++;
      } else if (categoryName.includes('incident')) {
        counts.incidentTracking++;
      } else if (categoryName.includes('ethics')) {
        counts.ethicsViolations++;
      }
    });
    
    setSummaryData(counts);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId || cat.category_id === categoryId);
    return category ? category.category_name : categoryId;
  };

  const formatRules = (rule) => {
    return [
      { label: "Validity Period", value: rule.validity_period_months || "-", unit: "months" },
      { label: "Renewal Warning", value: rule.renewal_warning_days || "-", unit: "days before" },
      { label: "Grace Period", value: rule.grace_period_days || "-", unit: "days" },
      { label: "Check Interval", value: rule.mandatory_check_interval_months || "-", unit: "months" }
    ];
  };

  const getIcon = (categoryId) => {
    const categoryName = getCategoryName(categoryId).toLowerCase();
    if (categoryName.includes('safety')) {
      return <FaShieldAlt />;
    } else if (categoryName.includes('medical')) {
      return <FaHeartbeat />;
    } else if (categoryName.includes('incident')) {
      return <FaExclamationTriangle />;
    } else if (categoryName.includes('ethics')) {
      return <FaBalanceScale />;
    }
    return <FaLayerGroup />;
  };

  const getCategoryTitle = (categoryId) => {
    const categoryName = getCategoryName(categoryId);
    return categoryName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddCompliance = () => {
    navigate("/compliance/add");
  };

  const handleEditRule = (ruleId) => {
    navigate(`/compliance/edit/${ruleId}`);
  };

  const handleDeleteRule = async (ruleId, ruleName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${ruleName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setDeletingId(ruleId);
          const response = await fetch(`${BASE_URL}/api/admin/compliance-rules/${ruleId}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error('Failed to delete compliance rule');
          }

          return true;
        } catch (error) {
          Swal.showValidationMessage(`Delete failed: ${error.message}`);
          throw error;
        } finally {
          setDeletingId(null);
        }
      }
    });

    if (result.isConfirmed) {
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Compliance rule has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      await fetchComplianceRules();
    }
  };

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

  const getStatusDisplay = (cert) => {
    if (!cert.is_approved) return "pending";
    const today = new Date();
    const expiryDate = new Date(cert.expiry_date);
    if (expiryDate < today) return "expired";
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    if (expiryDate <= thirtyDaysFromNow) return "expiring";
    return "valid";
  };

  const getSeverityFromStatus = (complianceStatus) => {
    if (complianceStatus === 'non_compliant') return 'high';
    if (complianceStatus === 'partially_compliant') return 'medium';
    return 'low';
  };

  const getStatusFromCompliance = (complianceStatus) => {
    if (complianceStatus === 'non_compliant') return 'open';
    if (complianceStatus === 'partially_compliant') return 'investigating';
    return 'resolved';
  };

  const getDocumentUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}${path}`;
  };

  const handleDownload = (url, filename) => {
    window.open(url, '_blank');
  };

  // Group rules by category for better display
  const groupedRules = complianceRules.reduce((acc, rule) => {
    const categoryId = rule.category;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(rule);
    return acc;
  }, {});

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area compliance-page">
          {/* HEADER */}
          <div className="compliance-header">
            <div>
              <h2>Compliance Management</h2>
              <p>Configure compliance rules and track violations</p>
            </div>

            <div className="header-buttons">
              <button
                className="btn btn-primary compliance-config-btn"
                onClick={handleAddCompliance}
              >
                <FaPlus /> Add Compliance Rule
              </button>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="row g-4">
            <SummaryCard 
              title="Safety Induction" 
              value={summaryData.safetyInduction} 
              icon={<FaShieldAlt />} 
              subtitle="Configure validity and threshold rules"
            />
            <SummaryCard 
              title="Medical Validity" 
              value={summaryData.medicalValidity} 
              icon={<FaHeartbeat />}
              subtitle="Configure validity and threshold rules"
            />
            <SummaryCard 
              title="Incident Tracking" 
              value={summaryData.incidentTracking} 
              icon={<FaExclamationTriangle />}
              subtitle="Configure validity and threshold rules"
            />
            <SummaryCard 
              title="Ethics Violations" 
              value={summaryData.ethicsViolations} 
              icon={<FaBalanceScale />}
              subtitle="Configure validity and threshold rules"
            />
          </div>

          {/* CATEGORIES TABLE */}
          <div className="compliance-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
              <div>
                <h4>Compliance Categories</h4>
                <p className="subtext mb-0">Manage compliance categories and their configurations</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  placeholder={editingCategory ? "Edit category name" : "Enter category name"}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ width: '250px' }}
                  disabled={categoryLoading}
                />
                {editingCategory ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={handleUpdateCategory}
                      disabled={categoryLoading}
                    >
                      {categoryLoading ? 'Updating...' : <><FaSave /> Update</>}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={categoryLoading}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleAddCategory}
                    disabled={categoryLoading}
                  >
                    {categoryLoading ? 'Adding...' : <><FaPlus /> Add Category</>}
                  </button>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table compliance-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Total Rules</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      const categoryId = category.id || category.category_id;
                      const ruleCount = complianceRules.filter(rule => rule.category === categoryId).length;
                      
                      return (
                        <tr key={categoryId}>
                          <td>{categoryId}</td>
                          <td>
                            <div className="category-name">
                              {getIcon(categoryId)}
                              <span className="ms-2">{category.category_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{ruleCount} Rules</span>
                          </td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handleStartEdit(categoryId, category.category_name)}
                              title="Edit Category"
                              disabled={editingCategory !== null}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCategory(categoryId, category.category_name)}
                              title="Delete Category"
                              disabled={ruleCount > 0 || editingCategory !== null}
                            >
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <p className="mb-0">No categories found. Enter a category name above to create one.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RULES CARDS - Grouped by Category */}
          {loading ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading compliance rules...</p>
            </div>
          ) : (
            <div className="row g-4 mt-1">
              {Object.keys(groupedRules).length > 0 ? (
                Object.keys(groupedRules).map((categoryId) => (
                  <RuleCard
                    key={categoryId}
                    title={getCategoryTitle(categoryId)}
                    icon={getIcon(categoryId)}
                    rules={groupedRules[categoryId]}
                    onEdit={handleEditRule}
                    onDelete={handleDeleteRule}
                    formatRules={formatRules}
                    deletingId={deletingId}
                  />
                ))
              ) : (
                <div className="col-12 text-center mt-4">
                  <div className="compliance-card">
                    <p className="mb-0">No compliance rules found. Click "Add Compliance Rule" to create one.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECENT INCIDENTS TABLE - Updated with real data */}
          <div className="compliance-card mt-4">
            <h4>Recent Incidents</h4>
            <p className="subtext">Track and manage compliance incidents</p>

            <div className="table-responsive">
              <table className="table compliance-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Candidate</th>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceCertificates.length > 0 ? (
                    complianceCertificates.map((cert) => (
                      <IncidentRow
                        key={cert.id}
                        type={cert.compliance_rule_name}
                        candidate={cert.candidate_name}
                        issueDate={formatDate(cert.issue_date)}
                        expiryDate={formatDate(cert.expiry_date)}
                        severity={getSeverityFromStatus(cert.compliance_status)}
                        status={cert.status}
                        onView={() => handleViewDetails(cert)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <p className="mb-0">No compliance incidents found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Compliance Certificate Details */}
      {showModal && selectedCertificate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Compliance Certificate Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
                onClick={() => setActiveTab('certificate')}
              >
                <FaIdCard /> Certificate Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidate')}
              >
                <FaUser /> Candidate Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'document' ? 'active' : ''}`}
                onClick={() => setActiveTab('document')}
              >
                <FaFile /> Document
              </button>
            </div>

            <div className="modal-body">
              {/* Certificate Information Tab */}
              {activeTab === 'certificate' && (
                <div className="info-section">
                  <h4>Certificate Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Certificate Number:</label>
                      <span>{selectedCertificate.certificate_number}</span>
                    </div>
                    <div className="info-item">
                      <label>Compliance Rule:</label>
                      <span>{selectedCertificate.compliance_rule_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Issuing Authority:</label>
                      <span>{selectedCertificate.issuing_authority}</span>
                    </div>
                    <div className="info-item">
                      <label>Issue Date:</label>
                      <span>{formatDate(selectedCertificate.issue_date)}</span>
                    </div>
                    <div className="info-item">
                      <label>Expiry Date:</label>
                      <span>{formatDate(selectedCertificate.expiry_date)}</span>
                    </div>
                    <div className="info-item">
                      <label>Compliance Status:</label>
                      <span className={`status-badge ${selectedCertificate.compliance_status}`}>
                        {selectedCertificate.compliance_status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Certificate Status:</label>
                      <span className={`status-badge ${getStatusDisplay(selectedCertificate)}`}>
                        {getStatusDisplay(selectedCertificate)}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Approval Status:</label>
                      <span>{selectedCertificate.is_approved ? "Approved" : "Pending"}</span>
                    </div>
                    {selectedCertificate.approved_at && (
                      <div className="info-item">
                        <label>Approved At:</label>
                        <span>{formatDateTime(selectedCertificate.approved_at)}</span>
                      </div>
                    )}
                    {selectedCertificate.approval_remarks && (
                      <div className="info-item">
                        <label>Approval Remarks:</label>
                        <span>{selectedCertificate.approval_remarks}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Created At:</label>
                      <span>{formatDateTime(selectedCertificate.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Updated:</label>
                      <span>{formatDateTime(selectedCertificate.updated_at)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidate Information Tab */}
              {activeTab === 'candidate' && (
                <div className="info-section">
                  <h4>Candidate Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Candidate ID:</label>
                      <span>{selectedCertificate.candidate}</span>
                    </div>
                    <div className="info-item">
                      <label>Candidate Name:</label>
                      <span>{selectedCertificate.candidate_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Compliance Rule ID:</label>
                      <span>{selectedCertificate.compliance_rule}</span>
                    </div>
                    <div className="info-item">
                      <label>Compliance Rule Name:</label>
                      <span>{selectedCertificate.compliance_rule_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Approved By Mentor:</label>
                      <span>{selectedCertificate.approved_by_mentor || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Tab */}
              {activeTab === 'document' && (
                <div className="info-section">
                  <h4>Certificate Document</h4>
                  {selectedCertificate.document && (
                    <div className="document-preview">
                      <div className="document-card">
                        <FaFile className="document-icon" />
                        <div className="document-info">
                          <p className="document-name">
                            {selectedCertificate.document.split('/').pop()}
                          </p>
                          <p className="document-size">
                            Compliance Certificate Document
                          </p>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownload(getDocumentUrl(selectedCertificate.document), selectedCertificate.document.split('/').pop())}
                          >
                            <FaDownload /> Download Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPONENTS */
const SummaryCard = ({ title, value, icon, subtitle }) => (
  <div className="col-lg-3 col-md-6">
    <div className="compliance-card summary-card">
      <div className="summary-icon">{icon}</div>
      <div className="summary-content">
        <h4>{title}</h4>
        <p className="summary-subtitle">{subtitle || "Configure validity and threshold rules"}</p>
        <div className="summary-value">
          <span className="value-number">{value}</span>
          <span className="value-label">Active Rules</span>
        </div>
      </div>
    </div>
  </div>
);

const RuleCard = ({ title, icon, rules, onEdit, onDelete, formatRules, deletingId }) => {
  const rule = rules[0];
  const formattedRules = formatRules(rule);
  const isDeleting = deletingId === rule.id;

  return (
    <div className="col-lg-6 col-md-6">
      <div className="compliance-card compliance-rule-card">

        {/* Header */}
        <div className="compliance-rule-header">
          <div className="compliance-rule-icon">
            {icon}
          </div>

          <div className="compliance-rule-title">
            <h5>{title}</h5>
            <p>Configure validity and threshold rules</p>
          </div>

          {/* Icon Actions */}
          <div className="compliance-rule-actions">
            <button
              className="rule-icon-btn edit-btn"
              onClick={() => onEdit(rule.id)}
              disabled={isDeleting}
              title="Edit"
            >
              <FaEdit />
            </button>

            <button
              className="rule-icon-btn delete-btn"
              onClick={() =>
                onDelete(rule.id, rule.name || rule.rule_name || title)
              }
              disabled={isDeleting}
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="compliance-rule-body">
          {formattedRules.slice(0,3).map((item, idx) => (
            <div className="compliance-rule-row" key={idx}>
              <span className="compliance-rule-label">
                {item.label}
              </span>

              <span className="compliance-rule-value">
                {item.value} {item.unit}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const IncidentRow = ({ type, candidate, issueDate, expiryDate, severity, status, onView }) => (
  <tr>
    <td>{type}</td>
    <td>{candidate}</td>
    <td>{issueDate}</td>
    <td>{expiryDate}</td>
    <td>
      <span className={`pill severity ${severity}`}>{severity}</span>
    </td>
    <td>
      <span className={`pill status ${status}`}>{status}</span>
    </td>
    <td>
      <button className="btn btn-outline-primary btn-sm" onClick={onView}>
        View
      </button>
    </td>
  </tr>
);

export default ComplianceManagement;