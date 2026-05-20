import React from "react";
import MentorSidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./SystemSettings.css";

const SystemSettingsPage = () => {
  return (
    <div className="ss-layout-wrapper">

      <MentorSidebar />

      <div className="ss-main-wrapper">
        <Header />

        <div className="ss-content-area">
          <div className="container-fluid">

            {/* Header */}
            <div className="ss-page-header d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-semibold">System Settings</h4>
                <p className="text-muted mb-0">
                  Configure system-wide preferences and defaults
                </p>
              </div>

              <button className="btn ss-save-btn">
                💾 Save All Changes
              </button>
            </div>

            {/* Row 1 */}
            <div className="row g-3">

              {/* General Settings */}
              <div className="col-lg-6">
                <div className="ss-card">
                  <div className="ss-card-header">
                    <h5>General Settings</h5>
                    <p>Basic system configuration</p>
                  </div>

                  <label>Organization Name</label>
                  <input className="form-control ss-input" defaultValue="Industrial Training Corp" />

                  <label>Default Timezone</label>
                  <input className="form-control ss-input" defaultValue="UTC+0 (London)" />

                  <label>Date Format</label>
                  <input className="form-control ss-input" defaultValue="YYYY-MM-DD" />
                </div>
              </div>

              {/* Notifications */}
              <div className="col-lg-6">
                <div className="ss-card">
                  <div className="ss-card-header">
                    <h5>Notifications</h5>
                    <p>Alert and notification preferences</p>
                  </div>

                  {[
                    "Email Notifications",
                    "Compliance Alerts",
                    "System Health Alerts"
                  ].map((item, i) => (
                    <div key={i} className="ss-toggle-row">
                      <div>
                        <h6>{item}</h6>
                        <small className="text-muted">
                          Notification setting description
                        </small>
                      </div>

                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" defaultChecked />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="col-lg-6">
                <div className="ss-card">
                  <div className="ss-card-header">
                    <h5>Security</h5>
                    <p>Security and access controls</p>
                  </div>

                  <div className="ss-toggle-row">
                    <div>
                      <h6>Two-Factor Authentication</h6>
                      <small className="text-muted">Require 2FA for admins</small>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <div className="ss-toggle-row">
                    <div>
                      <h6>Session Timeout</h6>
                      <small className="text-muted">Auto logout after inactivity</small>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <label>Timeout Duration (minutes)</label>
                  <input className="form-control ss-input" defaultValue="30" />
                </div>
              </div>

              {/* User Management */}
              <div className="col-lg-6">
                <div className="ss-card">
                  <div className="ss-card-header">
                    <h5>User Management</h5>
                    <p>Default user settings</p>
                  </div>

                  <div className="ss-toggle-row">
                    <div>
                      <h6>Auto-approve New Candidates</h6>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </div>

                  <div className="ss-toggle-row">
                    <div>
                      <h6>Require Email Verification</h6>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <label>Default Starting Level</label>
                  <input className="form-control ss-input" defaultValue="0" />
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
