// SuperAdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUsers,
  FaLayerGroup,
  FaBuilding,
  FaShieldAlt,
  FaCertificate,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBook,
  FaMoneyBill,
  FaUserTie,
  FaGlobe,
  FaProjectDiagram
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./SuperAdminSidebar.css";
import A2ZLogo from "../Shared/Images/A2Zlogo.jpeg";

const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("superadmin_user");
    if (data) {
      try {
        setUser(JSON.parse(data));
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
  }, []);

  const isActive = (paths) => {
    const arr = Array.isArray(paths) ? paths : [paths];
    return arr.some(
      (p) => location.pathname === p || location.pathname.startsWith(p + "/")
    );
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("superadmin_user");
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  const getInitials = () =>
    user?.full_name?.slice(0, 2)?.toUpperCase() || "SA";

  const getName = () =>
    user?.full_name || "Super Admin";

  const getEmail = () =>
    user?.email || "superadmin@oceanstar.com";

  return (
    <aside className="ta-sidebar">
      {/* HEADER */}
      <div className="ta-sidebar-header">
        <div className="ta-logo-icon">
          <img src={A2ZLogo} alt="logo" />
        </div>
        <div>
          <h6 className="mb-0">Super Admin</h6>
          <small>OCEANSTAR</small>
        </div>
      </div>

      {/* SCROLL */}
      <div className="ta-sidebar-scroll">

        {/* MAIN */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">MAIN</p>

          <Link to="/super-dashboard" className={`ta-menu-item ${isActive("/super-dashboard") ? "active" : ""}`}>
            <FaThLarge /> Dashboard
          </Link>

          <Link to="/control-tower" className={`ta-menu-item ${isActive("/control-tower") ? "active" : ""}`}>
            <FaProjectDiagram /> Control Tower
          </Link>

          <Link to="/super-users" className={`ta-menu-item ${isActive("/super-users") ? "active" : ""}`}>
            <FaUsers /> User Management
          </Link>

          <Link to="/super-levels" className={`ta-menu-item ${isActive("/super-levels") ? "active" : ""}`}>
            <FaLayerGroup /> Levels Management
          </Link>

          <Link to="/super-departments" className={`ta-menu-item ${isActive("/super-departments") ? "active" : ""}`}>
            <FaBuilding /> Department Structure
          </Link>
        </div>

        {/* COMPLIANCE */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">COMPLIANCE</p>

          <Link to="/super-compliance" className={`ta-menu-item ${isActive("/super-compliance") ? "active" : ""}`}>
            <FaShieldAlt /> Compliance
          </Link>

          <Link to="/super-certifications" className={`ta-menu-item ${isActive("/super-certifications") ? "active" : ""}`}>
            <FaCertificate /> Certifications
          </Link>

          <Link to="/super-lms" className={`ta-menu-item ${isActive("/super-lms") ? "active" : ""}`}>
            <FaBook /> LMS
          </Link>
        </div>

        {/* SYSTEM */}
        <div className="ta-menu-section">
          <p className="ta-menu-title">SYSTEM</p>

          <Link to="/super-reports" className={`ta-menu-item ${isActive("/super-reports") ? "active" : ""}`}>
            <FaChartBar /> Reports
          </Link>

          <Link to="/system-settings" className={`ta-menu-item ${isActive("/system-settings") ? "active" : ""}`}>
            <FaCog /> System Settings
          </Link>

          <Link to="/finance" className={`ta-menu-item ${isActive("/finance") ? "active" : ""}`}>
            <FaMoneyBill /> Finance
          </Link>

          <Link to="/hr-module" className={`ta-menu-item ${isActive("/hr-module") ? "active" : ""}`}>
            <FaUserTie /> HR Module
          </Link>

          <Link to="/affiliates" className={`ta-menu-item ${isActive("/affiliates") ? "active" : ""}`}>
            <FaGlobe /> Affiliates
          </Link>
        </div>
      </div>

      {/* FOOTER (same as admin FIX) */}
      <div className="ta-sidebar-footer">
        <div className="ta-user-info-wrapper">
          <div className="ta-avatar">{getInitials()}</div>

          <div className="ta-user-details">
            <p className="ta-user-name">{getName()}</p>
            <span className="ta-user-email">{getEmail()}</span>
          </div>

          <button className="ta-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;