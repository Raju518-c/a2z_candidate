import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./EmailSettings.css";
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaServer, 
  FaClock,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaSync,
  FaShieldAlt,
  FaBell,
  FaGlobe,
  FaDatabase,
  FaPaperPlane
} from "react-icons/fa";
import Swal from 'sweetalert2';
import { BASE_URL } from "../../../ApiUrl";

const EmailSettings = () => {
  const [emailSettings, setEmailSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeTab, setActiveTab] = useState("general"); // Changed default to general
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    // General Settings
    default_from_email: "noreply@a2z.com",
    default_from_name: "A2Z Certification Platform",
    email_signature: "",
    
    // Notification Settings
    email_notifications: true,
    compliance_alerts: true,
    system_health_alerts: true,
    certificate_expiry_alerts: true,
    new_certification_alerts: true,
    approval_notifications: true,
    
    // Security Settings
    two_factor_auth: true,
    session_timeout: true,
    timeout_duration: 30,
    require_email_verification: true,
    encrypt_attachments: true,
    
    // Email Limits
    max_emails_per_hour: 100,
    max_emails_per_day: 1000,
    max_attachment_size: 10,
    allowed_attachment_types: ".pdf,.doc,.docx,.jpg,.png"
  });
  
  const navigate = useNavigate();

  // Fetch email settings data
  useEffect(() => {
    fetchEmailSettings();
    fetchSystemSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/host-mails/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Email Settings API Response:', result);
      
      if (result.status && result.data) {
        setEmailSettings(result.data);
        console.log('Email settings set:', result.data);
      } else {
        setEmailSettings([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching email settings:', err);
      setError(err.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Email Settings',
        text: err.message || 'An error occurred while fetching email settings',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      // Fetch system settings from API
      const response = await fetch(`${BASE_URL}/api/admin/system-settings/`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.status && result.data) {
          setSystemSettings(prev => ({ ...prev, ...result.data }));
        }
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
      // Use default settings if API fails
    }
  };

  const handleAddEmailSetting = () => {
    navigate('/add-email-settings');
  };

  const handleEdit = (hostId) => {
    navigate(`/add-email-settings/${hostId}`);
  };

  const handleDelete = async (hostId, hostName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/host-mails/${hostId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmailSettings();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${hostName} has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error deleting email setting:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete email setting. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const handleToggleStatus = async (setting) => {
    try {
      const newStatus = setting.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`${BASE_URL}/api/admin/host-mails/${setting.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchEmailSettings();
      
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `${setting.host_name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error('Error toggling status:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update status. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const confirmDelete = (setting) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${setting.host_name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(setting.id, setting.host_name);
      }
    });
  };

  const handleSystemSettingChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleSetting = (field) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveAllSettings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/system-settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(systemSettings)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: 'All email settings have been saved successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save settings. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    }
  };

  const handleTestConnection = (setting) => {
    Swal.fire({
      icon: 'info',
      title: 'Testing Connection',
      text: `Testing SMTP connection to ${setting.host_name}...`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'maintenance': return 'maintenance';
      case 'suspended': return 'suspended';
      default: return 'inactive';
    }
  };

  // Get status display text
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      case 'suspended': return 'Suspended';
      default: return status || 'Unknown';
    }
  };

  // Filter email settings based on search
  const filteredSettings = emailSettings.filter(setting => {
    const matchesSearch = searchTerm === "" || 
      (setting.host_name && setting.host_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (setting.host_email && setting.host_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (setting.smtp_server && setting.smtp_server.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "All Status" || setting.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="email-settings-wrapper">
            {/* Page Header */}
            <div className="email-settings-page-header">
              <div>
                <h2>Settings</h2>
                <p>Configure email system preferences and SMTP hosts</p>
              </div>
              {/* <button className="btn btn-primary save-all-btn" onClick={handleSaveAllSettings}>
                <FaSave className="me-2" /> Save All Changes
              </button> */}
            </div>

            {/* Tabs Navigation - SMTP Hosts moved to last position */}
            <div className="email-settings-tabs">
              <button 
                className={`email-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <FaCog className="me-2" /> General
              </button>
              <button 
                className={`email-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="me-2" /> Notifications
              </button>
              <button 
                className={`email-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaShieldAlt className="me-2" /> Security
              </button>
              <button 
                className={`email-tab ${activeTab === 'smtp' ? 'active' : ''}`}
                onClick={() => setActiveTab('smtp')}
              >
                <FaServer className="me-2" /> SMTP Hosts
              </button>
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="email-settings-tab-content">
                <div className="settings-cards-grid">
                  <div className="settings-card">
                    <div className="settings-card-header">
                      <h5><FaGlobe className="me-2" /> General Email Settings</h5>
                      <p>Basic email configuration</p>
                    </div>
                    
                    <div className="settings-card-body">
                      <div className="form-group">
                        <label>Default From Email</label>
                        <input 
                          type="email" 
                          className="form-control"
                          value={systemSettings.default_from_email}
                          onChange={(e) => handleSystemSettingChange('default_from_email', e.target.value)}
                          placeholder="noreply@company.com"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Default From Name</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={systemSettings.default_from_name}
                          onChange={(e) => handleSystemSettingChange('default_from_name', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Email Signature</label>
                        <textarea 
                          className="form-control"
                          rows="4"
                          value={systemSettings.email_signature}
                          onChange={(e) => handleSystemSettingChange('email_signature', e.target.value)}
                          placeholder="Enter default email signature..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-card">
                    <div className="settings-card-header">
                      <h5><FaDatabase className="me-2" /> Email Limits</h5>
                      <p>Configure sending limits</p>
                    </div>
                    
                    <div className="settings-card-body">
                      <div className="form-group">
                        <label>Max Emails Per Hour</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={systemSettings.max_emails_per_hour}
                          onChange={(e) => handleSystemSettingChange('max_emails_per_hour', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Max Emails Per Day</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={systemSettings.max_emails_per_day}
                          onChange={(e) => handleSystemSettingChange('max_emails_per_day', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Max Attachment Size (MB)</label>
                        <input 
                          type="number" 
                          className="form-control"
                          value={systemSettings.max_attachment_size}
                          onChange={(e) => handleSystemSettingChange('max_attachment_size', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Allowed Attachment Types</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={systemSettings.allowed_attachment_types}
                          onChange={(e) => handleSystemSettingChange('allowed_attachment_types', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="email-settings-tab-content">
                <div className="settings-card">
                  <div className="settings-card-header">
                    <h5><FaBell className="me-2" /> Notification Settings</h5>
                    <p>Configure email notification preferences</p>
                  </div>
                  
                  <div className="settings-card-body">
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>Email Notifications</h6>
                        <small>Enable/disable all email notifications</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.email_notifications ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('email_notifications')}
                      >
                        {systemSettings.email_notifications ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                    
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>Compliance Alerts</h6>
                        <small>Notifications about compliance issues</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.compliance_alerts ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('compliance_alerts')}
                      >
                        {systemSettings.compliance_alerts ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                    
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>System Health Alerts</h6>
                        <small>System status and health notifications</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.system_health_alerts ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('system_health_alerts')}
                      >
                        {systemSettings.system_health_alerts ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                    
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>Certificate Expiry Alerts</h6>
                        <small>Notifications for expiring certificates</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.certificate_expiry_alerts ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('certificate_expiry_alerts')}
                      >
                        {systemSettings.certificate_expiry_alerts ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                    
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>New Certification Alerts</h6>
                        <small>Notifications for new certifications</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.new_certification_alerts ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('new_certification_alerts')}
                      >
                        {systemSettings.new_certification_alerts ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                    
                    <div className="toggle-setting-item">
                      <div className="toggle-info">
                        <h6>Approval Notifications</h6>
                        <small>Notifications for approval requests</small>
                      </div>
                      <button 
                        className={`toggle-btn ${systemSettings.approval_notifications ? 'active' : ''}`}
                        onClick={() => handleToggleSetting('approval_notifications')}
                      >
                        {systemSettings.approval_notifications ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="email-settings-tab-content">
                <div className="settings-cards-grid">
                  <div className="settings-card">
                    <div className="settings-card-header">
                      <h5><FaShieldAlt className="me-2" /> Security Settings</h5>
                      <p>Email security configuration</p>
                    </div>
                    
                    <div className="settings-card-body">
                      <div className="toggle-setting-item">
                        <div className="toggle-info">
                          <h6>Two-Factor Authentication</h6>
                          <small>Require 2FA for admin accounts</small>
                        </div>
                        <button 
                          className={`toggle-btn ${systemSettings.two_factor_auth ? 'active' : ''}`}
                          onClick={() => handleToggleSetting('two_factor_auth')}
                        >
                          {systemSettings.two_factor_auth ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                      
                      <div className="toggle-setting-item">
                        <div className="toggle-info">
                          <h6>Session Timeout</h6>
                          <small>Auto logout after inactivity</small>
                        </div>
                        <button 
                          className={`toggle-btn ${systemSettings.session_timeout ? 'active' : ''}`}
                          onClick={() => handleToggleSetting('session_timeout')}
                        >
                          {systemSettings.session_timeout ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                      
                      {systemSettings.session_timeout && (
                        <div className="form-group mt-3">
                          <label>Timeout Duration (minutes)</label>
                          <input 
                            type="number" 
                            className="form-control"
                            value={systemSettings.timeout_duration}
                            onChange={(e) => handleSystemSettingChange('timeout_duration', e.target.value)}
                          />
                        </div>
                      )}
                      
                      <div className="toggle-setting-item">
                        <div className="toggle-info">
                          <h6>Require Email Verification</h6>
                          <small>Verify email addresses before sending</small>
                        </div>
                        <button 
                          className={`toggle-btn ${systemSettings.require_email_verification ? 'active' : ''}`}
                          onClick={() => handleToggleSetting('require_email_verification')}
                        >
                          {systemSettings.require_email_verification ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                      
                      <div className="toggle-setting-item">
                        <div className="toggle-info">
                          <h6>Encrypt Attachments</h6>
                          <small>Encrypt email attachments</small>
                        </div>
                        <button 
                          className={`toggle-btn ${systemSettings.encrypt_attachments ? 'active' : ''}`}
                          onClick={() => handleToggleSetting('encrypt_attachments')}
                        >
                          {systemSettings.encrypt_attachments ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SMTP Hosts Tab */}
            {activeTab === 'smtp' && (
              <div className="email-settings-tab-content">
                {/* Filters Bar */}
                <div className="email-settings-filters-bar">
                  <div className="email-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search SMTP hosts..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-actions">
                    <select 
                      className="status-filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All Status">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    
                    <button className="btn btn-outline-secondary" onClick={fetchEmailSettings}>
                      <FaSync />
                    </button>
                    
                    <button className="btn btn-primary" onClick={handleAddEmailSetting}>
                      <FaPlus className="me-2" /> Add SMTP Host
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="email-settings-loading">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading SMTP hosts...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="email-settings-error">
                    <p>Error: {error}</p>
                    <button onClick={fetchEmailSettings} className="btn btn-primary mt-2">
                      Retry
                    </button>
                  </div>
                )}

                {/* SMTP Host Cards */}
                {!loading && !error && (
                  <div className="smtp-hosts-grid">
                    {filteredSettings.length > 0 ? (
                      filteredSettings.map((setting) => (
                        <SMTPHostCard
                          key={setting.id}
                          setting={setting}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                          onToggleStatus={handleToggleStatus}
                          onTestConnection={handleTestConnection}
                          getStatusBadgeClass={getStatusBadgeClass}
                          getStatusDisplay={getStatusDisplay}
                        />
                      ))
                    ) : (
                      <div className="empty-state-card">
                        <FaServer className="empty-icon" />
                        <h5>No SMTP Hosts Found</h5>
                        <p>Add your first SMTP host to start sending emails</p>
                        <button className="btn btn-primary" onClick={handleAddEmailSetting}>
                          <FaPlus className="me-2" /> Add SMTP Host
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Add SMTP Form Component ---- */
// const AddSMTPForm = ({ onSuccess, onCancel }) => {
//   const [formData, setFormData] = useState({
//     host_name: '',
//     host_email: '',
//     smtp_server: '',
//     smtp_port: 587,
//     username: '',
//     password: '',
//     use_tls: true,
//     use_ssl: false,
//     daily_limit: 1000,
//     hourly_limit: 100,
//     status: 'active'
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${BASE_URL}/api/admin/host-mails/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'SMTP Host Added!',
//         text: 'New SMTP host has been configured successfully.',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       onSuccess();
//     } catch (err) {
//       console.error('Error adding SMTP host:', err);
      
//       Swal.fire({
//         icon: 'error',
//         title: 'Add Failed',
//         text: 'Failed to add SMTP host. Please try again.',
//         timer: 3000,
//         showConfirmButton: true
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="add-smtp-form">
//       <div className="form-row">
//         <div className="form-group">
//           <label>Host Name *</label>
//           <input
//             type="text"
//             className="form-control"
//             name="host_name"
//             value={formData.host_name}
//             onChange={handleChange}
//             placeholder="e.g., Primary SMTP Server"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label>Host Email *</label>
//           <input
//             type="email"
//             className="form-control"
//             name="host_email"
//             value={formData.host_email}
//             onChange={handleChange}
//             placeholder="smtp@company.com"
//             required
//           />
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>SMTP Server *</label>
//           <input
//             type="text"
//             className="form-control"
//             name="smtp_server"
//             value={formData.smtp_server}
//             onChange={handleChange}
//             placeholder="smtp.gmail.com"
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label>SMTP Port *</label>
//           <input
//             type="number"
//             className="form-control"
//             name="smtp_port"
//             value={formData.smtp_port}
//             onChange={handleChange}
//             placeholder="587"
//             required
//           />
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>Username</label>
//           <input
//             type="text"
//             className="form-control"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             placeholder="SMTP username"
//           />
//         </div>
        
//         <div className="form-group">
//           <label>Password</label>
//           <div className="password-input-wrapper">
//             <input
//               type={showPassword ? "text" : "password"}
//               className="form-control"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="SMTP password"
//             />
//             <button
//               type="button"
//               className="password-toggle-btn"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>Daily Limit</label>
//           <input
//             type="number"
//             className="form-control"
//             name="daily_limit"
//             value={formData.daily_limit}
//             onChange={handleChange}
//             placeholder="1000"
//           />
//         </div>
        
//         <div className="form-group">
//           <label>Hourly Limit</label>
//           <input
//             type="number"
//             className="form-control"
//             name="hourly_limit"
//             value={formData.hourly_limit}
//             onChange={handleChange}
//             placeholder="100"
//           />
//         </div>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>Status</label>
//           <select
//             className="form-control"
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//           >
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//             <option value="maintenance">Maintenance</option>
//           </select>
//         </div>
//       </div>

//       <div className="form-checkboxes">
//         <label className="checkbox-label">
//           <input
//             type="checkbox"
//             name="use_tls"
//             checked={formData.use_tls}
//             onChange={handleChange}
//           />
//           <span>Use TLS</span>
//         </label>
        
//         <label className="checkbox-label">
//           <input
//             type="checkbox"
//             name="use_ssl"
//             checked={formData.use_ssl}
//             onChange={handleChange}
//           />
//           <span>Use SSL</span>
//         </label>
//       </div>

//       <div className="form-actions">
//         <button type="button" className="btn btn-secondary" onClick={onCancel}>
//           Cancel
//         </button>
//         <button type="submit" className="btn btn-primary" disabled={loading}>
//           {loading ? (
//             <>
//               <FaSync className="fa-spin me-2" /> Adding...
//             </>
//           ) : (
//             <>
//               <FaPlus className="me-2" /> Add SMTP Host
//             </>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// };

/* ---- SMTP Host Card Component ---- */
const SMTPHostCard = ({ 
  setting, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onTestConnection,
  getStatusBadgeClass, 
  getStatusDisplay 
}) => {
  const isDailyLimitExceeded = () => {
    return setting.current_daily_count >= setting.daily_limit;
  };

  const isHourlyLimitExceeded = () => {
    return setting.current_hourly_count >= setting.hourly_limit;
  };

  return (
    <div className="smtp-host-card">
      <div className="card-header">
        <div className="host-info">
          <FaServer className="host-icon" />
          <div>
            <h5>{setting.host_name || 'N/A'}</h5>
            <span className="host-email">{setting.host_email || 'N/A'}</span>
          </div>
        </div>
        <div className="card-header-actions">
          <span className={`status-badge ${getStatusBadgeClass(setting.status)}`}>
            {getStatusDisplay(setting.status)}
          </span>
          <button 
            className="icon-action-btn edit-icon-btn"
            onClick={() => onEdit(setting.id)}
            title="Edit Host"
          >
            <FaEdit />
          </button>
          <button 
            className="icon-action-btn delete-icon-btn"
            onClick={() => onDelete(setting)}
            title="Delete Host"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className="card-body">
        <div className="info-row">
          <span className="label">SMTP Server:</span>
          <span className="value"><code>{setting.smtp_server || 'N/A'}</code></span>
        </div>
        <div className="info-row">
          <span className="label">Port:</span>
          <span className="value">{setting.smtp_port || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="label">Daily Usage:</span>
          <span className="value">
            {setting.current_daily_count || 0} / {setting.daily_limit || '∞'}
            {isDailyLimitExceeded() && (
              <span className="limit-warning" title="Daily limit exceeded">⚠</span>
            )}
          </span>
        </div>
        <div className="info-row">
          <span className="label">Hourly Usage:</span>
          <span className="value">
            {setting.current_hourly_count || 0} / {setting.hourly_limit || '∞'}
            {isHourlyLimitExceeded() && (
              <span className="limit-warning" title="Hourly limit exceeded">⚠</span>
            )}
          </span>
        </div>
      </div>
      
      {/* <div className="card-footer">
        <button 
          className="card-action-btn test-btn"
          onClick={() => onTestConnection(setting)}
        >
          <FaPaperPlane /> Test
        </button>
        <button 
          className="card-action-btn toggle-btn"
          onClick={() => onToggleStatus(setting)}
        >
          {setting.status === 'active' ? <FaTimesCircle /> : <FaCheckCircle />}
          {setting.status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </div> */}
    </div>
  );
};

export default EmailSettings;