// AdminProfessionalIdentity.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar"; // Admin Sidebar
import Header from "../Layout/Header"; // Admin Header
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaShareAlt,
  FaDownload,
  FaSpinner,
  FaShieldAlt,
  FaUsers,
  FaBuilding,
  FaCalendarAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./AdminProfessionalIdentity.css";

const AdminProfessionalIdentity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    adminId: "",
    memberSince: "",
    accessLevel: "Full Access",
    department: "Training Administration",
    role: "Senior Administrator",
    permissions: [
      "User Management",
      "Compliance Oversight",
      "System Configuration",
      "Report Generation"
    ]
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const adminData = localStorage.getItem("admin_user");
      
      if (adminData) {
        const parsedUser = JSON.parse(adminData);
        setUser(parsedUser);
        
        const adminId = generateAdminId(parsedUser);
        const memberSince = formatMemberSince(parsedUser.login_time || parsedUser.created_at);
        
        setProfileData(prev => ({
          ...prev,
          adminId: adminId,
          memberSince: memberSince
        }));
        
        console.log("✅ Admin Professional Identity data loaded:", parsedUser);
      } else {
        console.warn("No admin user data found in localStorage");
      }
    } catch (error) {
      console.error("Error loading admin user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAdminId = (user) => {
    const year = new Date().getFullYear();
    const userId = user.user_id || user.id || "001";
    const deptCode = "ADM";
    return `ICSEM-${deptCode}-${year}-${userId.toString().padStart(4, '0')}`;
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
    return "AD";
  };

  const getUserName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0];
    }
    return "Administrator";
  };

  const getUserRole = () => {
    if (user?.role) {
      return user.role;
    }
    return "System Administrator";
  };

  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier) {
      return user.identifier;
    }
    return "admin@icsem.com";
  };

  const getUserPhone = () => {
    return user?.phone_number || user?.phone || "Not provided";
  };

  const getUserDepartment = () => {
    return user?.department || "Training & Compliance";
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
        <Sidebar />
        <div className="ta-main-wrapper">
          <Header />
          <div className="ta-content-area">
            <div className="pi-loading-wrapper">
              <FaSpinner className="fa-spin fa-3x" />
              <p className="mt-3">Loading administrator identity...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-layout-wrapper">
      {/* Sidebar */}
      <Sidebar />

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
                <h3 className="pi-title">Administrator Identity</h3>
                <p className="pi-subtitle">
                  Your verified administrative credentials and access profile
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
                <div className="pi-id-card pi-id-card-admin">
                  <div className="pi-id-header">
                    <div className="pi-logo">🛡️</div>
                    <span>ICSEM Admin Portal</span>
                  </div>

                  <div className="pi-profile">
                    <div className="pi-avatar pi-avatar-admin">{getUserInitials()}</div>
                    <h4>{getUserName()}</h4>
                    <p>{getUserRole()}</p>
                    <span className="pi-badge pi-badge-admin">
                      <FaShieldAlt className="me-1" /> Administrator
                    </span>
                  </div>

                  <div className="pi-id-box">
                    <span>Administrator ID</span>
                    <strong>{profileData.adminId}</strong>
                  </div>

                  <div className="pi-meta-grid">
                    <div className="pi-meta">
                      <span>Access Level</span>
                      <strong>{profileData.accessLevel}</strong>
                    </div>
                    <div className="pi-meta">
                      <span>Department</span>
                      <strong>{getUserDepartment()}</strong>
                    </div>
                  </div>

                  <div className="pi-discipline">
                    <span>Primary Role</span>
                    <strong>{profileData.role}</strong>
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
                    <span>Member since {profileData.memberSince}</span>
                    <span>🔒 Secured</span>
                  </div>
                </div>
              </div>

              {/* ================= VERIFICATION STATUS ================= */}
              <div className="col-lg-8">
                <div className="pi-status-card">
                  <h5 className="mb-1">Administrative Verification Status</h5>
                  <p className="pi-muted">
                    Your security clearance and compliance verification
                  </p>

                  <PIStatusRow 
                    title="Identity Verified" 
                    status="verified" 
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Security Clearance" 
                    status="verified"
                    icon={<FaShieldAlt />}
                  />
                  <PIStatusRow 
                    title="Admin Access Level" 
                    status="verified"
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Compliance Training" 
                    status="verified"
                    icon={<FaCheckCircle />}
                  />
                  <PIStatusRow 
                    title="Two-Factor Authentication" 
                    status="verified"
                    icon={<FaShieldAlt />}
                  />
                </div>

                {/* <div className="pi-permissions-card mt-4">
                  <h5 className="mb-3">System Permissions</h5>
                  <div className="row g-3">
                    {profileData.permissions.map((permission, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="pi-permission-item">
                          <FaCheckCircle className="text-success me-2" />
                          <span>{permission}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}

                
              </div>
            </div>

            {/* ================= SYSTEM OVERVIEW ================= */}
            {/* <div className="pi-ae-wrapper mt-5">
              <h4 className="pi-ae-title">Administrative Overview</h4>
              <p className="pi-ae-subtitle">
                System management metrics and responsibilities
              </p>

              <div className="row g-4 mt-2">
                <PIStatCard 
                  title="Active Users" 
                  value="247" 
                  subtitle="Total platform users"
                  icon={<FaUsers />}
                  color="primary"
                />
                <PIStatCard 
                  title="Departments" 
                  value="8" 
                  subtitle="Managed departments"
                  icon={<FaBuilding />}
                  color="success"
                />
                <PIStatCard 
                  title="Pending Approvals" 
                  value="12" 
                  subtitle="Awaiting review"
                  icon={<FaExclamationTriangle />}
                  color="warning"
                />
                <PIStatCard 
                  title="System Uptime" 
                  value="99.9%" 
                  subtitle="Last 30 days"
                  icon={<FaCalendarAlt />}
                  color="info"
                />
              </div>
            </div> */}

            {/* ================= ADMIN COMPETENCIES ================= */}
            <div className="row g-4 mt-5">
              <div className="col-lg-6">
                <div className="pi-card">
                  <h4 className="pi-card-title">Administrative Competencies</h4>
                  <Competency label="User Management" value={95} />
                  <Competency label="Compliance Oversight" value={92} />
                  <Competency label="System Configuration" value={88} />
                  <Competency label="Report Generation" value={90} />
                  <Competency label="Security Management" value={94} />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="pi-card">
                  <h4 className="pi-card-title">Recent Administrative Actions</h4>
                  <TimelineItem
                    date="Today"
                    title="User permission update completed"
                    type="admin"
                  />
                  <TimelineItem
                    date="Yesterday"
                    title="Monthly compliance report generated"
                    type="admin"
                  />
                  <TimelineItem
                    date="2 days ago"
                    title="New department structure configured"
                    type="admin"
                  />
                  <TimelineItem
                    date="3 days ago"
                    title="Security audit completed"
                    type="admin"
                  />
                  <TimelineItem
                    date={profileData.memberSince}
                    title="Joined as Administrator"
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

const PIStatCard = ({ title, value, subtitle, icon, color }) => (
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
        className="pi-progress-fill pi-progress-admin"
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

export default AdminProfessionalIdentity;