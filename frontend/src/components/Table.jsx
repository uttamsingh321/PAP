import React from 'react';

function Table({ columns = [], data = [] }) {
    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.length > 0 ? (
                            columns.map((col, i) => <th key={i}>{col}</th>)
                        ) : (
                            <th>No columns defined</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, i) => (
                            <tr key={i}>
                                {Object.values(row).map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length || 1} className="empty-state">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
