import React from 'react';
import Chart from '../components/Chart';

function AssemblyCharts() {
    return (
        <div className="assembly-charts">
            <div className="chart-card">
                <h3>Production by Line</h3>
                <Chart type="bar" />
            </div>
            <div className="chart-card">
                <h3>Efficiency Trend</h3>
                <Chart type="line" />
            </div>
            <div className="chart-card">
                <h3>Downtime Analysis</h3>
                <Chart type="pie" />
            </div>
        </div>
    );
}

export default AssemblyCharts;
