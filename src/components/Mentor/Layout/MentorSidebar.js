import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUserGraduate,
  FaBook,
  FaEye,
  FaSyncAlt,
  FaShieldAlt,
  FaCommentAlt,
  FaChartBar,
  FaSignOutAlt,
  FaUserCircle,
  FaUser,
  FaUserPlus,
  FaCertificate,
  FaIdCard,
  FaBullhorn,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./Sidebar.css";
import A2ZLogo from "../../Shared/Images/A2Zlogo.jpeg"; // Import the logo

const MentorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage based on user_type
  useEffect(() => {
    const mentorData = localStorage.getItem("mentor_user");

    if (mentorData) {
      try {
        const parsedUser = JSON.parse(mentorData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing mentor user data:", error);
      }
    }
  }, []);

  const isActive = (path) => {
  if (Array.isArray(path)) {
    return path.includes(location.pathname);
  }
  return location.pathname === path;
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
        localStorage.removeItem("mentor_user");
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
    return "MN";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0]; // Show username part of email
    }
    return "Mentor User";
  };

  // Get display email
  const getDisplayEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier && user.identifier.includes("@")) {
      return user.identifier;
    }
    return "mentor@company.com";
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
              width: "50px",
              height: "50px",
              objectFit: "contain"
            }}
          />
        </div>
        <div>
          <h6 className="mb-0">InspectPro</h6>
          <small>Mentor Portal</small>
        </div>
      </div>

      {/* Scrollable Menu */}
      <div className="ta-sidebar-scroll">
        <div className="ta-menu-section">
          <Link
            to="/mentor-dashboard"
            className={`ta-menu-item ${isActive("/mentor-dashboard") ? "active" : ""}`}
          >
            <FaThLarge /> Dashboard
          </Link>

          <Link
            to="/mentor-professional-identity"
            className={`ta-menu-item ${isActive("/mentor-professional-identity") ? "active" : ""}`}
          >
            <FaIdCard /> Professional ID
          </Link>

          <Link
            to="/mentor-candidates"
            className={`ta-menu-item ${isActive("/mentor-candidates") ? "active" : ""}`}
          >
            <FaUserGraduate /> My Candidates
          </Link>

          {/* New Candidate Requests Menu Item */}
          <Link
            to="/mentor-requests"
            className={`ta-menu-item ${isActive("/mentor-requests") ? "active" : ""}`}
          >
            <FaUserPlus /> Candidate Requests
          </Link>

          <Link
            to="/progression-management"
            className={`ta-menu-item ${isActive("/progression-management") ? "active" : ""}`}
          >
            <FaUserPlus /> Progression Management
          </Link>

          {/* <Link
            to="/mentor-logbook"
            className={`ta-menu-item ${isActive("/mentor-logbook") ? "active" : ""}`}
          >
            <FaBook /> Logbook Approvals
          </Link> */}

          {/* <Link
            to="/mentor-evidence"
            className={`ta-menu-item ${isActive("/mentor-evidence") ? "active" : ""}`}
          >
            <FaEye /> Evidence Review
          </Link> */}

          {/* <Link
            to="/mentor-rotation"
            className={`ta-menu-item ${isActive("/mentor-rotation") ? "active" : ""}`}
          >
            <FaSyncAlt /> Rotation Tracking
          </Link> */}

          <Link
            to="/mentor-compliance"
            className={`ta-menu-item ${isActive("/mentor-compliance") ? "active" : ""}`}
          >
            <FaShieldAlt /> Compliance
          </Link>

          <Link
            to="/mentor-certificates"
            className={`ta-menu-item ${isActive("/mentor-certificates") ? "active" : ""}`}
          >
            <FaCertificate /> Certifications
          </Link>

          <Link
            to="/mentor-announcements"
            className={`ta-menu-item ${isActive(["/mentor-announcements", "/mentor-add-announcement"]) ? "active" : ""}`}
          >
            <FaBullhorn /> Announcements
          </Link>

          <Link
            to="/mentor-feedback"
            className={`ta-menu-item ${isActive("/mentor-feedback") ? "active" : ""}`}
          >
            <FaCommentAlt /> Feedback
          </Link>

          <Link
            to="/mentor-reports"
            className={`ta-menu-item ${isActive("/mentor-reports") ? "active" : ""}`}
          >
            <FaChartBar /> Reports
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

export default MentorSidebar;