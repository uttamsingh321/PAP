import React from 'react';

function Permissions() {
    return (
        <div className="permissions-section">
            <div className="section-header">
                <h2>Permissions</h2>
                <button className="btn-primary">Add Permission</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Permission Name</th>
                        <th>Codename</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="empty-state">No permissions found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Permissions;
