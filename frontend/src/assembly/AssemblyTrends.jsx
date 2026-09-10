import React from 'react';

function AssemblyTrends() {
    return (
        <div className="assembly-trends">
            <h3>Assembly Trends</h3>
            <div className="trends-grid">
                <div className="trend-item">
                    <span className="trend-label">Daily Output</span>
                    <span className="trend-value">--</span>
                </div>
                <div className="trend-item">
                    <span className="trend-label">Weekly OEE</span>
                    <span className="trend-value">--</span>
                </div>
                <div className="trend-item">
                    <span className="trend-label">Defect Rate</span>
                    <span className="trend-value">--</span>
                </div>
                <div className="trend-item">
                    <span className="trend-label">Downtime</span>
                    <span className="trend-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default AssemblyTrends;
