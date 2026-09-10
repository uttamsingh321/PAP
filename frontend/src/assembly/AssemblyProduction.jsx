import React from 'react';

function AssemblyProduction() {
    return (
        <div className="assembly-production">
            <h3>Production Summary</h3>
            <div className="production-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Output</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Achievement</span>
                    <span className="stat-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default AssemblyProduction;
