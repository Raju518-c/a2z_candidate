import React from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import "./MentorFeedback.css";

const MentorFeedbackPage = () => {

  const history = [
    {
      initials: "PS",
      name: "Priya Sharma",
      date: "2024-01-25",
      type: "Performance",
      text: "Excellent progress on hull inspection techniques. Demonstrated strong attention to detail during ultrasonic thickness measurements. Ready for more complex assignments.",
      mentor: "Suresh Menon"
    },
    {
      initials: "AP",
      name: "Arjun Patel",
      date: "2024-01-20",
      type: "Improvement",
      text: "Needs to improve documentation accuracy. Several entries required corrections. Recommend additional training on technical report writing.",
      mentor: "Suresh Menon"
    },
    {
      initials: "AR",
      name: "Ananya Reddy",
      date: "2024-01-18",
      type: "Commendation",
      text: "Outstanding performance during safety equipment inspection drill. Showed leadership qualities and helped junior candidates understand procedures.",
      mentor: "Suresh Menon"
    }
  ];

  const badgeClass = (type) => {
    if (type === "Performance") return "tf-badge-blue";
    if (type === "Improvement") return "tf-badge-yellow";
    return "tf-badge-green";
  };

  return (
    <div className="tf-layout-wrapper">

      <MentorSidebar />

      <div className="tf-main-wrapper">

        <Header />

        <div className="tf-content-area">

          {/* Page Header */}
          <div className="tf-page-header">
            <h4 className="fw-semibold">Feedback</h4>
            <p>Provide and review mentor feedback for candidates</p>
          </div>

          <div className="row g-4">

            {/* LEFT FORM */}
            <div className="col-lg-4">

              <div className="tf-card">

                <h6 className="tf-card-title">New Feedback</h6>

                <div className="mb-3">
                  <label className="form-label">Candidate</label>
                  <select className="form-select tf-input">
                    <option>Select candidate</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Feedback Type</label>
                  <select className="form-select tf-input">
                    <option>Select type</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Feedback</label>
                  <textarea
                    className="form-control tf-textarea"
                    placeholder="Enter your detailed feedback..."
                    rows="6"
                  />
                </div>

                <button className="btn tf-submit-btn w-100">
                  ✈ Submit Feedback
                </button>

              </div>
            </div>

            {/* RIGHT HISTORY */}
            <div className="col-lg-8">

              <div className="tf-card">

                <div className="tf-card-header">
                  <h6 className="mb-0">Feedback History</h6>

                  <select className="form-select tf-filter">
                    <option>All Types</option>
                  </select>
                </div>

                {/* History List */}
                {history.map((item, i) => (
                  <div key={i} className="tf-history-item">

                    <div className="tf-history-top">

                      <div className="tf-history-user">
                        <div className="tf-avatar">{item.initials}</div>

                        <div>
                          <h6>{item.name}</h6>
                          <small>{item.date}</small>
                        </div>
                      </div>

                      <span className={`tf-badge ${badgeClass(item.type)}`}>
                        {item.type}
                      </span>

                    </div>

                    <p className="tf-history-text">{item.text}</p>

                    <small className="tf-history-mentor">
                      👤 By {item.mentor}
                    </small>

                  </div>
                ))}

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MentorFeedbackPage;
