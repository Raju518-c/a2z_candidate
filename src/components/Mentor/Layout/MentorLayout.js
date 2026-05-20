import React from "react";
import MentorSidebar from "./MentorSidebar";
import Header from "./MentorHeader";
import "./Layout.css";

const MentorLayout = ({ children }) => {
  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />

      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">{children}</div>
      </div>
    </div>
  );
};

export default MentorLayout;