import React from "react";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./RotationProgram.css";
import { FaPlus, FaCalendarAlt, FaEllipsisH } from "react-icons/fa";

const RotationProgram = () => {
  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="rp-wrapper">

            {/* Header */}
            <div className="rp-header">
              <div>
                <h2>Rotation Program</h2>
                <p>Manage department rotation schedules and track completion</p>
              </div>

              <button className="btn btn-primary rp-add-btn">
                <FaPlus /> New Rotation
              </button>
            </div>

            {/* Stats */}
            <div className="row g-4 mb-4">
              <StatCard title="Active Rotations" value="3" />
              <StatCard title="Completed This Month" value="1" />
              <StatCard title="Upcoming" value="1" />
              <StatCard title="Avg Completion Rate" value="34%" />
            </div>

            {/* Table */}
            <div className="rp-table-card">
              <table className="table rp-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Current Department</th>
                    <th>Rotation Path</th>
                    <th>Progress</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <RotationRow
                    name="John Smith"
                    dept="QA/QC"
                    progress={45}
                    start="2024-01-15"
                    end="2024-06-30"
                    status="active"
                    path={["Manufacturing", "Coating", "QA/QC", "Testing", "Marine"]}
                  />

                  <RotationRow
                    name="Sarah Johnson"
                    dept="Manufacturing"
                    progress={15}
                    start="2024-02-01"
                    end="2024-05-31"
                    status="active"
                    path={["Manufacturing", "QA/QC", "Testing", "Dispatch"]}
                  />

                  <RotationRow
                    name="Mike Chen"
                    dept="Coating"
                    progress={8}
                    start="2024-02-15"
                    end="2024-04-30"
                    status="active"
                    path={["Coating", "Manufacturing", "Testing"]}
                  />

                  <RotationRow
                    name="Emily Davis"
                    dept="Marine Assets"
                    progress={100}
                    start="2023-06-01"
                    end="2024-01-31"
                    status="completed"
                    path={["Manufacturing", "Coating", "QA/QC", "Testing", "Dispatch", "Marine"]}
                  />

                  <RotationRow
                    name="David Brown"
                    dept="-"
                    progress={0}
                    start="2024-03-01"
                    end="2024-06-30"
                    status="upcoming"
                    path={["Manufacturing", "Coating", "QA/QC"]}
                  />
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Components ---------- */

const StatCard = ({ title, value }) => (
  <div className="col-lg-3 col-md-6">
    <div className="rp-stat-card">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const RotationRow = ({ name, dept, path, progress, start, end, status }) => (
  <tr>
    <td className="rp-name">{name}</td>
    <td>{dept}</td>

    <td>
      <div className="rp-path">
        {path.map((p, i) => (
          <span key={i} className="rp-pill">{p}</span>
        ))}
      </div>
    </td>

    <td>
      <div className="rp-progress">
        <div className="rp-progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}%</span>
      </div>
    </td>

    <td>
      <FaCalendarAlt /> {start}
    </td>

    <td>
      <FaCalendarAlt /> {end}
    </td>

    <td>
      <span className={`rp-status ${status}`}>{status}</span>
    </td>

    <td>
      <FaEllipsisH className="rp-action" />
    </td>
  </tr>
);

export default RotationProgram;
