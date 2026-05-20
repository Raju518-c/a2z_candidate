// CandidateDashboard.jsx (Updated - News & Announcements below Competency Level)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaClock,
  FaCamera,
  FaCertificate,
  FaShieldAlt,
  FaPlus,
  FaUpload,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";
import "./CandidateDashboard.css";
import { BASE_URL } from "../../../ApiUrl";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [totalExposureHours, setTotalExposureHours] = useState(0);
  const [evidenceUploads, setEvidenceUploads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const candidateData = localStorage.getItem("candidate_user");
    
    if (candidateData) {
      try {
        const parsedUser = JSON.parse(candidateData);
        setUser(parsedUser);
        console.log("✅ Candidate user data loaded:", parsedUser);
        
        // Fetch logbook data for this candidate
        fetchLogbookData(parsedUser.full_name);
      } catch (error) {
        console.error("Error parsing candidate user data:", error);
        setLoading(false);
      }
    } else {
      console.warn("No candidate user data found in localStorage");
      setLoading(false);
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Fetch announcements
    fetchAnnouncements();
  }, []);

  // Fetch announcements and filter only published ones
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/news-announcements/`);
      const data = await response.json();

      if (data.status && data.data) {
        const publishedAnnouncements = data.data.filter(
          item => item.status === "published"
        );
        setAnnouncements(publishedAnnouncements);
      } else if (Array.isArray(data)) {
        const publishedAnnouncements = data.filter(
          item => item.status === "published"
        );
        setAnnouncements(publishedAnnouncements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // Fetch logbook data and calculate totals
  const fetchLogbookData = async (candidateName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/candidate/digital-logbook/`);
      const data = await response.json();
      
      if (data.status && data.data) {
        const candidateEntries = data.data.filter(
          entry => entry.candidate_name === candidateName
        );
        
        let totalHours = 0;
        candidateEntries.forEach(entry => {
          if (entry.total_hours) {
            totalHours += parseFloat(entry.total_hours);
          }
        });
        
        let totalEvidenceCount = 0;
        candidateEntries.forEach(entry => {
          if (entry.evidence_documents && Array.isArray(entry.evidence_documents)) {
            totalEvidenceCount += entry.evidence_documents.length;
          }
        });
        
        setTotalExposureHours(Math.round(totalHours));
        setEvidenceUploads(totalEvidenceCount);
      }
    } catch (error) {
      console.error("Error fetching logbook data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0];
    }
    return "Candidate";
  };

  const getUserRole = () => {
    return "Junior Surveyor • Level 2 - Developing";
  };

  const handleNewLogbook = () => {
    navigate("/candidate/logbook/add");
  };

  const handleUploadEvidence = () => {
    navigate("/candidate/logbook");
  };

  const handleViewLearning = () => {
    navigate("/candidate-learning");
  };

  const handleCheckCompliance = () => {
    navigate("/candidate-compliance");
  };

  const handleViewAllLogbook = () => {
    navigate("/candidate-digital");
  };

  const handleManageCertifications = () => {
    navigate("/candidate-certificate");
  };

  const handleNavigateToDigitalLogbook = () => {
    navigate("/candidate-digital");
  };

  const handleOpenModal = (item) => {
    setSelectedAnnouncement(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
  };

  const formatHours = (hours) => {
    return hours.toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const CONTENT_TYPE_LABELS = {
    news: "News",
    announcement: "Announcement",
    incident_report: "Incident Report",
    circular: "Circular",
    notice: "Notice",
    alert: "Alert",
    update: "Update",
  };

  const PRIORITY_LABELS = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  const AUDIENCE_LABELS = {
    all: "All Users",
    admin_only: "Admin Only",
    mentor_only: "Mentor Only",
    candidate_only: "Candidate Only",
    specific_department: "Specific Department",
    specific_level: "Specific Level",
  };

  const PRIORITY_COLORS = {
    urgent: "#dc3545",
    high: "#fd7e14",
    medium: "#0d6efd",
    low: "#6c757d",
  };

  return (
    <div className="ta-layout-wrapper">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main Area */}
      <div className="ta-main-wrapper">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <div className="ta-content-area">
          <div className="container-fluid training-dashboard">
            
            {/* ================= HEADER ================= */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="td-title">{greeting}, {getUserName()}</h2>
                <p className="td-subtitle">{getUserRole()}</p>
              </div>
              <div className="td-demo-box">
                <span className="me-2">Role:</span>
                <select className="form-select td-demo-select">
                  <option>Junior Surveyor</option>
                  <option>Senior Surveyor</option>
                  <option>Lead Surveyor</option>
                </select>
              </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="row g-4 mb-4">
              <StatCard 
                title="Total Exposure Hours" 
                value={loading ? "Loading..." : formatHours(totalExposureHours)} 
                icon={<FaClock />}
                onClick={handleNavigateToDigitalLogbook}
              />
              <StatCard 
                title="Evidence Uploads" 
                value={loading ? "Loading..." : evidenceUploads} 
                icon={<FaCamera />}
                onClick={handleNavigateToDigitalLogbook}
              />
              <StatCard 
                title="Active Certifications" 
                value="2" 
                icon={<FaCertificate />} 
              />
              <StatCard 
                title="Compliance Score" 
                value="94%" 
                icon={<FaShieldAlt />} 
              />
            </div>

            {/* ================= COMPETENCY + QUICK ACTIONS ================= */}
            <div className="row g-4 mb-4">
              {/* Competency Level */}
              <div className="col-lg-8">
                <div className="td-card">
                  <h5 className="mb-1">Competency Level</h5>
                  <p className="td-muted">Your progression journey</p>
                  <div className="td-progress-line">
                    {["Aspirant", "SIT", "Junior", "Surveyor", "Senior", "Principal"].map(
                      (item, index) => (
                        <div key={index} className={`td-progress-step ${index <= 2 ? "active" : ""}`}>
                          <div className="td-step-circle">
                            {index < 2 ? <FaCheck /> : index === 2 ? "2" : "🔒"}
                          </div>
                          <span>{item}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="td-level-box">
                    <strong>Level 2 - Developing</strong>
                    <p className="mb-0">
                      Complete required evidence and assessments to unlock Level 3
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="col-lg-4">
                <div className="td-card">
                  <h5 className="mb-1">Quick Actions</h5>
                  <p className="td-muted">Common tasks</p>
                  <div className="qa-grid qa-grid-2">
                    <div className="qa-box qa-primary" onClick={handleNewLogbook}>
                      <div className="qa-icon dark"><FaPlus /></div>
                      <h6>New Logbook Entry</h6>
                      <p>Record field activity</p>
                      <span className="qa-arrow">→</span>
                    </div>
                    <div className="qa-box" onClick={handleUploadEvidence}>
                      <div className="qa-icon"><FaUpload /></div>
                      <h6>Upload Evidence</h6>
                      <p>Add photos & documents</p>
                      <span className="qa-arrow">→</span>
                    </div>
                    <div className="qa-box" onClick={handleViewLearning}>
                      <div className="qa-icon">📘</div>
                      <h6>View Learning</h6>
                      <p>Continue training</p>
                      <span className="qa-arrow">→</span>
                    </div>
                    <div className="qa-box" onClick={handleCheckCompliance}>
                      <div className="qa-icon">📄</div>
                      <h6>Check Compliance</h6>
                      <p>Review status</p>
                      <span className="qa-arrow">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= NEWS & ANNOUNCEMENTS (Below Competency Level) ================= */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div className="td-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">News & Announcements</h5>
                  </div>
                  <hr />

                  {announcements.length === 0 ? (
                    <p className="text-muted">No published announcements available</p>
                  ) : (
                    <div className="row">
                      {announcements.slice(0, 4).map((item) => (
                        <div key={item.id} className="col-md-6 mb-3">
                          <div 
                            className="d-flex align-items-start p-3"
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: "12px",
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                              backgroundColor: "#fff"
                            }}
                            onClick={() => handleOpenModal(item)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div 
                              className="me-3"
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                backgroundColor: PRIORITY_COLORS[item.priority] || "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "18px",
                                flexShrink: 0
                              }}
                            >
                              {item.title?.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <strong style={{ color: "#040c3b", fontSize: "14px" }}>
                                  {item.title}
                                </strong>
                                {item.priority === "urgent" && (
                                  <FaExclamationTriangle className="text-danger" />
                                )}
                              </div>
                              <p className="text-muted mb-1" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                                {item.content?.length > 80 
                                  ? item.content.substring(0, 80) + "..." 
                                  : item.content || "No description available"}
                              </p>
                              <small className="text-muted">
                                {formatDate(item.created_at)} • {PRIORITY_LABELS[item.priority] || "N/A"} Priority
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= RECENT LOGBOOK + CERTIFICATIONS ================= */}
            <div className="row g-4 mb-4">
              {/* Recent Logbook */}
              <div className="col-lg-8">
                <div className="cd-card">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h5 className="mb-0">Recent Logbook Entries</h5>
                      <p className="cd-muted">Your latest field activities</p>
                    </div>
                    <button 
                      className="btn btn-outline-secondary cd-btn" 
                      onClick={handleViewAllLogbook}
                    >
                      View All →
                    </button>
                  </div>
                  <LogItem 
                    title="FPSO Harmony" 
                    status="Validated" 
                    work="Hull structural inspection - Phase 2"
                    meta="Jurong Shipyard • Floating Production • 15 Jan 2024" 
                    hours="8h" 
                    files="3" 
                  />
                  <LogItem 
                    title="Platform Bravo" 
                    status="Pending" 
                    work="Coating inspection - Upper deck"
                    meta="Singapore Offshore • Fixed Platform • 12 Jan 2024" 
                    hours="14h" 
                    files="2" 
                  />
                  <LogItem 
                    title="Drilling Rig Delta" 
                    status="Validated" 
                    work="NDT examination - Leg structure"
                    meta="Batam Yard • Jack-up Rig • 08 Jan 2024" 
                    hours="24h" 
                    files="1" 
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="col-lg-4">
                <div className="cd-card">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h5 className="mb-0">Certifications</h5>
                      <p className="cd-muted">2 active certifications</p>
                    </div>
                    <button 
                      className="btn btn-outline-secondary cd-btn" 
                      onClick={handleManageCertifications}
                    >
                      Manage →
                    </button>
                  </div>
                  <CertCard 
                    title="API 510 Pressure Vessel Inspector" 
                    org="American Petroleum Institute"
                    status="173 days left" 
                    type="success" 
                    issued="01 Aug 2023" 
                    expires="01 Aug 2026" 
                  />
                  <CertCard 
                    title="CSWIP 3.1 Welding Inspector" 
                    org="TWI Certification Ltd"
                    status="Expired" 
                    type="warning" 
                    issued="15 Mar 2023" 
                    expires="15 Mar 2024" 
                  />
                </div>
              </div>
            </div>

            {/* ================= COMPETENCY ASSESSMENT + ROTATION ================= */}
            <div className="row g-4 mb-4">
              {/* Competency Assessment */}
              <div className="col-lg-6">
                <div className="ca-card">
                  <h5 className="mb-1">Competency Assessment</h5>
                  <p className="ca-muted">Cross-cutting skill evaluation</p>
                  <div className="ca-radar-wrapper">
                    <div className="ca-radar">
                      <div className="ca-radar-grid"></div>
                      <div className="ca-radar-fill"></div>
                      <span className="ca-label top">Technical</span>
                      <span className="ca-label right">Field Discipline</span>
                      <span className="ca-label bottom-right">Documentation</span>
                      <span className="ca-label bottom-left">Ethics</span>
                      <span className="ca-label left">Communication</span>
                    </div>
                  </div>
                  <div className="row g-3 mt-3">
                    <Score label="Technical" value="78%" />
                    <Score label="Field Discipline" value="85%" good />
                    <Score label="Documentation" value="72%" />
                    <Score label="Ethics" value="92%" good />
                    <Score label="Communication" value="68%" />
                  </div>
                </div>
              </div>

              {/* Departmental Rotation */}
              <div className="col-lg-6">
                <div className="dr-card">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="dr-icon">📋</div>
                    <div>
                      <h5 className="mb-0">Departmental Rotation</h5>
                      <p className="dr-muted">2 of 6 departments completed</p>
                    </div>
                  </div>
                  <div className="dr-progress">
                    <div className="dr-progress-fill" style={{ width: "33%" }} />
                  </div>
                  <div className="dr-list mt-4">
                    <RotationItem title="Manufacturing" score="88%" done />
                    <RotationItem title="Coating" score="92%" done />
                    <RotationItem title="QA/QC" active />
                    <RotationItem title="Testing" index="4" />
                    <RotationItem title="Dispatch & Logistics" index="5" />
                    <RotationItem title="Marine Assets" index="6" />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ANNOUNCEMENT MODAL ================= */}
            {showModal && selectedAnnouncement && (
              <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">News/Announcement Details</h5>
                      <button className="btn-close" onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <strong>Title:</strong> {selectedAnnouncement.title || "N/A"}
                      </div>
                      <div className="mb-3">
                        <strong>Content:</strong>
                        <p className="mt-1 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {selectedAnnouncement.content || "N/A"}
                        </p>
                      </div>
                      <div className="mb-2">
                        <strong>Content Type:</strong> {CONTENT_TYPE_LABELS[selectedAnnouncement.content_type] || "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Priority:</strong>{" "}
                        <span style={{ color: PRIORITY_COLORS[selectedAnnouncement.priority] || "#000", fontWeight: "bold" }}>
                          {PRIORITY_LABELS[selectedAnnouncement.priority] || "N/A"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Target Audience:</strong> {AUDIENCE_LABELS[selectedAnnouncement.target_audience] || "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Published Date:</strong> {formatDate(selectedAnnouncement.published_at)}
                      </div>
                      {selectedAnnouncement.expires_at && (
                        <div className="mb-2">
                          <strong>Expires:</strong> {formatDate(selectedAnnouncement.expires_at)}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const StatCard = ({ title, value, desc, change, icon, onClick }) => (
  <div className="col-xl-3 col-md-6">
    <div className="td-stat-card clickable-card" onClick={onClick}>
      <div className="td-stat-top">
        <h6>{title}</h6>
        <div className="td-icon-box">{icon}</div>
      </div>
      <h3>{value}</h3>
      <p className="td-muted">{desc}</p>
      {change && <span className="td-positive">{change} vs last month</span>}
    </div>
  </div>
);

const LogItem = ({ title, status, work, meta, hours, files }) => (
  <div className="cd-log">
    <div>
      <div className="d-flex gap-2 align-items-center mb-1">
        <strong>{title}</strong>
        <span className={`cd-badge ${status === "Validated" ? "ok" : "pending"}`}>{status}</span>
      </div>
      <p className="mb-1">{work}</p>
      <p className="cd-muted small">{meta}</p>
    </div>
    <div className="text-end">
      <strong>{hours}</strong>
      <p className="cd-muted small">exposure</p>
      <p className="cd-muted small">📷 {files}</p>
    </div>
  </div>
);

const CertCard = ({ title, org, status, type, issued, expires }) => (
  <div className="cd-cert">
    <div className="d-flex justify-content-between">
      <strong>{title}</strong>
      <span className={type === "success" ? "cd-green" : "cd-orange"}>{status}</span>
    </div>
    <p className="cd-muted">{org}</p>
    <div className="cd-bar">
      <div className={`cd-fill ${type}`} />
    </div>
    <div className="cd-dates">
      <span>Issued: {issued}</span>
      <span>Expires: {expires}</span>
    </div>
  </div>
);

const Score = ({ label, value, good }) => (
  <div className="col-md-6">
    <div className="ca-score">
      <span>{label}</span>
      <strong className={good ? "ca-good" : "ca-warn"}>{value}</strong>
    </div>
  </div>
);

const RotationItem = ({ title, score, done, active, index }) => (
  <div className={`dr-item ${active ? "active" : ""}`}>
    <div className="d-flex align-items-center gap-3">
      <div className={`dr-badge ${done ? "done" : active ? "active" : ""}`}>
        {done ? "✓" : index}
      </div>
      <div>
        <strong>{title}</strong>
        {score && <p className="dr-muted">Evaluation: {score}</p>}
        {active && <p className="dr-active">Currently active</p>}
      </div>
    </div>
    {done && <span className="dr-check">✓</span>}
  </div>
);

export default CandidateDashboard;