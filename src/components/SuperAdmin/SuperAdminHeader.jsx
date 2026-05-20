import React, { useEffect } from "react";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";

const SuperAdminHeader = () => {
  const user = JSON.parse(localStorage.getItem("superadmin_user"));

  useEffect(() => {
    document.title = user?.full_name
      ? `${user.full_name} (Super Admin)`
      : "OCEANSTAR";
  }, [user]);

  return (
    <header className="ta-header">
      <div className="d-flex align-items-center gap-3">
        <FaBars className="ta-header-icon" />

        <div className="ta-search-box">
          <FaSearch />
          <input placeholder="Search..." />
        </div>
      </div>

      <div className="ta-notification">
        <FaBell />
        <span className="ta-badge">5</span>
      </div>
    </header>
  );
};

export default SuperAdminHeader;