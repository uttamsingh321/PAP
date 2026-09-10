import React from 'react';

function Users() {
    return (
        <div className="users-section">
            <div className="section-header">
                <h2>Users</h2>
                <button className="btn-primary">Add User</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="6" className="empty-state">No users found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Users;
