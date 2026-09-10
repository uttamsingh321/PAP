import React from 'react';

function KPI({ title, value, change, trend }) {
    return (
        <div className="kpi-card">
            <div className="kpi-title">{title}</div>
            <div className="kpi-value">{value}</div>
            <div className={`kpi-change ${trend}`}>
                {trend === 'up' ? '↑' : '↓'} {change}
            </div>
        </div>
    );
}

export default KPI;
