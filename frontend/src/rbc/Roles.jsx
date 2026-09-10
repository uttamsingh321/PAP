import React from 'react';

function Roles() {
    return (
        <div className="roles-section">
            <div className="section-header">
                <h2>Roles</h2>
                <button className="btn-primary">Add Role</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Users</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="empty-state">No roles found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Roles;
