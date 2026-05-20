import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaIdCard,
  FaBook,
  FaCheckCircle,
  FaCertificate,
  FaShieldAlt,
  FaGraduationCap,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaBullhorn,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./Sidebar.css";
import A2ZLogo from "../../Shared/Images/A2Zlogo.jpeg"; // Import the logo

const CandidateSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage based on user_type
  useEffect(() => {
    const candidateData = localStorage.getItem("candidate_user");

    if (candidateData) {
      try {
        const parsedUser = JSON.parse(candidateData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing candidate user data:", error);
      }
    }
  }, []);

  // Helper function to check if a path is active (including sub-routes)
  const isActive = (paths) => {
    // If a single string is passed, convert to array for uniform handling
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/"),
    );
  };

  // Handle logout
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the system",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("candidate_user");
        localStorage.removeItem("token");

        Swal.fire({
          icon: "success",
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/");
      }
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    } else if (user?.identifier) {
      return user.identifier.substring(0, 2).toUpperCase();
    }
    return "CA";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0]; // Show username part of email
    }
    return "Candidate User";
  };

  // Get display email
  const getDisplayEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier && user.identifier.includes("@")) {
      return user.identifier;
    }
    return "candidate@company.com";
  };

  return (
    <aside className="ta-sidebar">
      {/* Logo */}
      <div className="ta-sidebar-header">
        {/* A2Z Logo added here */}
        <div className="ta-logo-icon">
          <img 
            src={A2ZLogo} 
            alt="A2Z Logo" 
            style={{ 
              width: "40px",
              height: "40px",
              objectFit: "contain"
            }}
          />
        </div>
        <div>
          <h6 className="mb-0">ICSEM</h6>
          <small>Surveyor Platform</small>
        </div>
      </div>

      {/* Scrollable Menu */}
      <div className="ta-sidebar-scroll">
        {/* MAIN */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">MAIN</p>

          <Link
            to="/candidate-dashboard"
            className={`ta-menu-item ${isActive("/candidate-dashboard") ? "active" : ""}`}
          >
            <FaThLarge /> Dashboard
          </Link>

          <Link
            to="/candidate-professionality"
            className={`ta-menu-item ${isActive("/candidate-professionality") ? "active" : ""}`}
          >
            <FaIdCard /> Professional ID
          </Link>

          <Link
            to="/candidate-digital"
            className={`ta-menu-item ${isActive(["/candidate-digital", "/candidate/logbook/add"]) ? "active" : ""}`}
          >
            <FaBook /> Digital Logbook
          </Link>

          <Link
            to="/candidate-competence"
            className={`ta-menu-item ${isActive(["/candidate-competence", "/add-competence"]) ? "active" : ""}`}
          >
            <FaCheckCircle /> Competency
          </Link>

          {/* <Link
            to="/candidate-rotation"
            className={`ta-menu-item ${isActive("/candidate-rotation") ? "active" : ""}`}
          >
            <FaCertificate /> Rotation Program
          </Link> */}
        </div>

        {/* COMPLIANCE */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">COMPLIANCE</p>

          <Link
            to="/candidate-compliance"
            className={`ta-menu-item ${isActive(["/candidate-compliance", "/candidate-compliance/add-certificate"]) ? "active" : ""}`}
          >
            <FaShieldAlt /> Compliance & Safety
          </Link>

          <Link
            to="/candidate-certificate"
            className={`ta-menu-item ${isActive(["/candidate-certificate", "/candidate-certifications/add"]) ? "active" : ""}`}
          >
            <FaCertificate /> Certifications
          </Link>

          <Link
            to="/candidate-announcements"
            className={`ta-menu-item ${isActive(["/candidate-announcements", "/candidate-add-announcement"]) ? "active" : ""}`}
          >
            <FaBullhorn /> Announcements
          </Link>
        </div>

        {/* DEVELOPMENT */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">DEVELOPMENT</p>

          {/* <Link
            to="/candidate-learning"
            className={`ta-menu-item ${isActive("/candidate-learning") ? "active" : ""}`}
          >
            <FaGraduationCap /> Learning
          </Link> */}

          <Link
            to="/candidate-mentorship"
            className={`ta-menu-item ${isActive(["/candidate-mentorship", "/find-mentor"]) ? "active" : ""}`}
          >
            <FaUsers /> Mentorship
          </Link>
        </div>
      </div>

      {/* Footer with User Info and Logout */}
      <div className="ta-sidebar-footer">
        <div className="ta-user-info-wrapper">
          <div className="ta-avatar">{getUserInitials()}</div>
          <div className="ta-user-details">
            <p className="ta-user-name">{getDisplayName()}</p>
            <span className="ta-user-email">{getDisplayEmail()}</span>
          </div>
          <button
            className="ta-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CandidateSidebar;