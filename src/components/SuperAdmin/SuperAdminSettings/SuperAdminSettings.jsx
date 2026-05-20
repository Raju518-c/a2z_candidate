import React, { useState } from 'react';
import SuperAdminLayout from '../SuperAdminLayout';
import './SuperAdminPages.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'OceanStar Platform',
    timezone: 'UTC+0',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    twoFactorAuth: false,
    maintenanceMode: false,
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <SuperAdminLayout>
      <div className="announcements-wrapper">
        <div className="announcements-header">
          <div>
            <h2>System Settings</h2>
            <p>Configure system preferences</p>
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>

        <div className="sa-table-card" style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ marginBottom: '20px' }}>General Settings</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Timezone</label>
              <select 
                value={settings.timezone} 
                onChange={(e) => handleChange('timezone', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }}
              >
                <option>UTC+0</option>
                <option>UTC+1</option>
                <option>UTC+5:30</option>
                <option>UTC-5</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date Format</label>
              <select 
                value={settings.dateFormat} 
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #dcdde1', borderRadius: '4px' }}
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '20px' }}>Security Settings</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500' }}>Email Notifications</label>
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500' }}>Two-Factor Authentication</label>
              <input 
                type="checkbox" 
                checked={settings.twoFactorAuth}
                onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <label style={{ fontWeight: '500' }}>Maintenance Mode</label>
              <input 
                type="checkbox" 
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SystemSettings;