import React from 'react';

function AssemblyDefects() {
    return (
        <div className="assembly-defects">
            <h3>Defect Analysis</h3>
            <div className="defect-summary">
                <div className="defect-stat">
                    <span className="stat-label">Total Defects</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="defect-stat">
                    <span className="stat-label">Defect Rate</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="defect-stat">
                    <span className="stat-label">Top Defect</span>
                    <span className="stat-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default AssemblyDefects;
