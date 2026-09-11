import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AssemblyModals from './AssemblyModals';
import AssemblyCards from './AssemblyCards';
import './assembly.css';

/*
 * Assembly Overview — FOUR live cards only (GOOD / NG / NDF / PROCESS with AUD & MMI %).
 * Data source: EXISTING endpoint /api/assembly/fpy (same T-MOM integration as
 * AssemblyFPY.jsx). No new endpoint, no new service, no mock data.
 * GOOD = goodProducts, NG = defects, NDF = falseDetections, TOTAL = productionStarts.
 */

const FPY_API = '/api/assembly/fpy';

const pad2 = (n) => String(n).padStart(2, '0');

function windowForDay(year, month, day) {
    const datePart = `${year}-${pad2(month)}-${pad2(day)}`;
    return {
        startTime: `${datePart} 00:00:00`,
        endTime: `${datePart} 23:59:59`,
        label: datePart,
    };
}

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

function deriveTotals(records) {
    let good = 0;
    let ng = 0;
    let ndf = 0;
    let total = 0;
    (records || []).forEach((item) => {
        good += num(item.goodProducts ?? item.numberOfGoodProducts);
        ng += num(item.defects ?? item.numberOfDefects);
        ndf += num(item.falseDetections ?? item.numberOfFalseDetections);
        total += num(item.productionStarts ?? item.numberOfProductionStarts);
    });
    const pct = (part) => (total > 0 ? Number(((part / total) * 100).toFixed(2)) : null);
    return {
        good, ng, ndf, total,
        goodPct: pct(good), ngPct: pct(ng), ndfPct: pct(ndf),
        fpy: pct(good),
        recordCount: (records || []).length,
    };
}

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

function Assembly() {
    const now = new Date();
    const [activeModal, setActiveModal] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [queryWindow, setQueryWindow] = useState(null);
    // Date / Month / Year controls belong ONLY to the Assembly Overview page.
    // They are kept local here so they never leak into /assembly/fpy,
    // which owns its own Process/Project/WorkOrder/Time filters.
    const [selectedDay, setSelectedDay] = useState(String(now.getDate()));
    const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

    const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const yearOptions = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

    const clampDay = (year, month, day) => {
        const dim = new Date(Number(year), Number(month), 0).getDate();
        return Number(day) > dim ? String(dim) : day;
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        setSelectedDay((day) => clampDay(selectedYear, value, day));
    };

    const handleYearChange = (value) => {
        setSelectedYear(value);
        setSelectedDay((day) => clampDay(value, selectedMonth, day));
    };

    // ONE request per Date/Month/Year change — reuses the existing FPY
    // endpoint with its exact startTime/endTime params.
    const fetchOverview = useCallback(async (year, month, day) => {
        const win = windowForDay(year, month, day);
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams({ startTime: win.startTime, endTime: win.endTime }).toString();
            const response = await fetch(`${FPY_API}?${qs}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message || 'Failed to fetch production data');
            setRecords(Array.isArray(result.data) ? result.data : []);
            setQueryWindow(result.metadata ? { start: result.metadata.start_time, end: result.metadata.end_time } : win);
        } catch (err) {
            console.error('Error fetching assembly overview data:', err);
            setError(err.message || 'Unable to load production data');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview(selectedYear, selectedMonth, selectedDay);
    }, [selectedDay, selectedMonth, selectedYear, fetchOverview]);

    const totals = useMemo(() => deriveTotals(records), [records]);
    const selectedLabel = `${selectedYear}-${pad2(selectedMonth)}-${pad2(selectedDay)}`;
    const isEmpty = !loading && !error && totals.recordCount === 0;

    return (
        <div className="assembly-container">
            <div className="assembly-header">
                <h1>Assembly Dashboard</h1>
                <div className="assembly-header-actions">
                    <Link to="/assembly/fpy" className="fpy-nav-link">First Pass Yield</Link>
                    <div className="assembly-date-controls" aria-label="Assembly date controls">
                        <div className="adc-group">
                            <label htmlFor="assembly-day">Date</label>
                            <select id="assembly-day" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                {dayOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
                            </select>
                        </div>
                        <div className="adc-group">
                            <label htmlFor="assembly-month">Month</label>
                            <select id="assembly-month" value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)}>
                                {MONTHS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                            </select>
                        </div>
                        <div className="adc-group">
                            <label htmlFor="assembly-year">Year</label>
                            <select id="assembly-year" value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
                                {yearOptions.map((y) => (<option key={y} value={y}>{y}</option>))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            {queryWindow && !loading && !error && (
                <div className="asm-window-note" aria-live="polite">
                    Data window: {queryWindow.start} &rarr; {queryWindow.end} &nbsp;•&nbsp; {totals.recordCount} record{totals.recordCount === 1 ? '' : 's'}
                </div>
            )}
            {error ? (
                <div className="asm-state asm-error" role="alert">
                    <div className="asm-state-title">Unable to load production data</div>
                    <div className="asm-state-detail">{error}</div>
                    <button
                        type="button"
                        className="fpy-nav-link asm-retry-btn"
                        onClick={() => fetchOverview(selectedYear, selectedMonth, selectedDay)}
                    >
                        Retry
                    </button>
                </div>
            ) : isEmpty ? (
                <>
                    <AssemblyCards totals={totals} loading={false} onOpen={setActiveModal} records={records} />
                    <div className="asm-state" aria-live="polite">No data available for {selectedLabel}.</div>
                    <AssemblyModals
                        activeId={activeModal}
                        onClose={() => setActiveModal(null)}
                        totals={totals}
                        selectedLabel={selectedLabel}
                        records={records}
                    />
                </>
            ) : (
                <>
                    <AssemblyCards totals={totals} loading={loading} onOpen={setActiveModal} records={records} />
                    <AssemblyModals
                        activeId={activeModal}
                        onClose={() => setActiveModal(null)}
                        totals={totals}
                        selectedLabel={selectedLabel}
                        records={records}
                    />
                </>
            )}
        </div>
    );
}

export default Assembly;
