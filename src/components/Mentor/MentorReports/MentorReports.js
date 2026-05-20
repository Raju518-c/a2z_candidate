import React from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./MentorReports.css";

const MentorReportsPage = () => {
  return (
    <div className="ta-layout-wrapper">

      {/* Sidebar */}
      <MentorSidebar />

      {/* Main Wrapper */}
      <div className="ta-main-wrapper">

        {/* Header */}
        <Header />

        {/* Content */}
        <div className="ta-content-area">
          <div className="ta-reports-page">

            {/* Page Header */}
            <div className="ta-reports-header d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-semibold">Reports</h4>
                <p className="text-muted mb-0">
                  Generate and download supervision reports
                </p>
              </div>

              <button className="btn ta-reports-export-btn">
                ⬇ Export All Reports
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <select className="form-select ta-reports-filter">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Reports Grid */}
            <div className="row g-4">

              {[
                {
                  title: "Monthly Supervision Summary",
                  desc: "Overview of all supervision activities, approvals, and candidate progress",
                  freq: "Monthly",
                  last: "2024-01-28",
                  icon: "📊"
                },
                {
                  title: "Candidate Progress Report",
                  desc: "Detailed breakdown of individual candidate metrics and milestones",
                  freq: "Weekly",
                  last: "2024-01-25",
                  icon: "👥"
                },
                {
                  title: "Exposure Hours Analysis",
                  desc: "Department-wise exposure hours distribution and trends",
                  freq: "Weekly",
                  last: "2024-01-27",
                  icon: "⏱"
                },
                {
                  title: "Compliance Status Report",
                  desc: "Current compliance status for all candidates with expiry alerts",
                  freq: "Daily",
                  last: "2024-01-28",
                  icon: "📄"
                },
                {
                  title: "Promotion Readiness Assessment",
                  desc: "Candidates eligible for level progression with supporting evidence",
                  freq: "Monthly",
                  last: "2024-01-20",
                  icon: "📈"
                },
                {
                  title: "Department Distribution",
                  desc: "Visual breakdown of candidates across departments and rotations",
                  freq: "Weekly",
                  last: "2024-01-26",
                  icon: "🕘"
                }
              ].map((report, index) => (
                <div className="col-lg-4" key={index}>
                  <div className="ta-reports-card">

                    <div className="d-flex mb-3">
                      <div className="ta-reports-icon">
                        {report.icon}
                      </div>

                      <div>
                        <h6 className="fw-semibold mb-1">{report.title}</h6>
                        <p className="text-muted small mb-2">{report.desc}</p>

                        <div className="ta-reports-meta">
                          <span className="ta-reports-badge">{report.freq}</span>
                          <span className="ms-2 text-muted small">
                            Last: {report.last}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="d-flex gap-2">
                      <button className="btn ta-reports-preview w-50">
                        📄 Preview
                      </button>

                      <button className="btn ta-reports-download w-50">
                        ⬇ Download
                      </button>
                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* Recent Downloads */}
            <div className="ta-reports-downloads mt-5">
              <h5 className="mb-3">Recent Downloads</h5>

              {[
                {
                  name: "Monthly_Summary_Jan2024.pdf",
                  date: "2024-01-28",
                  size: "245 KB"
                },
                {
                  name: "Compliance_Report_Week4.pdf",
                  date: "2024-01-27",
                  size: "128 KB"
                },
                {
                  name: "Candidate_Progress_SarahM.pdf",
                  date: "2024-01-25",
                  size: "312 KB"
                }
              ].map((file, i) => (
                <div key={i} className="ta-reports-download-item">
                  <div>
                    <h6 className="mb-1">{file.name}</h6>
                    <small className="text-muted">
                      {file.date} • {file.size}
                    </small>
                  </div>

                  <button className="ta-reports-download-icon">
                    ⬇
                  </button>
                </div>
              ))}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorReportsPage;
