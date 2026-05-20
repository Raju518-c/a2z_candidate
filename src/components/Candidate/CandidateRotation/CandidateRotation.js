import React from "react";
import CandidateSidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import { FaCheckCircle, FaClock, FaCalendarAlt, FaUser } from "react-icons/fa";
import "./CandidateRotation.css";

const DepartmentRotation = () => {
  return (
    <div className="dr-layout-wrapper">
      <CandidateSidebar />

      <div className="dr-main-wrapper">
        <Header />

        <div className="dr-content-area">
          <div className="container-fluid">

            {/* HEADER CARD */}
            <div className="drp-header-card card mb-4">
              <div className="card-body p-4">
                <h4 className="drp-title">Departmental Rotation Program</h4>
                <p className="drp-subtitle">
                  18-24 months structured training across all departments
                </p>

                <div className="drp-progress-wrapper">
                  <div className="d-flex justify-content-between flex-wrap gap-3">
                    <h6>Overall Progress</h6>
                    <h4 className="drp-progress-count">2/6</h4>
                  </div>

                  <div className="progress drp-progress-bar">
                    <div className="progress-bar" style={{ width: "33%" }} />
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span className="drp-muted">
                      2 departments completed, 4 remaining
                    </span>

                    <div className="text-end">
                      <p className="drp-current">Currently in QA/QC</p>
                      <small className="drp-muted">Started 17 Jan 2024</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETED DEPARTMENTS */}
            <DepartmentCard
              title="Manufacturing"
              status="Completed"
              description="Steel fabrication, assembly, and structural construction processes"
              date="15 Jun 2023 - 15 Oct 2023"
              supervisor="John Mitchell"
              score="88%"
              learnings={[
                "Steel fabrication processes",
                "Weld quality assessment",
                "Material traceability"
              ]}
            />

            <DepartmentCard
              title="Coating"
              status="Completed"
              description="Surface preparation, coating application, and corrosion protection"
              date="16 Oct 2023 - 16 Jan 2024"
              supervisor="Sarah Chen"
              score="92%"
              learnings={[
                "Surface preparation",
                "Coating application",
                "DFT measurement"
              ]}
            />

            {/* ACTIVE DEPARTMENT */}
            <div className="drp-active-card card mb-4">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3">
                  <div className="drp-active-icon">
                    <FaClock />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0">QA/QC</h5>
                      <span className="badge bg-info">In Progress</span>
                    </div>

                    <p className="drp-muted">
                      Quality assurance procedures, documentation, and compliance verification
                    </p>

                    <div className="drp-meta">
                      <span><FaCalendarAlt /> 17 Jan 2024</span>
                      <span><FaUser /> Michael Torres</span>
                    </div>

                    <hr />

                    <h6>Key Learnings</h6>
                    <div className="drp-tag-group">
                      <span className="drp-tag">Quality procedures</span>
                      <span className="drp-tag">NCR management</span>
                      <span className="drp-tag">Audit processes</span>
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <span className="badge bg-warning text-dark">
                        Competency Checklist - In Progress
                      </span>

                      <button className="btn btn-outline-secondary">
                        View Checklist →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UPCOMING */}
            <div className="card drp-upcoming-card mb-4">
              <div className="card-body">

                <UpcomingItem
                  index="4"
                  title="Testing"
                  description="NDT methods, pressure testing, and performance verification"
                  date="17 May 2024"
                />

                <UpcomingItem
                  index="5"
                  title="Dispatch & Logistics"
                  description="Material handling, shipping, and logistics management"
                  date="17 Sept 2024"
                />

                <UpcomingItem
                  index="6"
                  title="Marine Assets"
                  description="Offshore structures, vessels, and marine equipment inspection"
                  date="17 Jan 2025"
                />

              </div>
            </div>

            {/* ABOUT */}
            <div className="card drp-about-card">
              <div className="card-body">
                <h5 className="mb-4">About the Rotation Program</h5>

                <div className="row">
                  <AboutBox
                    title="6 Departments"
                    text="Comprehensive exposure to all aspects of surveying and inspection"
                  />

                  <AboutBox
                    title="18-24 Months"
                    text="Structured timeline with 3-4 months per department"
                  />

                  <AboutBox
                    title="Expert Supervision"
                    text="Dedicated supervisors and mentors in each department"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};


/* SUB COMPONENTS */

const DepartmentCard = ({
  title,
  status,
  description,
  date,
  supervisor,
  score,
  learnings
}) => (
  <div className="card drp-department-card mb-4">
    <div className="card-body">
      <div className="d-flex justify-content-between">
        <div>
          <div className="d-flex align-items-center gap-2">
            <FaCheckCircle className="drp-success-icon" />
            <h5 className="mb-0">{title}</h5>
            <span className="badge bg-success">{status}</span>
          </div>

          <p className="drp-muted">{description}</p>

          <div className="drp-meta">
            <span><FaCalendarAlt /> {date}</span>
            <span><FaUser /> {supervisor}</span>
          </div>
        </div>

        <div className="text-md-end text-start">
          <h3 className="drp-score">{score}</h3>
          <small className="drp-muted">Evaluation Score</small>
        </div>
      </div>

      <hr />

      <h6>Key Learnings</h6>
      <div className="drp-tag-group">
        {learnings.map((item, i) => (
          <span key={i} className="drp-tag">{item}</span>
        ))}
      </div>
    </div>
  </div>
);


const UpcomingItem = ({ index, title, description, date }) => (
  <div className="drp-upcoming-item d-flex gap-3">
    <div className="drp-upcoming-index">{index}</div>

    <div className="flex-grow-1">
      <h6 className="drp-upcoming-title">{title}</h6>
      <p className="drp-upcoming-desc">{description}</p>

      <small className="drp-muted">
        <FaCalendarAlt /> {date}
      </small>
    </div>
  </div>
);


const AboutBox = ({ title, text }) => (
  <div className="col-md-4">
    <div className="drp-about-box">
      <h6>{title}</h6>
      <p className="drp-muted">{text}</p>
    </div>
  </div>
);

export default DepartmentRotation;
