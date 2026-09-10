import React from 'react';

function SuperUsers() {
    return (
        <div className="super-users">
            <div className="section-header">
                <h2>Super Users</h2>
                <button className="btn-primary">Add Super User</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="empty-state">No super users found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SuperUsers;
