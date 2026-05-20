import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUserGraduate,
  FaUserTie,
  FaLayerGroup,
  FaBuilding,
  FaSyncAlt,
  FaShieldAlt,
  FaCertificate,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaEnvelope,
  FaBook,
  FaStar,
  FaIdCard,
  FaBullhorn
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./Sidebar.css";
import A2ZLogo from "../../Shared/Images/A2Zlogo.jpeg"; // Import the logo

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage based on user_type
  useEffect(() => {
    const adminData = localStorage.getItem("admin_user");

    if (adminData) {
      try {
        const parsedUser = JSON.parse(adminData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing admin user data:", error);
      }
    }
  }, []);

  // Helper function to check if a path is active (including sub-routes)
  const isActive = (paths) => {
    // If a single string is passed, convert to array for uniform handling
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));
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
        // Clear admin user data
        localStorage.removeItem("admin_user");
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
      return user.full_name.substring(0, 2).toUpperCase();
    } else if (user?.identifier) {
      return user.identifier.substring(0, 2).toUpperCase();
    }
    return "AD";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    } else if (user?.identifier) {
      return user.identifier.split("@")[0]; // Show username part of email
    }
    return "Admin User";
  };

  // Get display email
  const getDisplayEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.identifier && user.identifier.includes("@")) {
      return user.identifier;
    }
    return "admin@company.com";
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
          <h6 className="mb-0">Training Admin</h6>
          <small>Surveyor Management</small>
        </div>
      </div>

      {/* Scrollable Menu */}
      <div className="ta-sidebar-scroll">
        {/* MAIN */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">MAIN</p>

          <Link
            to="/dashboard"
            className={`ta-menu-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <FaThLarge /> Dashboard
          </Link>

          <Link
            to="/admin-professional-identity"
            className={`ta-menu-item ${isActive("/admin-professional-identity") ? "active" : ""}`}
          >
            <FaIdCard /> Professional ID
          </Link>

          <Link
            to="/users"
            className={`ta-menu-item ${isActive(["/users", "/add-admin-users"]) ? "active" : ""}`}
          >
            <FaUsers /> Users
          </Link>

          <Link
            to="/mentor"
            className={`ta-menu-item ${isActive(["/mentor", "/add-mentor"]) ? "active" : ""}`}
          >
            <FaUserTie /> Mentors
          </Link>

          <Link
            to="/candidate"
            className={`ta-menu-item ${isActive(["/candidate", "/add-candidate"]) ? "active" : ""}`}
          >
            <FaUserGraduate /> Candidates
          </Link>

          <Link
            to="/level"
            className={`ta-menu-item ${isActive(["/level", "/level/add"]) ? "active" : ""}`}
          >
            <FaLayerGroup /> Levels Management
          </Link>

          <Link
            to="/department"
            className={`ta-menu-item ${isActive(["/department", "/department/add"]) ? "active" : ""}`}
          >
            <FaBuilding /> Departments
          </Link>

          <Link
            to="/department-level"
            className={`ta-menu-item ${isActive(["/department-level", "/add-department-level"]) ? "active" : ""}`}
          >
            <FaLayerGroup /> Department Level
          </Link>
        </div>

        {/* COMPLIANCE */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">COMPLIANCE</p>

          <Link
            to="/admin-competency"
            className={`ta-menu-item ${isActive(["/admin-competency", "/admin-add-competency"]) ? "active" : ""}`}
          >
            <FaStar /> Competency
          </Link>

          <Link
            to="/compliance"
            className={`ta-menu-item ${isActive(["/compliance", "/compliance/add"]) ? "active" : ""}`}
          >
            <FaShieldAlt /> Compliance Manage
          </Link>

          <Link
            to="/certificate"
            className={`ta-menu-item ${isActive(["/certificate", "/certification-categories"]) ? "active" : ""}`}
          >
            <FaCertificate /> Certifications
          </Link>

          <Link
            to="/announcements"
            className={`ta-menu-item ${isActive(["/announcements", "/add-announcement"]) ? "active" : ""}`}
          >
            <FaBullhorn /> Announcements
          </Link>


          <Link
            to="/learning"
            className={`ta-menu-item ${isActive(["/learning", "/add-learning"]) ? "active" : ""}`}
          >
            <FaBook /> Learning
          </Link>
        </div>

        {/* SYSTEM */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">SYSTEM</p>

          <Link
            to="/report"
            className={`ta-menu-item ${isActive("/report") ? "active" : ""}`}
          >
            <FaChartBar /> Reports & Analytics
          </Link>

          <Link
            to="/audit"
            className={`ta-menu-item ${isActive("/audit") ? "active" : ""}`}
          >
            <FaFileAlt /> Audit Logs
          </Link>

          <Link
            to="/email-settings"
            className={`ta-menu-item ${isActive(["/email-settings", "/add-email-settings"]) ? "active" : ""}`}
          >
            <FaEnvelope /> Settings
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

export default Sidebar;