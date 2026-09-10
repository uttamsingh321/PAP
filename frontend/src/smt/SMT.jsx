import React, { useState, useEffect } from 'react';
import SMTCharts from './SMTCharts';
import SMTProduction from './SMTProduction';
import SMTEfficiency from './SMTEfficiency';
import SMTDowntime from './SMTDowntime';
import SMTDefects from './SMTDefects';
import SMTMachines from './SMTMachines';
import SMTLines from './SMTLines';
import SMTTrends from './SMTTrends';
import DateFilter from '../components/DateFilter';
import './smt.css';

function SMT() {
    const [smtData, setSmtData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    useEffect(() => {
        fetchSMTData();
    }, [dateRange]);

    const fetchSMTData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/smt/');
            const data = await response.json();
            setSmtData(data);
        } catch (error) {
            console.error('Error fetching SMT data:', error);
        }
        setLoading(false);
    };

    return (
        <div className="smt-container">
            <div className="smt-header">
                <h1>SMT Dashboard</h1>
                <DateFilter onDateChange={setDateRange} />
            </div>
            {loading ? (
                <div className="loading">Loading SMT data...</div>
            ) : (
                <div className="smt-content">
                    <SMTLines />
                    <SMTMachines />
                    <SMTProduction />
                    <SMTEfficiency />
                    <SMTDowntime />
                    <SMTDefects />
                    <SMTCharts />
                    <SMTTrends />
                </div>
            )}
        </div>
    );
}

export default SMT;
