import React from "react";
import CandidateSidebar from "./CandidateSidebar";
import Header from "./CandidateHeader";
import "./Layout.css";

const CandidateLayout = ({ children }) => {
  return (
    <div className="ta-layout-wrapper">
      <CandidateSidebar />

      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">{children}</div>
      </div>
    </div>
  );
};

export default CandidateLayout;