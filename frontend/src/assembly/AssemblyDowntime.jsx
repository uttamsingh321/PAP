import React from 'react';

function AssemblyDowntime() {
    return (
        <div className="assembly-downtime">
            <h3>Downtime Analysis</h3>
            <div className="downtime-summary">
                <div className="downtime-stat">
                    <span className="stat-label">Total Downtime</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="downtime-stat">
                    <span className="stat-label">Top Reason</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="downtime-stat">
                    <span className="stat-label">MTTR</span>
                    <span className="stat-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default AssemblyDowntime;
