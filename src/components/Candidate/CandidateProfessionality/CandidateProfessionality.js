// CandidateProfessionalIdentity.jsx (Updated with dynamic user data)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaDownload,
  FaSpinner
} from "react-icons/fa";
import "./CandidateProfessionality.css";

const CandidateProfessionalIdentity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    surveyorId: "",
    memberSince: "",
    level: "Level 2",
    competency: "Developing",
    experience: "0h",
    discipline: "Marine Structural Inspection"
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      // Load from localStorage
      const candidateData = localStorage.getItem("candidate_user");
      
      if (candidateData) {
        const parsedUser = JSON.parse(candidateData);
        setUser(parsedUser);
        
        // Generate surveyor ID based on user data
        const surveyorId = generateSurveyorId(parsedUser);
        
        // Format member since date
        const memberSince = formatMemberSince(parsedUser.login_time);
        
        setProfileData(prev => ({
          ...prev,
          surveyorId: surveyorId,
          memberSince: memberSince
        }));
        
        console.log("✅ Professional Identity data loaded:", parsedUser);
      } else {
        console.warn("No candidate user data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSurveyorId = (user) => {
    // Generate a unique surveyor ID based on user data
    const year = new Date().getFullYear();
    const userId = user.user_id || "001";
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ICSEM-${year}-${userId.padStart(6, '0')}-${randomNum}`;
  };

  const formatMemberSince = (loginTime) => {
    if (loginTime) {
      const date = new Date(loginTime);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return "Jan 2024";
  };

  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    } else if (user?.identifier) {
      return user.identifier.substring(0, 2).toUpperCase();
    }
    return "CA";
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
    // You can fetch this from API or determine based on user data
    return "Junior Surveyor";
  };

  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier) {
      return user.identifier;
    }
    return "candidate@icsem.com";
  };

  const getUserPhone = () => {
    return user?.phone_number || "Not provided";
  };

  const handleShareProfile = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    alert("Profile link copied to clipboard!");
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    alert("PDF export feature coming soon!");
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <CandidateSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="container-fluid cpi-wrapper">
              <div className="text-center p-5">
                <FaSpinner className="fa-spin fa-3x" />
                <p className="mt-2">Loading professional identity...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main Area */}
      <div className="ta-main-wrapper">
        {/* Header */}
        <Header />

        {/* Content */}
        <div className="ta-content-area">
          <div className="container-fluid cpi-wrapper">

            {/* ================= HEADER ================= */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="cpi-title">Professional Identity</h3>
                <p className="cpi-subtitle">
                  Your verified digital passport and credentials
                </p>
              </div>

              <div className="cpi-actions d-flex gap-2">
                <button className="btn btn-outline-secondary cpi-btn" onClick={handleShareProfile}>
                  <FaShareAlt /> Share Profile
                </button>
                <button className="btn btn-outline-secondary cpi-btn" onClick={handleExportPDF}>
                  <FaDownload /> Export PDF
                </button>
              </div>
            </div>

            {/* ================= IDENTITY + STATUS ================= */}
            <div className="row g-4">
              {/* LEFT CARD */}
              <div className="col-lg-4">
                <div className="cpi-id-card">
                  <div className="cpi-id-header">
                    <div className="cpi-logo">IC</div>
                    <span>ICSEM Platform</span>
                  </div>

                  <div className="cpi-profile">
                    <div className="cpi-avatar">{getUserInitials()}</div>
                    <h4>{getUserName()}</h4>
                    <p>{getUserRole()}</p>
                    {/* <span className="cpi-badge">Deployable</span> */}
                  </div>

                  <div className="cpi-id-box">
                    <span>Surveyor ID</span>
                    <strong>{profileData.surveyorId}</strong>
                  </div>

                  <div className="cpi-meta-grid">
                    <div className="cpi-meta">
                      <span>Competency</span>
                      <strong>{profileData.competency}</strong>
                    </div>
                    <div className="cpi-meta">
                      <span>Experience</span>
                      <strong>{profileData.experience}</strong>
                    </div>
                  </div>

                  <div className="cpi-discipline">
                    <span>Discipline</span>
                    <strong>{profileData.discipline}</strong>
                  </div>

                  <div className="cpi-contact-info">
                    <div className="cpi-contact-item">
                      <span>Email</span>
                      <strong>{getUserEmail()}</strong>
                    </div>
                    <div className="cpi-contact-item">
                      <span>Phone</span>
                      <strong>{getUserPhone()}</strong>
                    </div>
                  </div>

                  <div className="cpi-footer">
                    <span>Member since {profileData.memberSince}</span>
                    <span>{profileData.level}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="col-lg-8">
                <div className="cpi-status-card">
                  <h5 className="mb-1">Verification Status</h5>
                  <p className="cpi-muted">
                    Your credentials and compliance checks
                  </p>

                  <CPIStatusRow title="Identity Verified" status="verified" />
                  <CPIStatusRow title="Certifications Validated" status="verified" />
                  <CPIStatusRow title="Background Check" status="verified" />
                  <CPIStatusRow title="Ethics Training" status="verified" />
                  <CPIStatusRow title="Medical Clearance" status="expiring" />
                </div>
              </div>
            </div>

            {/* ================= ASSET EXPOSURE ================= */}
            <div className="cpi-ae-wrapper mt-5">
              <h4 className="cpi-ae-title">Asset Exposure Experience</h4>
              <p className="cpi-ae-subtitle">
                Hours logged by asset type
              </p>

              <div className="row g-4 mt-2">
                <CPIExposureCard title="FPSO / FSO" hours="620h" projects="8 projects" />
                <CPIExposureCard title="Fixed Platform" hours="480h" projects="12 projects" />
                <CPIExposureCard title="Jack-up Rig" hours="320h" projects="5 projects" />
                <CPIExposureCard title="Semi-submersible" hours="280h" projects="4 projects" />
                <CPIExposureCard title="Pipeline / Subsea" hours="147h" projects="3 projects" />
              </div>

              <div className="cpi-ae-total mt-4">
                <div>
                  <strong>Total Exposure</strong>
                  <p className="cpi-muted">Across all asset types</p>
                </div>
                <div className="text-end">
                  <h3>1,847h</h3>
                  <span className="cpi-muted">32 total projects</span>
                </div>
              </div>
            </div>

            {/* ================= COMPETENCIES + TIMELINE ================= */}
            <div className="row g-4 mt-5">
              
              {/* CORE COMPETENCIES */}
              <div className="col-lg-6">
                <div className="cpi-card">
                  <h4 className="cpi-card-title">Core Competencies</h4>

                  <Competency label="Structural Inspection" value={85} />
                  <Competency label="Coating Assessment" value={78} />
                  <Competency label="NDT Interpretation" value={72} />
                  <Competency label="Documentation" value={90} />
                  <Competency label="Safety Compliance" value={95} />
                </div>
              </div>

              {/* CAREER TIMELINE */}
              <div className="col-lg-6">
                <div className="cpi-card">
                  <h4 className="cpi-card-title">Career Timeline</h4>

                  <TimelineItem
                    date={profileData.memberSince}
                    title="Joined ICSEM Program"
                    type="start"
                  />
                  <TimelineItem
                    date="Oct 2023"
                    title="Completed Manufacturing Rotation"
                    type="rotation"
                  />
                  <TimelineItem
                    date="Nov 2023"
                    title="Promoted to Level 1 (SIT)"
                    type="promotion"
                  />
                  <TimelineItem
                    date="Jan 2024"
                    title="Completed Coating Rotation"
                    type="rotation"
                  />
                  <TimelineItem
                    date="Jan 2024"
                    title="Promoted to Level 2 (Junior)"
                    type="promotion"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const CPIStatusRow = ({ title, status }) => (
  <div className="cpi-status-row">
    <div className="d-flex align-items-center gap-3">
      <div className={`cpi-icon ${status}`}>
        {status === "verified" ? <FaCheckCircle /> : <FaExclamationTriangle />}
      </div>
      <strong>{title}</strong>
    </div>
    <span className={`cpi-pill ${status}`}>
      {status === "verified" ? "Verified" : "Expiring Soon"}
    </span>
  </div>
);

const CPIExposureCard = ({ title, hours, projects }) => (
  <div className="col-lg">
    <div className="cpi-ae-card">
      <span className="cpi-ae-type">{title}</span>
      <h4>{hours}</h4>
      <p className="cpi-muted">{projects}</p>
    </div>
  </div>
);

const Competency = ({ label, value }) => (
  <div className="cpi-competency">
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}%</strong>
    </div>
    <div className="cpi-progress">
      <div
        className="cpi-progress-fill"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const TimelineItem = ({ date, title, type }) => (
  <div className="cpi-timeline-item">
    <div className={`cpi-dot ${type}`} />
    <div className="cpi-timeline-content">
      <span className="cpi-timeline-date">{date}</span>
      <strong>{title}</strong>
    </div>
  </div>
);

export default CandidateProfessionalIdentity;