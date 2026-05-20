// Certifications.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Certificate.css";
import { FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaTags, FaTimes, FaFile, FaImage, FaVideo, FaDownload, FaUser, FaBuilding, FaGraduationCap, FaCalendarAlt, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint, FaUserMd, FaEdit, FaList, FaCertificate, FaGlobe, FaHashtag, FaInfoCircle } from "react-icons/fa";
import { BASE_URL } from "../../../ApiUrl";

const Certifications = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("candidate");
  const [mainTab, setMainTab] = useState("categories"); // 'categories' or 'certificates'
  const [selectedCategory, setSelectedCategory] = useState(null); // For filtering certificates by category

  const API_URL = `${BASE_URL}/api/admin/certification-categories`;
  const CERT_API_URL = `${BASE_URL}/api/candidate/certifications/`;
  const COMPETENCY_API_URL = `${BASE_URL}/api/candidate/competencies/`;
  const CANDIDATE_API_URL = `${BASE_URL}/api/candidate/candidates/`;

  // FETCH ALL DATA ON COMPONENT MOUNT
  useEffect(() => {
    fetchCertifications();
    fetchCategories();
    fetchCompetencies();
    fetchCandidates();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(CERT_API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch certifications");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCertifications(result.data);
        console.log("Fetched certifications:", result.data);
      } else {
        throw new Error(result.message || "No data received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching certifications:", err);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCategories(result.data);
        console.log("Fetched categories:", result.data);
      } else {
        throw new Error(result.message || "No data received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching categories:", err);
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchCompetencies = async () => {
    try {
      const response = await fetch(COMPETENCY_API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch competencies");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCompetencies(result.data);
        console.log("Fetched competencies:", result.data);
      } else {
        throw new Error(result.message || "No data received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching competencies:", err);
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch(CANDIDATE_API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      
      const result = await response.json();
      
      if (result.status && result.data) {
        setCandidates(result.data);
        console.log("Fetched candidates:", result.data);
      } else {
        throw new Error(result.message || "No data received");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching candidates:", err);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleViewDetails = async (cert) => {
    setSelectedCert(cert);
    setActiveTab("candidate");
    
    // Find candidate details by matching ID
    if (cert.candidate) {
      const candidate = candidates.find(c => c.id === cert.candidate);
      setSelectedCandidate(candidate || null);
      console.log("Found candidate:", candidate);
    } else {
      setSelectedCandidate(null);
    }
    
    // Find competency details if competency ID exists
    if (cert.competency) {
      const competency = competencies.find(comp => comp.id === cert.competency);
      setSelectedCompetency(competency);
    } else {
      setSelectedCompetency(null);
    }
    
    setShowModal(true);
  };

  // Navigate to edit category page with category data
  const handleEditCategory = (category) => {
    navigate('/certification-categories', { 
      state: { 
        categoryToEdit: category,
        isEditing: true 
      } 
    });
  };

  // Navigate to add new category page
  const handleAddCategory = () => {
    navigate('/certification-categories', { 
      state: { 
        isEditing: false 
      } 
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      const savedCategory = await response.json();
      setCategories([...categories, savedCategory]);
      setSuccess("Category created successfully!");
      
      setFormData({ name: "", description: "" });
      await fetchCategories();
      
      setTimeout(() => {
        navigate('/certificate');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCertifications = () => {
    return certifications.length;
  };

  const getValidCertifications = () => {
    const today = new Date();
    return certifications.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return expiryDate > thirtyDaysFromNow && cert.is_approved === true;
    }).length;
  };

  const getExpiringSoonCertifications = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return certifications.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate > today && cert.is_approved === true;
    }).length;
  };

  const getExpiredCertifications = () => {
    const today = new Date();
    return certifications.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate < today || cert.is_approved === false;
    }).length;
  };

  const getCertCountForCategory = (categoryId) => {
    return certifications.filter(cert => cert.certification === categoryId).length;
  };

  // Get certifications filtered by search term and selected category
  const getFilteredCertifications = () => {
    let filtered = certifications;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(cert => cert.certification === selectedCategory);
    }
    
    return filtered;
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
    // First priority API status
    if (cert.status) {
      return cert.status.toLowerCase();
    }

    // fallback logic
    const today = new Date();
    const expiryDate = new Date(cert.expiry_date);

    if (!cert.is_approved) return "pending";
    if (expiryDate < today) return "expired";

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiryDate <= thirtyDaysFromNow) return "expiring";

    return "valid";
  };

  const getDocumentUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}${path}`;
  };

  const handleDownload = (url, filename) => {
    window.open(url, '_blank');
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'M') return 'Male';
    if (gender === 'F') return 'Female';
    if (gender === 'O') return 'Other';
    return 'Not specified';
  };

  const filteredCertifications = getFilteredCertifications();

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="cert-wrapper">

            <div className="cert-header d-flex justify-content-between align-items-center">
              <div>
                <h2>Certifications</h2>
                <p>Manage and track candidate certifications</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary cert-category-btn"
                  onClick={handleAddCategory}
                >
                  <FaTags className="me-2" />
                  Add Certification Category
                </button>
                {/* <button className="btn btn-primary cert-issue-btn">
                  <FaPlus className="me-2" />
                  Issue Certificate
                </button> */}
              </div>
            </div>

            <div className="row g-4 mt-2">
              <CertStat title="Total Certifications" value={getTotalCertifications()} />
              <CertStat title="Valid" value={getValidCertifications()} icon={<FaCheckCircle />} green />
              <CertStat title="Expiring Soon" value={getExpiringSoonCertifications()} icon={<FaClock />} orange />
              <CertStat title="Expired" value={getExpiredCertifications()} icon={<FaTimesCircle />} red />
            </div>

            {/* Combined Card with Tabs */}
            <div className="cert-card mt-4">
              {/* Main Tabs */}
              <div className="main-tabs-container">
                <div className="main-tabs">
                  <button 
                    className={`main-tab-btn ${mainTab === 'categories' ? 'active' : ''}`}
                    onClick={() => {
                      setMainTab('categories');
                      setSelectedCategory(null);
                    }}
                  >
                    <FaList className="me-2" />
                    Certification Types
                  </button>
                  <button 
                    className={`main-tab-btn ${mainTab === 'certificates' ? 'active' : ''}`}
                    onClick={() => setMainTab('certificates')}
                  >
                    <FaCertificate className="me-2" />
                    Certifications
                  </button>
                </div>
              </div>

              {/* Categories Tab Content */}
              {mainTab === 'categories' && (
                <div className="categories-content">
                  <div className="categories-header">
                    <h5>Certification Types</h5>
                    <p className="text-muted">Overview of certification distribution</p>
                  </div>

                  {loading && categories.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading categories...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : categories.length > 0 ? (
                    <div className="categories-list">
                      {categories.map((category) => {
                        const count = getCertCountForCategory(category.id);
                        return (
                          <CertBar 
                            key={category.id}
                            label={category.name}
                            total={count}
                            valid={0}
                            expiring={0}
                            expired={0}
                            onEdit={() => handleEditCategory(category)}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setMainTab('certificates');
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted text-center">No certification categories found.</p>
                  )}
                </div>
              )}

              {/* Certificates Tab Content */}
              {mainTab === 'certificates' && (
                <div className="certificates-content">
                  <div className="certificates-header">
                    <div>
                      <h5>
                        {selectedCategory 
                          ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Certifications`
                          : 'Certifications'
                        }
                      </h5>
                      <p className="text-muted">
                        {selectedCategory 
                          ? `Showing certifications for selected category`
                          : 'Latest certification updates'
                        }
                      </p>
                    </div>
                    <div className="certificates-header-actions">
                      {selectedCategory && (
                        <button 
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => setSelectedCategory(null)}
                        >
                          <FaTimes className="me-1" />
                          Clear Filter
                        </button>
                      )}
                      <input
                        className="form-control cert-search"
                        placeholder="Search certifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Category Tabs for Quick Filtering */}
                  <div className="category-tabs-container">
                    <div className="category-tabs">
                      <button 
                        className={`category-tab-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Categories
                        <span className="category-count">{certifications.length}</span>
                      </button>
                      {categories.map((category) => {
                        const count = getCertCountForCategory(category.id);
                        return (
                          <button 
                            key={category.id}
                            className={`category-tab-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {category.name}
                            <span className="category-count">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table cert-table">
                      <thead>
                        <tr>
                          <th>Certification Name</th>
                          <th>Category</th>
                          <th>Issuing Authority</th>
                          <th>Certificate Number</th>
                          <th>Issue Date</th>
                          <th>Expiry Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && certifications.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2">Loading certifications...</p>
                            </td>
                          </tr>
                        ) : filteredCertifications.length > 0 ? (
                          filteredCertifications.map((cert) => {
                            const category = categories.find(c => c.id === cert.certification);
                            return (
                              <CertRow
                                key={cert.id}
                                name={category?.name || "N/A"}
                                category={category?.name || "N/A"}
                                authority={cert.issuing_authority}
                                certNumber={cert.certificate_number}
                                issueDate={formatDate(cert.issue_date)}
                                expiryDate={formatDate(cert.expiry_date)}
                                status={cert.status || getStatusDisplay(cert)}
                                onView={() => handleViewDetails(cert)}
                              />
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <p className="text-muted">No certifications found.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modal for Certification Details */}
      {showModal && selectedCert && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Certification Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'candidate' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidate')}
              >
                <FaUser /> Candidate Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'certification' ? 'active' : ''}`}
                onClick={() => setActiveTab('certification')}
              >
                <FaIdCard /> Certification
              </button>
              <button 
                className={`tab-btn ${activeTab === 'issuer' ? 'active' : ''}`}
                onClick={() => setActiveTab('issuer')}
              >
                <FaBuilding /> Issuer Details
              </button>
              <button 
                className={`tab-btn ${activeTab === 'competency' ? 'active' : ''}`}
                onClick={() => setActiveTab('competency')}
              >
                <FaGraduationCap /> Competency
              </button>
              <button 
                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <FaFile /> Documents
              </button>
            </div>

            <div className="modal-body">
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
                          <label><FaUser /> Full Name:</label>
                          <span>{selectedCandidate.full_name}</span>
                        </div>
                        <div className="info-item">
                          <label><FaEnvelope /> Email:</label>
                          <span>{selectedCandidate.email}</span>
                        </div>
                        <div className="info-item">
                          <label><FaPhone /> Phone Number:</label>
                          <span>{selectedCandidate.phone_number}</span>
                        </div>
                        <div className="info-item">
                          <label><FaCalendarAlt /> Date of Birth:</label>
                          <span>{formatDate(selectedCandidate.date_of_birth)}</span>
                        </div>
                        <div className="info-item">
                          <label><FaUserMd /> Gender:</label>
                          <span>{getGenderDisplay(selectedCandidate.gender)}</span>
                        </div>
                        <div className="info-item">
                          <label><FaTint /> Blood Group:</label>
                          <span>{selectedCandidate.blood_group || "N/A"}</span>
                        </div>
                        <div className="info-item">
                          <label><FaMapMarkerAlt /> Address:</label>
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
                        <div className="info-item">
                          <label>Medical Expiry Date:</label>
                          <span>{formatDate(selectedCandidate.medical_expiry_date)}</span>
                        </div>
                        <div className="info-item">
                          <label>Safety Induction:</label>
                          <span className={selectedCandidate.safety_induction_status ? "text-success" : "text-danger"}>
                            {selectedCandidate.safety_induction_status ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-warning">
                      <p>No candidate information available for this certification.</p>
                      <p className="mb-0"><strong>Candidate ID:</strong> {selectedCert.candidate}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Certification Details Tab */}
              {activeTab === 'certification' && (
                <div className="info-section">
                  <h4>Certification Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Certification ID:</label>
                      <span>{selectedCert.certification}</span>
                    </div>
                    <div className="info-item">
                      <label>Certification Name:</label>
                      <span>
                        {categories.find(c => c.id === selectedCert.certification)?.name || "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Description:</label>
                      <span>
                        {categories.find(c => c.id === selectedCert.certification)?.description || "N/A"}
                      </span>
                    </div>
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
                      <span className={`status-badge ${selectedCert.status || getStatusDisplay(selectedCert)}`}>
                        {selectedCert.status || getStatusDisplay(selectedCert)}
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
                    <div className="info-item">
                      <label>Created At:</label>
                      <span>{formatDateTime(selectedCert.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Updated:</label>
                      <span>{formatDateTime(selectedCert.updated_at)}</span>
                    </div>
                    <div className="info-item">
                      <label>Document:</label>
                      {selectedCert.document && (
                        <a 
                          href={getDocumentUrl(selectedCert.document)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          <FaFile /> View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Issuer Details Tab */}
              {activeTab === 'issuer' && (
                <div className="info-section">
                  <h4>Issuer Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label><FaBuilding /> Issuer Type:</label>
                      <span>{selectedCert.issuer_type || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaUser /> Issuer Name:</label>
                      <span>{selectedCert.issuer_name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaEnvelope /> Issuer Email:</label>
                      <span>
                        {selectedCert.issuer_email ? (
                          <a href={`mailto:${selectedCert.issuer_email}`}>{selectedCert.issuer_email}</a>
                        ) : "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label><FaPhone /> Issuer Phone:</label>
                      <span>{selectedCert.issuer_phone || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaGlobe /> Issuer Website:</label>
                      <span>
                        {selectedCert.issuer_website ? (
                          <a href={selectedCert.issuer_website} target="_blank" rel="noopener noreferrer">
                            {selectedCert.issuer_website}
                          </a>
                        ) : "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <label><FaMapMarkerAlt /> Issuer Address:</label>
                      <span>{selectedCert.issuer_address || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Issuer City:</label>
                      <span>{selectedCert.issuer_city || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Issuer State:</label>
                      <span>{selectedCert.issuer_state || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Issuer Country:</label>
                      <span>{selectedCert.issuer_country || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Postal Code:</label>
                      <span>{selectedCert.issuer_postal_code || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label><FaHashtag /> Accreditation Number:</label>
                      <span>{selectedCert.issuer_accreditation_number || "N/A"}</span>
                    </div>
                    <div className="info-item full-width">
                      <label><FaInfoCircle /> Issuer Description:</label>
                      <span>{selectedCert.issuer_description || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Competency Information Tab */}
              {activeTab === 'competency' && selectedCompetency && (
                <div className="info-section">
                  <h4>Competency Details</h4>
                  <div className="competency-header">
                    <h5>{selectedCompetency.competency_name}</h5>
                    <p>Overall Score: <strong>{selectedCompetency.overall_score}%</strong></p>
                  </div>
                  
                  <div className="scores-grid">
                    <div className="score-card">
                      <label>Technical Knowledge</label>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${selectedCompetency.technical_knowledge}%`}}></div>
                        <span>{selectedCompetency.technical_knowledge}%</span>
                      </div>
                    </div>
                    <div className="score-card">
                      <label>Field Execution</label>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${selectedCompetency.field_execution}%`}}></div>
                        <span>{selectedCompetency.field_execution}%</span>
                      </div>
                    </div>
                    <div className="score-card">
                      <label>Documentation Quality</label>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${selectedCompetency.documentation_quality}%`}}></div>
                        <span>{selectedCompetency.documentation_quality}%</span>
                      </div>
                    </div>
                    <div className="score-card">
                      <label>Ethics & Independence</label>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${selectedCompetency.ethics_independence}%`}}></div>
                        <span>{selectedCompetency.ethics_independence}%</span>
                      </div>
                    </div>
                    <div className="score-card">
                      <label>Communication</label>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${selectedCompetency.communication}%`}}></div>
                        <span>{selectedCompetency.communication}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="competency-details">
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedCompetency.status}`}>
                        {selectedCompetency.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Department:</label>
                      <span>{selectedCompetency.department}</span>
                    </div>
                    <div className="detail-item">
                      <label>Level:</label>
                      <span>{selectedCompetency.level}</span>
                    </div>
                    {selectedCompetency.mentor_comments && (
                      <div className="detail-item">
                        <label>Mentor Comments:</label>
                        <span>{selectedCompetency.mentor_comments}</span>
                      </div>
                    )}
                  </div>

                  {selectedCompetency.logbook_entries && selectedCompetency.logbook_entries.length > 0 && (
                    <div className="logbook-entries">
                      <h5>Logbook Entries ({selectedCompetency.logbook_entries.length})</h5>
                      {selectedCompetency.logbook_entries.map((entry, index) => (
                        <div key={entry.id} className="logbook-entry">
                          <p><strong>Entry {index + 1}</strong></p>
                          <p>Work Location: {entry.work_location}</p>
                          <p>Duration: {entry.total_duration}</p>
                          <p>Verification Status: {entry.verification_status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'competency' && !selectedCompetency && (
                <div className="info-section">
                  <p className="text-muted">No competency data available for this certification.</p>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="info-section">
                  <h4>Certification Document</h4>
                  {selectedCert.document && (
                    <div className="document-preview">
                      <div className="document-card">
                        <FaFile className="document-icon" />
                        <div className="document-info">
                          <p className="document-name">
                            {selectedCert.document.split('/').pop()}
                          </p>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownload(getDocumentUrl(selectedCert.document), selectedCert.document.split('/').pop())}
                          >
                            <FaDownload /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCompetency && selectedCompetency.logbook_entries && (
                    <>
                      <h4 className="mt-4">Competency Documents</h4>
                      {selectedCompetency.logbook_entries.map((entry, idx) => (
                        <div key={idx} className="documents-section">
                          <h5>Logbook Entry {idx + 1} Documents</h5>
                          <div className="documents-grid">
                            {entry.evidence_documents && entry.evidence_documents.map((doc, docIdx) => (
                              <div key={docIdx} className="document-card">
                                {doc.type === 'photo' && <FaImage className="document-icon" />}
                                {doc.type === 'video' && <FaVideo className="document-icon" />}
                                {doc.type === 'document' && <FaFile className="document-icon" />}
                                <div className="document-info">
                                  <p className="document-name">{doc.filename}</p>
                                  <p className="document-size">{(doc.size / 1024).toFixed(2)} KB</p>
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleDownload(getDocumentUrl(doc.path), doc.filename)}
                                  >
                                    <FaDownload /> Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
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

const CertStat = ({ title, value, icon, green, orange, red }) => (
  <div className="col-lg-3 col-md-6">
    <div className={`cert-stat ${green ? "green" : ""} ${orange ? "orange" : ""} ${red ? "red" : ""}`}>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      {icon && <div className="cert-stat-icon">{icon}</div>}
    </div>
  </div>
);

const CertBar = ({ label, total, valid, expiring, expired, onEdit, onClick }) => (
  <div className="cert-bar-row" onClick={onClick} style={{ cursor: 'pointer' }}>
    <span>{label}</span>
    <div className="cert-bar">
      <div className="valid" style={{ width: total > 0 ? `${(valid / total) * 100}%` : '0%' }} />
      <div className="expiring" style={{ width: total > 0 ? `${(expiring / total) * 100}%` : '0%' }} />
      <div className="expired" style={{ width: total > 0 ? `${(expired / total) * 100}%` : '0%' }} />
    </div>
    <strong>{total}</strong>
    <button 
      className="btn btn-link edit-category-btn" 
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      title="Edit Category"
    >
      <FaEdit />
    </button>
  </div>
);

const CertRow = ({ name, category, authority, certNumber, issueDate, expiryDate, status, onView }) => {
  return (
    <tr>
      <td>{name}</td>
      <td>{category}</td>
      <td>{authority}</td>
      <td>{certNumber}</td>
      <td>{issueDate}</td>
      <td>{expiryDate}</td>
      <td>
        <span className={`cert-status ${status}`}>{status}</span>
      </td>
      <td>
        <button className="btn btn-outline-primary btn-sm" onClick={onView}>
          View
        </button>
      </td>
    </tr>
  );
};

export default Certifications;