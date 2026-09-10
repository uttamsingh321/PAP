import React, { useState } from 'react';
import './settings.css';

function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'users', label: 'User Settings' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'system', label: 'System' },
    ];

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>Settings</h1>
            </div>
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="settings-section">
                        <h2>General Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Platform Name</label>
                                <input type="text" defaultValue="PAP - Production Analytics Platform" />
                            </div>
                            <div className="form-group">
                                <label>Timezone</label>
                                <select defaultValue="UTC">
                                    <option value="UTC">UTC</option>
                                    <option value="IST">IST (India)</option>
                                    <option value="EST">EST (US Eastern)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date Format</label>
                                <select defaultValue="YYYY-MM-DD">
                                    <option>YYYY-MM-DD</option>
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                </select>
                            </div>
                            <button className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="settings-section">
                        <h2>User Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Session Timeout (minutes)</label>
                                <input type="number" defaultValue="30" />
                            </div>
                            <div className="form-group">
                                <label>Max Login Attempts</label>
                                <input type="number" defaultValue="5" />
                            </div>
                            <button className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                )}
                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h2>Notification Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" defaultChecked /> Email Notifications
                                </label>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" defaultChecked /> Alert on Downtime
                                </label>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" /> Daily Summary Report
                                </label>
                            </div>
                            <button className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                )}
                {activeTab === 'system' && (
                    <div className="settings-section">
                        <h2>System Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Data Retention (days)</label>
                                <input type="number" defaultValue="365" />
                            </div>
                            <div className="form-group">
                                <label>API Rate Limit (requests/min)</label>
                                <input type="number" defaultValue="100" />
                            </div>
                            <button className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
