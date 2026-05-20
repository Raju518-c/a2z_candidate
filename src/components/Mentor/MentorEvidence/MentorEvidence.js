import React from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./MentorEvidence.css";

const MentorEvidenceReviewPage = () => {
  return (
    <div className="ta-layout-wrapper">

      {/* Sidebar */}
      <MentorSidebar />

      {/* Main Area */}
      <div className="ta-main-wrapper">

        {/* Header */}
        <Header />

        {/* Content */}
        <div className="ta-content-area">
          <div className="er-page">

            {/* Page Heading */}
            <div className="er-header mb-4">
              <h4 className="fw-semibold">Evidence Review</h4>
              <p className="text-muted mb-0">
                Review and validate submitted evidence from candidates
              </p>
            </div>

            {/* Filters */}
            <div className="row g-3 mb-4">

              <div className="col-lg-4">
                <input
                  type="text"
                  className="form-control er-search"
                  placeholder="Search evidence..."
                />
              </div>

              <div className="col-lg-2">
                <select className="form-select er-select">
                  <option>All Types</option>
                </select>
              </div>

              <div className="col-lg-2">
                <select className="form-select er-select">
                  <option>Pending</option>
                </select>
              </div>

            </div>

            {/* Stat Cards */}
            <div className="row g-3 mb-4">

              <div className="col-md-3">
                <div className="er-stat-card">
                  <h3>6</h3>
                  <p>Total Items</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="er-stat-card">
                  <h3 className="text-warning">4</h3>
                  <p>Pending Review</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="er-stat-card">
                  <h3 className="text-success">1</h3>
                  <p>Approved</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="er-stat-card">
                  <h3 className="text-danger">1</h3>
                  <p>Rejected</p>
                </div>
              </div>

            </div>

            {/* Evidence Cards */}
            <div className="row g-3">

              {/* Card 1 */}
              <div className="col-lg-4">
                <div className="er-evidence-card">

                  <div className="er-thumbnail">
                    📷
                  </div>

                  <div className="er-evidence-body">

                    <div className="d-flex justify-content-between">
                      <h6>Hull Plating Corrosion - Frame 48</h6>
                      <span className="er-badge er-badge-pending">
                        Pending
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-muted small">
                      <span>Priya Sharma</span>
                      <span>2024-01-28</span>
                    </div>

                    <hr />

                    <div className="er-actions">
                      <span>👁 View</span>
                      <span className="text-success">✔</span>
                      <span className="text-danger">✖</span>
                      <span>💬</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-lg-4">
                <div className="er-evidence-card">

                  <div className="er-thumbnail">
                    📄
                  </div>

                  <div className="er-evidence-body">

                    <div className="d-flex justify-content-between">
                      <h6>UT Thickness Readings Report</h6>
                      <span className="er-badge er-badge-pending">
                        Pending
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-muted small">
                      <span>Priya Sharma</span>
                      <span>2024-01-28</span>
                    </div>

                    <hr />

                    <div className="er-actions">
                      <span>👁 View</span>
                      <span className="text-success">✔</span>
                      <span className="text-danger">✖</span>
                      <span>💬</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-lg-4">
                <div className="er-evidence-card">

                  <div className="er-thumbnail">
                    📄
                  </div>

                  <div className="er-evidence-body">

                    <div className="d-flex justify-content-between">
                      <h6>Main Engine Condition Report</h6>
                      <span className="er-badge er-badge-approved">
                        Approved
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-muted small">
                      <span>Arjun Patel</span>
                      <span>2024-01-27</span>
                    </div>

                    <hr />

                    <div className="er-actions">
                      <span>👁 View</span>
                      <span className="text-success">✔</span>
                      <span className="text-danger">✖</span>
                      <span>💬</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorEvidenceReviewPage;
