import React from "react";
import MentorSidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Reports.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

const MentorReportsAnalyticsPage = () => {

  // ================= Chart Data =================
  const monthlyData = [
    { month: "Aug", promotions: 12, newCandidates: 18 },
    { month: "Sep", promotions: 15, newCandidates: 22 },
    { month: "Oct", promotions: 8, newCandidates: 14 },
    { month: "Nov", promotions: 18, newCandidates: 25 },
    { month: "Dec", promotions: 22, newCandidates: 20 },
    { month: "Jan", promotions: 14, newCandidates: 28 }
  ];

  const complianceData = [
    { month: "Aug", compliance: 92, alerts: 8 },
    { month: "Sep", compliance: 95, alerts: 6 },
    { month: "Oct", compliance: 90, alerts: 11 },
    { month: "Nov", compliance: 92, alerts: 9 },
    { month: "Dec", compliance: 96, alerts: 5 },
    { month: "Jan", compliance: 94, alerts: 7 }
  ];

  return (
    <div className="ra-layout-wrapper">

      <MentorSidebar />

      <div className="ra-main-wrapper">

        <Header />

        <div className="ra-content-area">
          <div className="ra-dashboard container-fluid">

            {/* ================= Header ================= */}
            <div className="ra-page-header d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-semibold">Reports & Analytics</h3>
                <p className="text-muted mb-0">
                  Training program insights and performance metrics
                </p>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-light border">
                  📅 Last 6 Months
                </button>
                <button className="btn btn-light border">
                  ⬇ Export
                </button>
              </div>
            </div>

            {/* ================= Stat Cards ================= */}
            <div className="row g-3 mb-4">

              {[
                { title: "Total Candidates", value: "262", icon: "👥" },
                { title: "Promotions (6mo)", value: "89", icon: "📈" },
                { title: "Avg Exposure Hours", value: "342h", icon: "⏱" },
                { title: "Dept Completion Rate", value: "80%", icon: "📄" }
              ].map((card, i) => (
                <div className="col-md-3" key={i}>
                  <div className="ra-stat-card">
                    <div>
                      <p className="ra-stat-title">{card.title}</p>
                      <h3>{card.value}</h3>
                    </div>
                    <div className="ra-stat-icon">{card.icon}</div>
                  </div>
                </div>
              ))}

            </div>

            {/* ================= Row 1 ================= */}
            <div className="row g-3 mb-4">

              {/* Donut */}
              <div className="col-lg-6">
                <div className="ra-card">
                  <h5>Candidate Distribution by Level</h5>
                  <p className="text-muted">
                    Current level breakdown across all candidates
                  </p>

                  <div className="ra-donut-chart">
                    <div className="ra-donut"></div>
                  </div>

                  <div className="ra-donut-legend">
                    <span>Level 1 : 82</span>
                    <span>Level 2 : 64</span>
                    <span>Level 3 : 38</span>
                    <span>Level 4 : 21</span>
                    <span>Level 5 : 12</span>
                    <span>Level 0 : 45</span>
                  </div>

                </div>
              </div>

              {/* Horizontal Bars */}
              <div className="col-lg-6">
                <div className="ra-card">
                  <h5>Department Completion Rates</h5>
                  <p className="text-muted">
                    Average rotation completion by department
                  </p>

                  <div className="ra-horizontal-bars">

                    {[
                      { label: "Manufacturing", value: 78 },
                      { label: "Coating", value: 85 },
                      { label: "QA/QC", value: 72 },
                      { label: "Testing", value: 89 },
                      { label: "Dispatch", value: 93 },
                      { label: "Marine", value: 65 }
                    ].map((dept, i) => (
                      <div key={i} className="ra-hbar-item">
                        <span>{dept.label}</span>
                        <div className="ra-hbar-bg">
                          <div
                            className="ra-hbar-fill"
                            style={{ width: `${dept.value}%` }}
                          />
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>

            {/* ================= Row 2 ================= */}
            <div className="row g-3">

              {/* Line Chart */}
              <div className="col-lg-6">
                <div className="ra-card">
                  <h5>Monthly Progress</h5>
                  <p className="text-muted">
                    Promotions vs new candidate registrations
                  </p>

                  <div className="ra-chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="promotions"
                          stroke="#16a34a"
                          strokeWidth={2}
                        />

                        <Line
                          type="monotone"
                          dataKey="newCandidates"
                          stroke="#2563eb"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>

              {/* Bar Chart */}
              <div className="col-lg-6">
                <div className="ra-card">
                  <h5>Compliance Trend</h5>
                  <p className="text-muted">
                    Compliance rate vs active alerts over time
                  </p>

                  <div className="ra-chart-container">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={complianceData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        <Bar dataKey="compliance" fill="#16a34a" />
                        <Bar dataKey="alerts" fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
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

export default MentorReportsAnalyticsPage;
