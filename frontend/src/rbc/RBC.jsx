import React, { useState } from 'react';
import SuperUsers from './SuperUsers';
import Users from './Users';
import Roles from './Roles';
import Permissions from './Permissions';
import Commands from './Commands';
import ActivityLog from './ActivityLog';
import './rbc.css';

function RBC() {
    const [activeTab, setActiveTab] = useState('users');

    const tabs = [
        { id: 'users', label: 'Users', component: Users },
        { id: 'super-users', label: 'Super Users', component: SuperUsers },
        { id: 'roles', label: 'Roles', component: Roles },
        { id: 'permissions', label: 'Permissions', component: Permissions },
        { id: 'commands', label: 'Commands', component: Commands },
        { id: 'activity-log', label: 'Activity Log', component: ActivityLog },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || Users;

    return (
        <div className="rbc-container">
            <div className="rbc-header">
                <h1>Role-Based Command</h1>
            </div>
            <div className="rbc-tabs">
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
            <div className="rbc-content">
                <ActiveComponent />
            </div>
        </div>
    );
}

export default RBC;
