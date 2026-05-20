// MentorProfessionalIdentity.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaDownload,
  FaSpinner,
  FaUserGraduate,
  FaStar,
  FaBook,
  FaChalkboardTeacher
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./MentorProfessionalIdentity.css";

const MentorProfessionalIdentity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    mentorId: "",
    memberSince: "",
    expertise: "Senior Mentor",
    specialization: "Marine & Offshore Inspection",
    menteeCount: 0,
    yearsOfExperience: 0,
    certifications: [
      "CSWIP 3.1",
      "API 510",
      "NACE CIP Level 2",
      "IRATA Level 2"
    ]
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const mentorData = localStorage.getItem("mentor_user");
      
      if (mentorData) {
        const parsedUser = JSON.parse(mentorData);
        setUser(parsedUser);
        
        const mentorId = generateMentorId(parsedUser);
        const memberSince = formatMemberSince(parsedUser.login_time || parsedUser.created_at);
        
        // Calculate mock mentee count (replace with actual API call)
        const menteeCount = Math.floor(Math.random() * 15) + 5;
        const yearsOfExperience = calculateExperience(parsedUser);
        
        setProfileData(prev => ({
          ...prev,
          mentorId: mentorId,
          memberSince: memberSince,
          menteeCount: menteeCount,
          yearsOfExperience: yearsOfExperience
        }));
        
        console.log("✅ Mentor Professional Identity data loaded:", parsedUser);
      } else {
        console.warn("No mentor user data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading mentor user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMentorId = (user) => {
    const year = new Date().getFullYear();
    const userId = user.user_id || user.id || "001";
    const deptCode = "MTR";
    return `ICSEM-${deptCode}-${year}-${userId.toString().padStart(4, '0')}`;
  };

  const calculateExperience = (user) => {
    // Calculate based on join date or use default
    if (user.joined_date) {
      const joinDate = new Date(user.joined_date);
      const now = new Date();
      const diffYears = now.getFullYear() - joinDate.getFullYear();
      return Math.max(diffYears, 3);
    }
    return 8; // Default experience years
  };

  const formatMemberSince = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    return "MN";
  };

  const getUserName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0];
    }
    return "Mentor";
  };

  const getUserRole = () => {
    return "Senior Technical Mentor";
  };

  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier) {
      return user.identifier;
    }
    return "mentor@icsem.com";
  };

  const getUserPhone = () => {
    return user?.phone_number || user?.phone || "Not provided";
  };

  const getUserDepartment = () => {
    return user?.department || "Technical Mentorship";
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      text: 'Profile link copied to clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleExportPDF = () => {
    Swal.fire({
      icon: 'info',
      title: 'Export Feature',
      text: 'PDF export functionality will be available soon!',
      confirmButtonColor: '#3085d6'
    });
  };

  if (loading) {
    return (
      <div className="ta-layout-wrapper">
        <MentorSidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="pi-loading-wrapper">
              <FaSpinner className="fa-spin fa-3x" />
              <p className="mt-3">Loading mentor identity...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      {/* Sidebar */}
      <MentorSidebar />

      {/* Main Area */}
      <div className="ta-main-wrapper">
        {/* Header */}
        <Header />

        {/* Content */}
        <div className="ta-content-area">
          <div className="container-fluid pi-wrapper">

            {/* ================= PAGE HEADER ================= */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="pi-title">Mentor Professional Identity</h3>
                <p className="pi-subtitle">
                  Your verified mentor credentials and professional profile
                </p>
              </div>

              <div className="pi-actions d-flex gap-2">
                <button className="btn btn-outline-secondary pi-btn" onClick={handleShareProfile}>
                  <FaShareAlt /> Share Profile
                </button>
                <button className="btn btn-outline-secondary pi-btn" onClick={handleExportPDF}>
                  <FaDownload /> Export PDF
                </button>
              </div>
            </div>

            {/* ================= IDENTITY CARD ================= */}
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="pi-id-card pi-id-card-mentor">
                  <div className="pi-id-header">
                    <div className="pi-logo">👨‍🏫</div>
                    <span>ICSEM Mentor Program</span>
                  </div>

                  <div className="pi-profile">
                    <div className="pi-avatar pi-avatar-mentor">{getUserInitials()}</div>
                    <h4>{getUserName()}</h4>
                    <p>{getUserRole()}</p>
                    <span className="pi-badge pi-badge-mentor">
                      <FaStar className="me-1" /> Verified Mentor
                    </span>
                  </div>

                  <div className="pi-id-box">
                    <span>Mentor ID</span>
                    <strong>{profileData.mentorId}</strong>
                  </div>

                  <div className="pi-meta-grid">
                    <div className="pi-meta">
                      <span>Active Mentees</span>
                      <strong>{profileData.menteeCount} Candidates</strong>
                    </div>
                    <div className="pi-meta">
                      <span>Experience</span>
                      <strong>{profileData.yearsOfExperience}+ Years</strong>
                    </div>
                  </div>

                  <div className="pi-discipline">
                    <span>Specialization</span>
                    <strong>{profileData.specialization}</strong>
                  </div>

                  <div className="pi-contact-info">
                    <div className="pi-contact-item">
                      <span>Email</span>
                      <strong>{getUserEmail()}</strong>
                    </div>
                    <div className="pi-contact-item">
                      <span>Phone</span>
                      <strong>{getUserPhone()}</strong>
                    </div>
                  </div>

                  <div className="pi-footer">
                    <span>Mentor since {profileData.memberSince}</span>
                    <span>⭐ Senior Mentor</span>
                  </div>
                </div>
              </div>

              {/* ================= VERIFICATION STATUS ================= */}
              <div className="col-lg-8">
                <div className="pi-status-card">
                  <h5 className="mb-1">Mentor Verification Status</h5>
                  <p className="pi-muted">
                    Your credentials and qualification verification
                  </p>

                  <PIStatusRow 
                    title="Identity Verified" 
                    status="verified"
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Technical Qualifications" 
                    status="verified"
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Mentor Certification" 
                    status="verified"
                    icon={<FaChalkboardTeacher />}
                  />
                  <PIStatusRow 
                    title="Industry Experience" 
                    status="verified"
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Mentor Training" 
                    status="verified"
                    icon={<FaBook />}
                  />
                </div>

                {/* Certifications Card */}
                {/* <div className="pi-certifications-card mt-4">
                  <h5 className="mb-3">Professional Certifications</h5>
                  <div className="row g-3">
                    {profileData.certifications.map((cert, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="pi-certification-item">
                          <FaStar className="text-warning me-2" />
                          <span>{cert}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>

            {/* ================= MENTORSHIP STATS ================= */}
            <div className="pi-ae-wrapper mt-5">
              <h4 className="pi-ae-title">Mentorship Overview</h4>
              <p className="pi-ae-subtitle">
                Your impact and contribution metrics
              </p>

              <div className="row g-4 mt-2">
                <PIMentorStatCard 
                  title="Total Mentees" 
                  value={profileData.menteeCount.toString()}
                  subtitle="Active candidates"
                  icon={<FaUserGraduate />}
                  color="primary"
                />
                <PIMentorStatCard 
                  title="Training Hours" 
                  value="847h" 
                  subtitle="Mentorship provided"
                  icon={<FaChalkboardTeacher />}
                  color="success"
                />
                <PIMentorStatCard 
                  title="Pending Reviews" 
                  value="5" 
                  subtitle="Awaiting feedback"
                  icon={<FaExclamationTriangle />}
                  color="warning"
                />
                <PIMentorStatCard 
                  title="Mentor Rating" 
                  value="4.9 ⭐" 
                  subtitle="From 47 reviews"
                  icon={<FaStar />}
                  color="info"
                />
              </div>
            </div>

            {/* ================= MENTOR COMPETENCIES ================= */}
            <div className="row g-4 mt-5">
              <div className="col-lg-6">
                <div className="pi-card">
                  <h4 className="pi-card-title">Mentorship Competencies</h4>
                  <Competency label="Technical Guidance" value={94} />
                  <Competency label="Candidate Development" value={90} />
                  <Competency label="Progress Assessment" value={88} />
                  <Competency label="Feedback & Evaluation" value={92} />
                  <Competency label="Industry Knowledge" value={96} />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="pi-card">
                  <h4 className="pi-card-title">Recent Mentorship Activities</h4>
                  <TimelineItem
                    date="Today"
                    title="Reviewed candidate logbook entries"
                    type="mentor"
                  />
                  <TimelineItem
                    date="Yesterday"
                    title="Conducted progress review meeting"
                    type="mentor"
                  />
                  <TimelineItem
                    date="2 days ago"
                    title="Approved rotation completion"
                    type="mentor"
                  />
                  <TimelineItem
                    date="3 days ago"
                    title="Provided technical feedback"
                    type="mentor"
                  />
                  <TimelineItem
                    date={profileData.memberSince}
                    title="Joined as Verified Mentor"
                    type="start"
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

const PIStatusRow = ({ title, status, icon }) => (
  <div className="pi-status-row">
    <div className="d-flex align-items-center gap-3">
      <div className={`pi-icon ${status}`}>
        {icon}
      </div>
      <strong>{title}</strong>
    </div>
    <span className={`pi-pill ${status}`}>
      {status === "verified" ? "Verified" : "Pending"}
    </span>
  </div>
);

const PIMentorStatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="col-lg-3 col-md-6">
    <div className={`pi-stat-card pi-stat-${color}`}>
      <div className="pi-stat-icon">
        {icon}
      </div>
      <div className="pi-stat-content">
        <h4>{value}</h4>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </div>
  </div>
);

const Competency = ({ label, value }) => (
  <div className="pi-competency">
    <div className="d-flex justify-content-between">
      <span>{label}</span>
      <strong>{value}%</strong>
    </div>
    <div className="pi-progress">
      <div
        className="pi-progress-fill pi-progress-mentor"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const TimelineItem = ({ date, title, type }) => (
  <div className="pi-timeline-item">
    <div className={`pi-dot ${type}`} />
    <div className="pi-timeline-content">
      <span className="pi-timeline-date">{date}</span>
      <strong>{title}</strong>
    </div>
  </div>
);

export default MentorProfessionalIdentity;