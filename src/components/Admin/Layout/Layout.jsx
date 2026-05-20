import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

const AppLayout = ({ children }) => {
  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
