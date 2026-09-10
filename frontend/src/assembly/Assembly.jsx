import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AssemblyCharts from './AssemblyCharts';
import AssemblyProduction from './AssemblyProduction';
import AssemblyEfficiency from './AssemblyEfficiency';
import AssemblyDowntime from './AssemblyDowntime';
import AssemblyDefects from './AssemblyDefects';
import AssemblyMachines from './AssemblyMachines';
import AssemblyLines from './AssemblyLines';
import AssemblyTrends from './AssemblyTrends';
import AssemblyFPY from './AssemblyFPY';
import DateFilter from '../components/DateFilter';
import './assembly.css';

function Assembly() {
    const [assemblyData, setAssemblyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    useEffect(() => {
        fetchAssemblyData();
    }, [dateRange]);

    const fetchAssemblyData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/assembly/");
            const data = await response.json();
            setAssemblyData(data);
        } catch (error) {
            console.error("Error fetching assembly data:", error);
        }
        setLoading(false);
    };

    return (
        <div className="assembly-container">
            <div className="assembly-header">
                <h1>Assembly Dashboard</h1>
                <div className="assembly-header-actions">
                    <Link to="/assembly/fpy" className="fpy-nav-link">First Pass Yield</Link>
                    <DateFilter onDateChange={setDateRange} />
                </div>
            </div>
            {loading ? (
                <div className="loading">Loading assembly data...</div>
            ) : (
                <div className="assembly-content">
                    <AssemblyLines />
                    <AssemblyMachines />
                    <AssemblyProduction />
                    <AssemblyEfficiency />
                    <AssemblyDowntime />
                    <AssemblyDefects />
                    <AssemblyFPY />
                    <AssemblyCharts />
                    <AssemblyTrends />
                </div>
            )}
        </div>
    );
}

export default Assembly;
