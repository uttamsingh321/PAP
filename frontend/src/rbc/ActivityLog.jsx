import React from 'react';

function ActivityLog() {
    return (
        <div className="activity-log-section">
            <div className="section-header">
                <h2>Activity Log</h2>
                <button className="btn-secondary">Export Log</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="empty-state">No activity logs found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ActivityLog;
