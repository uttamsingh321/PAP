import React from 'react';

function DashboardTables({ data }) {
    const rows = [
        { line: "Line A", status: "Running", statusType: "success", output: "1,250", efficiency: "96.2%" },
        { line: "Line B", status: "Maintenance", statusType: "warning", output: "980", efficiency: "89.5%" },
        { line: "Line C", status: "Running", statusType: "success", output: "1,180", efficiency: "94.8%" },
    ];

    return (
        <div className="table-container">
            <div className="table-header">
                <h3 className="table-title">Recent Activity</h3>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Line</th>
                        <th>Status</th>
                        <th>Output</th>
                        <th>Efficiency</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.line}</td>
                            <td>
                                <span className={`badge badge-${row.statusType}`}>
                                    <span className="badge-dot"></span>
                                    {row.status}
                                </span>
                            </td>
                            <td>{row.output}</td>
                            <td>{row.efficiency}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardTables;
