import React from 'react';

function SMTTrends() {
    return (
        <div className="smt-trends">
            <h3>SMT Trends</h3>
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
                    <span className="trend-label">Placement Accuracy</span>
                    <span className="trend-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default SMTTrends;
