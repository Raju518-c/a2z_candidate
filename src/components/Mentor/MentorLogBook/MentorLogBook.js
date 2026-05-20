import React from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./MentorLogBook.css";

const MentorLogbookApprovalsPage = () => {
  return (
    <div className="ta-layout-wrapper">

      {/* Sidebar */}
      <MentorSidebar />

      {/* Main Area */}
      <div className="ta-main-wrapper">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="ta-content-area">

          <div className="la-logbook-page">

            {/* Page Heading */}
            <div className="mb-4">
              <h4 className="fw-semibold">Logbook Approvals</h4>
              <p className="text-muted mb-0">
                Review and approve candidate logbook entries
              </p>
            </div>

            <div className="row g-3">

              {/* LEFT PANEL */}
              <div className="col-lg-4">

                <h6 className="la-section-title mb-3">
                  Pending Entries (3)
                </h6>

                <div className="la-entry-card la-entry-active">
                  <div className="d-flex justify-content-between">
                    <h6>Priya Sharma</h6>
                    <span>›</span>
                  </div>

                  <small className="text-muted">2024-01-28</small>

                  <p className="la-entry-desc">
                    Conducted ultrasonic thickness measurements...
                  </p>

                  <div className="d-flex gap-2">
                    <span className="la-badge">8h</span>
                    <span className="la-badge">📎 2</span>
                  </div>
                </div>

                <div className="la-entry-card">
                  <div className="d-flex justify-content-between">
                    <h6>Arjun Patel</h6>
                    <span>›</span>
                  </div>

                  <small className="text-muted">2024-01-27</small>

                  <p className="la-entry-desc">
                    Observed main engine overhaul procedure...
                  </p>

                  <div className="d-flex gap-2">
                    <span className="la-badge">10h</span>
                    <span className="la-badge">📎 1</span>
                  </div>
                </div>

              </div>

              {/* RIGHT PANEL */}
              <div className="col-lg-8">

                <div className="la-details-card">

                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h5>Priya Sharma</h5>
                      <p className="text-muted mb-0">
                        Logbook Entry Review
                      </p>
                    </div>

                    <span className="la-status-pill">
                      Pending Review
                    </span>
                  </div>

                  <div className="row g-3 mb-3">

                    <div className="col-md-6">
                      <div className="la-info-box">
                        <small>Date</small>
                        <h6>2024-01-28</h6>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="la-info-box">
                        <small>Site / Vessel</small>
                        <h6>MV Pacific Voyager</h6>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="la-info-box">
                        <small>Department</small>
                        <h6>Hull Inspection</h6>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="la-info-box">
                        <small>Hours Logged</small>
                        <h6>8 hours</h6>
                      </div>
                    </div>

                  </div>

                  <div className="mb-3">
                    <h6>Activity Description</h6>

                    <div className="la-description-box">
                      Conducted ultrasonic thickness measurements on hull plating...
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6>Attached Evidence</h6>

                    <div className="d-flex gap-2">
                      <div className="la-file-pill">📄 photo_001.jpg</div>
                      <div className="la-file-pill">📄 ut_readings.pdf</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6>Mentor Comments</h6>

                    <textarea
                      className="form-control la-comment-box"
                      rows="3"
                      placeholder="Add your comments..."
                    />
                  </div>

                  <div className="d-flex gap-3">
                    <button className="btn la-btn-approve w-50">
                      ✔ Approve Entry
                    </button>

                    <button className="btn la-btn-reject w-50">
                      ✖ Reject Entry
                    </button>
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

export default MentorLogbookApprovalsPage;
