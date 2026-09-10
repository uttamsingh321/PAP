import React, { useState, useEffect } from 'react';
import DashboardKPIs from './DashboardKPIs';
import DashboardCharts from './DashboardCharts';
import DashboardTables from './DashboardTables';
import DashboardTrends from './DashboardTrends';
import DateFilter from '../components/DateFilter';
import './dashboard.css';

function MainDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/dashboard/");
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Main Dashboard</h1>
                    <p className="page-subtitle">Overview of production analytics</p>
                </div>
                <DateFilter onDateChange={setDateRange} />
            </div>
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    <DashboardKPIs data={dashboardData} />
                    <DashboardCharts data={dashboardData} />
                    <div className="bottom-grid">
                        <DashboardTables data={dashboardData} />
                        <DashboardTrends data={dashboardData} />
                    </div>
                </>
            )}
        </div>
    );
}

export default MainDashboard;
