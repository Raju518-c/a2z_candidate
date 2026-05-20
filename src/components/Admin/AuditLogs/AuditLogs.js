import React from "react";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./AuditLogs.css";
import {
  FaFileExport,
  FaSearch,
  FaChevronDown,
  FaFilter
} from "react-icons/fa";

const AuditLogs = () => {
  return (
    <div className="ta-layout-wrapper">
      <Sidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area">
          <div className="audit-wrapper">

            {/* Page Header */}
            <div className="audit-header">
              <div>
                <h2>Audit Logs</h2>
                <p>Track all system activities and user actions</p>
              </div>

              <button className="audit-export-btn">
                <FaFileExport />
                Export Logs
              </button>
            </div>

            {/* Stats - Fixed to show in single row */}
            <div className="audit-stats-row d-flex flex-wrap gap-3 mt-4">
              <AuditStat title="Total Logs (Today)" value="10" />
              <AuditStat title="Logbook Actions" value="3" />
              <AuditStat title="Evidence Actions" value="3" />
              <AuditStat title="Level Changes" value="1" />
              <AuditStat title="User Activities" value="2" />
            </div>

            {/* Filters */}
            <div className="audit-filters-box mt-4">
              <div className="audit-search">
                <FaSearch />
                <input placeholder="Search logs..." />
              </div>

              <div className="audit-filter-actions">
                <button className="audit-category-btn">
                  All Categories <FaChevronDown />
                </button>

                <button className="audit-filter-btn">
                  <FaFilter />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="audit-table-wrapper mt-4">
              <table className="table audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Category</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>2024-01-30 14:32:15</td>
                    <td><span className="audit-pill logbook">logbook</span></td>
                    <td className="audit-action success">Logbook Approved</td>
                    <td>Dr. James Wilson</td>
                    <td>John Smith</td>
                    <td>Approved 40 hours for Manufacturing rotation</td>
                  </tr>

                  <tr>
                    <td>2024-01-30 13:15:42</td>
                    <td><span className="audit-pill evidence">evidence</span></td>
                    <td className="audit-action info">Evidence Uploaded</td>
                    <td>Sarah Johnson</td>
                    <td>Level 2 Competency</td>
                    <td>Certificate of completion uploaded</td>
                  </tr>

                  <tr>
                    <td>2024-01-30 12:00:00</td>
                    <td><span className="audit-pill level">level change</span></td>
                    <td className="audit-action success">Level Promotion</td>
                    <td>System</td>
                    <td>Mike Chen</td>
                    <td>Promoted from Level 1 to Level 2</td>
                  </tr>

                  <tr>
                    <td>2024-01-30 11:45:23</td>
                    <td><span className="audit-pill user">user activity</span></td>
                    <td className="audit-action warning">Login Attempt Failed</td>
                    <td>David Brown</td>
                    <td>System Access</td>
                    <td>Invalid password - 2nd attempt</td>
                  </tr>

                  <tr>
                    <td>2024-01-30 10:22:08</td>
                    <td><span className="audit-pill evidence">evidence</span></td>
                    <td className="audit-action danger">Evidence Rejected</td>
                    <td>Dr. Emily Brown</td>
                    <td>Lisa Wang</td>
                    <td>Document quality insufficient</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const AuditStat = ({ title, value }) => (
  <div className="audit-stat-card">
    <p className="audit-stat-title">{title}</p>
    <h3 className="audit-stat-value">{value}</h3>
  </div>
);

export default AuditLogs;