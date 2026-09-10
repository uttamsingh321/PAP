import React from 'react';

function DashboardTrends({ data }) {
    const trends = [
        { label: "Weekly Output", value: "+12.5%", positive: true, icon: "📦" },
        { label: "Quality Score", value: "+3.2%", positive: true, icon: "✅" },
        { label: "Machine Uptime", value: "-1.8%", positive: false, icon: "⚙️" },
        { label: "Labor Efficiency", value: "+5.4%", positive: true, icon: "👷" },
    ];

    return (
        <div className="trends-card">
            <div className="trends-header">
                <h3 className="trends-title">Trends</h3>
            </div>
            <div className="trends-list">
                {trends.map((trend, index) => (
                    <div key={index} className="trend-item">
                        <div className="trend-icon">{trend.icon}</div>
                        <div className="trend-info">
                            <div className="trend-label">{trend.label}</div>
                            <div className={`trend-change ${trend.positive ? "positive" : "negative"}`}>
                                {trend.positive ? "↑" : "↓"} {trend.value}
                            </div>
                            <div className="trend-period">vs. last week</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardTrends;
