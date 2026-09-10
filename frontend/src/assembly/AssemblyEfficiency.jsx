import React from 'react';

function AssemblyEfficiency() {
    return (
        <div className="assembly-efficiency">
            <h3>Efficiency Metrics</h3>
            <div className="efficiency-grid">
                <div className="efficiency-item">
                    <span className="metric-label">OEE</span>
                    <span className="metric-value">--</span>
                </div>
                <div className="efficiency-item">
                    <span className="metric-label">Availability</span>
                    <span className="metric-value">--</span>
                </div>
                <div className="efficiency-item">
                    <span className="metric-label">Performance</span>
                    <span className="metric-value">--</span>
                </div>
                <div className="efficiency-item">
                    <span className="metric-label">Quality</span>
                    <span className="metric-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default AssemblyEfficiency;
