import React from 'react';

function SMTProduction() {
    return (
        <div className="smt-production">
            <h3>Production Summary</h3>
            <div className="production-stats">
                <div className="stat-item">
                    <span className="stat-label">Total PCBs</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Components Placed</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Throughput</span>
                    <span className="stat-value">--</span>
                </div>
            </div>
        </div>
    );
}

export default SMTProduction;
