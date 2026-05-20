import React from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./MentorRotation.css";

const MentorRotationTrackingPage = () => {
  return (
    <div className="ta-layout-wrapper">

      {/* Sidebar */}
      <MentorSidebar />

      {/* Main */}
      <div className="ta-main-wrapper">

        <Header />

        <div className="ta-content-area">
          <div className="rt-page">

            {/* Heading */}
            <div className="rt-header mb-4">
              <h4 className="fw-semibold">Rotation Tracking</h4>
              <p className="text-muted">
                Monitor candidate rotation progress across departments
              </p>
            </div>

            {/* Stat Cards */}
            <div className="row g-3 mb-4">

              <div className="col-md-3">
                <div className="rt-stat-card">
                  <h3>6</h3>
                  <p>Active Rotations</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="rt-stat-card">
                  <h3 className="text-success">2</h3>
                  <p>Completed This Month</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="rt-stat-card">
                  <h3 className="text-primary">4</h3>
                  <p>In Progress</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="rt-stat-card">
                  <h3 className="text-warning">1</h3>
                  <p>Behind Schedule</p>
                </div>
              </div>

            </div>

            {/* Candidate Card 1 */}
            <div className="rt-candidate-card mb-4">

              <div className="d-flex justify-content-between align-items-center">

                <div className="rt-candidate-info">
                  <div className="rt-avatar">PS</div>

                  <div>
                    <h6 className="mb-0">Priya Sharma</h6>
                    <small className="text-muted">Level 2</small>
                  </div>
                </div>

                <div className="rt-complete-pill">
                  2 / 6 Completed
                </div>
              </div>

              {/* Progress */}
              <div className="rt-progress-section">

                <div className="d-flex justify-content-between small mb-1">
                  <span>Overall Progress</span>
                  <span>33%</span>
                </div>

                <div className="progress rt-progress">
                  <div className="progress-bar" style={{ width: "33%" }} />
                </div>
              </div>

              {/* Steps */}
              <div className="rt-steps">

                <span className="rt-step rt-step-complete">
                  ✔ Hull Inspection
                </span>

                <span className="rt-step rt-step-complete">
                  ✔ Machinery Survey
                </span>

                <span className="rt-step rt-step-active">
                  ▶ Safety Equipment
                </span>

                <span className="rt-step">
                  ○ Electrical Systems
                </span>

                <span className="rt-step">
                  ○ Cargo Inspection
                </span>

                <span className="rt-step">
                  ○ Structural Survey
                </span>

              </div>

              {/* Footer */}
              <div className="rt-footer">

                <span>📅 Started: 2023-06-15</span>
                <span>📅 Expected End: 2025-06-15</span>
                <span>🕒 456 total hours</span>

              </div>

            </div>

            {/* Candidate Card 2 */}
            <div className="rt-candidate-card">

              <div className="d-flex justify-content-between align-items-center">

                <div className="rt-candidate-info">
                  <div className="rt-avatar">AP</div>

                  <div>
                    <h6 className="mb-0">Arjun Patel</h6>
                    <small className="text-muted">Level 1</small>
                  </div>
                </div>

                <div className="rt-complete-pill">
                  1 / 6 Completed
                </div>
              </div>

              {/* Progress */}
              <div className="rt-progress-section">

                <div className="d-flex justify-content-between small mb-1">
                  <span>Overall Progress</span>
                  <span>17%</span>
                </div>

                <div className="progress rt-progress">
                  <div className="progress-bar" style={{ width: "17%" }} />
                </div>
              </div>

              {/* Steps */}
              <div className="rt-steps">

                <span className="rt-step rt-step-complete">
                  ✔ Hull Inspection
                </span>

                <span className="rt-step rt-step-active">
                  ▶ Machinery Survey
                </span>

                <span className="rt-step">
                  ○ Safety Equipment
                </span>

                <span className="rt-step">
                  ○ Electrical Systems
                </span>

                <span className="rt-step">
                  ○ Cargo Inspection
                </span>

                <span className="rt-step">
                  ○ Structural Survey
                </span>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorRotationTrackingPage;
