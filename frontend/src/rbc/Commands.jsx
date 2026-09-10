import React from 'react';

function Commands() {
    return (
        <div className="commands-section">
            <div className="section-header">
                <h2>Commands</h2>
                <button className="btn-primary">Add Command</button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Command Name</th>
                        <th>Codename</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="5" className="empty-state">No commands found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Commands;
