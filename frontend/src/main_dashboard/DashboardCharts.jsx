import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const productionData = [
    { day: "Sep 1", output: 1800, efficiency: 92 },
    { day: "Sep 2", output: 1950, efficiency: 94 },
    { day: "Sep 3", output: 1700, efficiency: 89 },
    { day: "Sep 4", output: 2100, efficiency: 96 },
    { day: "Sep 5", output: 2050, efficiency: 95 },
    { day: "Sep 6", output: 1850, efficiency: 91 },
    { day: "Sep 7", output: 2000, efficiency: 93 },
];

const efficiencyData = [
    { day: "Sep 1", overall: 92, quality: 95, uptime: 98 },
    { day: "Sep 2", overall: 94, quality: 96, uptime: 97 },
    { day: "Sep 3", overall: 89, quality: 92, uptime: 95 },
    { day: "Sep 4", overall: 96, quality: 98, uptime: 99 },
    { day: "Sep 5", overall: 95, quality: 97, uptime: 98 },
    { day: "Sep 6", overall: 91, quality: 94, uptime: 96 },
    { day: "Sep 7", overall: 93, quality: 95, uptime: 97 },
];

function DashboardCharts({ data }) {
    const [timeFilter, setTimeFilter] = useState("7D");

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <div className="chart-header">
                    <h3 className="chart-title">📈 Production Overview</h3>
                    <div className="chart-filters">
                        {["7D", "30D", "90D"].map(f => (
                            <button
                                key={f}
                                className={`chart-filter-btn ${timeFilter === f ? "active" : ""}`}
                                onClick={() => setTimeFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={productionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                            contentStyle={{ background: "#151c30", border: "1px solid #1e2a45", borderRadius: "8px" }}
                            labelStyle={{ color: "#fff" }}
                        />
                        <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                    <div className="chart-legend-item">
                        <div className="chart-legend-dot" style={{ background: "#3b82f6" }}></div>
                        Production Output
                    </div>
                    <div className="chart-legend-item">
                        <div className="chart-legend-dot" style={{ background: "#10b981" }}></div>
                        Efficiency Rate
                    </div>
                </div>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3 className="chart-title">📊 Efficiency Trends</h3>
                    <div className="chart-filters">
                        {["7D", "30D", "90D"].map(f => (
                            <button key={f} className="chart-filter-btn">{f}</button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={efficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                            contentStyle={{ background: "#151c30", border: "1px solid #1e2a45", borderRadius: "8px" }}
                            labelStyle={{ color: "#fff" }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} name="Overall Efficiency" dot={false} />
                        <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} name="Quality" dot={false} />
                        <Line type="monotone" dataKey="uptime" stroke="#8b5cf6" strokeWidth={2} name="Uptime" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default DashboardCharts;
