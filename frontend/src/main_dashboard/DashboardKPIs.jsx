import React from 'react';

function DashboardKPIs({ data }) {
    const kpis = [
        { label: "Total Production", value: "12,450", change: "+8.2%", positive: true, icon: "📦", color: "blue" },
        { label: "Efficiency Rate", value: "94.2%", change: "+2.1%", positive: true, icon: "⚡", color: "green" },
        { label: "Defect Rate", value: "0.8%", change: "-0.3%", positive: true, icon: "🔍", color: "red" },
        { label: "Downtime", value: "2.4h", change: "+0.5h", positive: false, icon: "⏱️", color: "purple" },
    ];

    return (
        <div className="kpi-grid">
            {kpis.map((kpi, index) => (
                <div key={index} className={`kpi-card ${kpi.color}`}>
                    <div className={`kpi-icon ${kpi.color}`}>{kpi.icon}</div>
                    <div className="kpi-content">
                        <div className="kpi-label">{kpi.label}</div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className={`kpi-change ${kpi.positive ? "positive" : "negative"}`}>
                            {kpi.positive ? "↑" : "↓"} {kpi.change}
                        </div>
                        <div className="kpi-period">vs. last week</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DashboardKPIs;
