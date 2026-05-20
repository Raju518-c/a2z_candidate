import React from "react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import "./SuperAdminLayout.css";

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="ta-layout-wrapper">
      <SuperAdminSidebar />

      <div className="ta-main-wrapper">
        <SuperAdminHeader />
        <div className="ta-content-area">{children}</div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;