import React, { useState } from 'react';
import './reports.css';

function Reports() {
    const [selectedReport, setSelectedReport] = useState(null);

    const reportTypes = [
        { id: 'production', name: 'Production Report', description: 'Daily/Weekly production summary' },
        { id: 'efficiency', name: 'Efficiency Report', description: 'OEE and efficiency metrics' },
        { id: 'downtime', name: 'Downtime Report', description: 'Downtime analysis and trends' },
        { id: 'defects', name: 'Defect Report', description: 'Defect analysis and quality metrics' },
        { id: 'custom', name: 'Custom Report', description: 'Build your own report' },
    ];

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h1>Reports</h1>
            </div>
            <div className="reports-grid">
                {reportTypes.map(report => (
                    <div
                        key={report.id}
                        className={`report-card ${selectedReport === report.id ? 'selected' : ''}`}
                        onClick={() => setSelectedReport(report.id)}
                    >
                        <h3>{report.name}</h3>
                        <p>{report.description}</p>
                    </div>
                ))}
            </div>
            {selectedReport && (
                <div className="report-config">
                    <h3>Configure Report</h3>
                    <div className="config-form">
                        <div className="form-group">
                            <label>Date Range</label>
                            <input type="date" />
                            <input type="date" />
                        </div>
                        <div className="form-group">
                            <label>Format</label>
                            <select>
                                <option>PDF</option>
                                <option>Excel</option>
                                <option>CSV</option>
                            </select>
                        </div>
                        <button className="btn-primary">Generate Report</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
