import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const API_BASE_URL = "/api/assembly/fpy";
import "./AssemblyFPY.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const calculateKPIs = (data) => {
    if (!data || data.length === 0) return { overallFPY: 0, totalStarts: 0, totalGood: 0, totalDefects: 0, totalFalseDetections: 0, overallRTY: 0 };
    const num = (v) => Number(v) || 0;
    const startsOf = (item) => num(item.productionStarts ?? item.numberOfProductionStarts);
    const goodOf = (item) => num(item.goodProducts ?? item.numberOfGoodProducts);
    const defectsOf = (item) => num(item.defects ?? item.numberOfDefects);
    const falseDetOf = (item) => num(item.falseDetections ?? item.numberOfFalseDetections);
    const rtyOf = (item) => num(item.overallRTY ?? item.overallFirstPassYieldRTY);
    const totalStarts = data.reduce((s, i) => s + startsOf(i), 0);
    const totalGood = data.reduce((s, i) => s + goodOf(i), 0);
    const totalDefects = data.reduce((s, i) => s + defectsOf(i), 0);
    const totalFalseDetections = data.reduce((s, i) => s + falseDetOf(i), 0);
    const overallFPY = totalStarts > 0 ? (totalGood / totalStarts) * 100 : 0;
    const overallRTY = data.length > 0 ? data.reduce((s, i) => s + rtyOf(i), 0) / data.length : 0;
    return { overallFPY: overallFPY.toFixed(2), totalStarts, totalGood, totalDefects, totalFalseDetections, overallRTY: overallRTY.toFixed(2) };
};

const calcProcessFPY = (data) => {
    const m = {};
    data.forEach(item => {
        const n = item.processName || "Unknown";
        if (!m[n]) m[n] = { processName: n, starts: 0, good: 0, defects: 0, falseDetections: 0 };
        m[n].starts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;
        m[n].good += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;
        m[n].defects += Number(item.defects ?? item.numberOfDefects) || 0;
        m[n].falseDetections += Number(item.falseDetections ?? item.numberOfFalseDetections) || 0;
    });
    return Object.values(m).map(p => ({
        ...p,
        firstPassYield: p.starts > 0 ? ((p.good / p.starts) * 100).toFixed(2) : 0,
        defectRate: p.starts > 0 ? ((p.defects / p.starts) * 100).toFixed(2) : 0,
        falseDetectionRate: p.starts > 0 ? ((p.falseDetections / p.starts) * 100).toFixed(2) : 0
    }));
};

const calcProjectFPY = (data) => {
    const m = {};
    data.forEach(item => {
        const n = item.projectName || "Unknown";
        if (!m[n]) m[n] = { projectName: n, starts: 0, good: 0 };
        m[n].starts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;
        m[n].good += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;
    });
    return Object.values(m).map(p => ({ ...p, firstPassYield: p.starts > 0 ? ((p.good / p.starts) * 100).toFixed(2) : 0 }));
};

const calcProdVsGood = (data) => {
    const m = {};
    data.forEach(item => {
        const n = item.projectName || "Unknown";
        if (!m[n]) m[n] = { projectName: n, productionStarts: 0, goodProducts: 0 };
        m[n].productionStarts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;
        m[n].goodProducts += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;
    });
    return Object.values(m);
};

const calcGoodVsDefects = (data) => [
    { name: "Good Products", value: data.reduce((s, i) => s + (Number(i.goodProducts ?? i.numberOfGoodProducts) || 0), 0) },
    { name: "Defects", value: data.reduce((s, i) => s + (Number(i.defects ?? i.numberOfDefects) || 0), 0) }
];

const calcFPYTrend = (data) => {
    const m = new Map();
    data.forEach(item => {
        const k = (item.recordDate || "").slice(0, 10) || "Unknown";
        if (!m.has(k)) m.set(k, { total: 0, count: 0 });
        const e = m.get(k);
        e.total += parseFloat(item.firstPassYield || item.fpy || 0);
        e.count += 1;
    });
    return Array.from(m.entries())
        .map(([date, e]) => ({ date, fpy: e.count > 0 ? (e.total / e.count).toFixed(2) : "0.00" }))
        .sort((a, b) => a.date < b.date ? -1 : 1);
};

// Build query string from active filter state; each value is passed to Django
// which forwards it directly to the T-MOM API as a server-side filter.
function buildQS(f) {
    const p = new URLSearchParams();
    if (f.startTime)      p.set("startTime", f.startTime);
    if (f.endTime)        p.set("endTime", f.endTime);
    if (f.processSection) p.set("processSection", f.processSection);
    if (f.orderType)      p.set("orderType", f.orderType);
    if (f.processName)    p.set("processNames", f.processName);
    if (f.projectName)    p.set("projectNames", f.projectName);
    // ROOT CAUSE FIX: workOrder is now sent to the backend so T-MOM gets
    // a real orderCodeList instead of an empty list.
    if (f.workOrder)      p.set("workOrders", f.workOrder);
    const s = p.toString();
    return s ? "?" + s : "";
}

const EMPTY_FILTERS = {
    startTime: "", endTime: "",
    processSection: "", orderType: "",
    processName: "", projectName: "", workOrder: ""
};

// Format helpers: 24-hour HH:MM:SS, backend format "YYYY-MM-DD HH:MM:SS"
// <input type="datetime-local"> uses "YYYY-MM-DDTHH:MM" (no seconds).
const toInputDT = (s) => (s ? s.replace(" ", "T").slice(0, 16) : "");
const toApiDT = (v) => (v ? v.replace("T", " ") + ":00" : "");
const fmt24 = (d) =>
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0") + ":" +
    String(d.getSeconds()).padStart(2, "0");

// Business day: 08:00 -> now.
// If now >= 08:00  -> today 08:00:00 -> now
// If now <  08:00  -> yesterday 08:00:00 -> now
function businessDayWindow() {
    const now = new Date();
    const today8am = new Date(now);
    today8am.setHours(8, 0, 0, 0);
    const start = now >= today8am ? today8am : new Date(today8am.getTime() - 24 * 60 * 60 * 1000);
    const fmt = (d) =>
        d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0") + " " +
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0") + ":" +
        String(d.getSeconds()).padStart(2, "0");
    return { startTime: fmt(start), endTime: fmt(now) };
}

// Default data window mirrors the T-MOM FPY report UI: business-day (08:00 -> now).
// It is sent explicitly on every request so the numbers on screen always
// correspond to a visible, reproducible time window.
function defaultWindow() {
    return businessDayWindow();
}

// "Last 2 Days": previous business-day boundary -> now (NOT simply 48 hours).
function last2DaysWindow() {
    const now = new Date();
    const today8am = new Date(now);
    today8am.setHours(8, 0, 0, 0);
    let start;
    if (now >= today8am) {
        start = new Date(today8am.getTime() - 24 * 60 * 60 * 1000);
    } else {
        start = new Date(today8am.getTime() - 2 * 24 * 60 * 60 * 1000);
    }
    const fmt = (d) =>
        d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0") + " " +
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0") + ":" +
        String(d.getSeconds()).padStart(2, "0");
    return { startTime: fmt(start), endTime: fmt(now) };
}

const fmtDateTime = (d) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0") + " " + fmt24(d);

// Full reset = empty dimension filters + a fresh default time window.
const resetFilters = () => ({ ...EMPTY_FILTERS, ...defaultWindow() });

function AssemblyFPY() {
    const [data, setData] = useState([]);
    // optionsData = unfiltered snapshot used only to populate dropdown options
    const [optionsData, setOptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiStatus, setApiStatus] = useState("connecting");
    const [lastUpdated, setLastUpdated] = useState(null);
    // Time window actually used by the last successful fetch (from backend
    // metadata) so the numbers on screen are tied to a visible window.
    const [queryWindow, setQueryWindow] = useState(null);
    const [filters, setFilters] = useState(resetFilters);
    // Live clock: updates every second, 24-hour HH:MM:SS
    const [liveClock, setLiveClock] = useState(fmt24(new Date()));
    useEffect(() => {
        const id = setInterval(() => setLiveClock(fmt24(new Date())), 1000);
        return () => clearInterval(id);
    }, []);


    // fetchData sends all active filters to Django → T-MOM. No client-side
    // re-filtering of a stale blob — every filter change hits the real API.
    const fetchData = useCallback(async (activeFilters) => {
        setLoading(true);
        setError(null);
        setApiStatus("connecting");
        try {
            const qs = buildQS(activeFilters);
            const res = await fetch(API_BASE_URL + qs);
            if (!res.ok) throw new Error("HTTP error! status: " + res.status);
            const result = await res.json();
            if (result.status === "success") {
                setData(result.data);
                setApiStatus("connected");
                setLastUpdated(fmtDateTime(new Date()));
                if (result.metadata) {
                    setQueryWindow({ start: result.metadata.start_time, end: result.metadata.end_time });
                }
                // Refresh dropdown options only when no dimension filter is
                // active (date fields are always set, so ignore them here).
                const hasDimensionFilter = Boolean(
                    activeFilters.processSection || activeFilters.orderType ||
                    activeFilters.processName || activeFilters.projectName ||
                    activeFilters.workOrder
                );
                if (!hasDimensionFilter) {
                    setOptionsData(result.data);
                }
            } else {
                throw new Error(result.message || "Failed to fetch data");
            }
        } catch (err) {
            setError(err.message || "Failed to connect to T-MOM API");
            setApiStatus("error");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load only (mount): preserve existing default business-day window fetch.
    // After this, filter edits NEVER auto-fetch — user must click "Show Data".
    useEffect(() => { fetchData(resetFilters()); }, []); // eslint-disable-line

    // Filter edits only update UI state. No API call here by design.
    const setFilter = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
    };

    // Explicit user action: read all current filter values and fetch fresh LIVE T-MOM data.
    const handleShowData = () => {
        fetchData(filters);
    };

    const clearAll = () => { const f = resetFilters(); setFilters(f); fetchData(f); };

    const processOptions = useMemo(() => [...new Set(optionsData.map(i => i.processName).filter(Boolean))].sort(), [optionsData]);
    const projectOptions = useMemo(() => [...new Set(optionsData.map(i => i.projectName).filter(Boolean))].sort(), [optionsData]);

    const kpis = useMemo(() => calculateKPIs(data), [data]);
    const processFPY = useMemo(() => calcProcessFPY(data), [data]);
    const projectFPY = useMemo(() => calcProjectFPY(data), [data]);
    const productionVsGood = useMemo(() => calcProdVsGood(data), [data]);
    const goodVsDefects = useMemo(() => calcGoodVsDefects(data), [data]);
    const attentionProcesses = useMemo(() =>
        calcProcessFPY(data).filter(p => parseFloat(p.firstPassYield) < 80)
            .sort((a, b) => parseFloat(a.firstPassYield) - parseFloat(b.firstPassYield)),
        [data]);
    const fpyTrend = useMemo(() => calcFPYTrend(data), [data]);

    if (loading) return (
        <div className="fpy-container">
            <div className="fpy-loading">
                <div className="loading-spinner"></div>
                <p>Loading live First Pass Yield data...</p>
            </div>
        </div>
    );

    if (error && data.length === 0) return (
        <div className="fpy-container">
            <div className="fpy-error">
                <div className="fpy-error-icon">&#x26A0;&#xFE0F;</div>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <div className="fpy-error-hint">
                    <p>Please check that:</p>
                    <ul>
                        <li>The Django backend is running (python manage.py runserver)</li>
                        <li>T-MOM API credentials are configured in backend/.env</li>
                        <li>The T-MOM API is accessible from your network</li>
                    </ul>
                </div>
                <button className="fpy-btn fpy-btn-primary" onClick={() => fetchData(filters)}>Retry</button>
            </div>
        </div>
    );

    // EMPTY state: API reachable but zero records for the selected filters/window
    if (!loading && !error && data.length === 0) return (
        <div className="fpy-container">
            <div className="fpy-header">
                <div className="fpy-title-section">
                    <h1>First Pass Yield</h1>
                    <p className="fpy-subtitle">Assembly First Pass Yield Analysis</p>
                </div>
            </div>
            <div className="fpy-empty">
                <div className="fpy-empty-icon">&#x1F4ED;</div>
                <h3>No FPY data found for the selected filters.</h3>
                <p>Try widening the date window or clearing filters, then refresh.</p>
                <div className="fpy-header-actions">
                    <Link to="/ng-ndf" className="fpy-btn fpy-btn-secondary fpy-btn-ngndf">NG% / NDF% Comparison</Link>
                    <button className="fpy-btn fpy-btn-outline" onClick={clearAll}>Clear Filters</button>
                    <button className="fpy-btn fpy-btn-primary" onClick={handleShowData}>Show Data</button>
                    <button className="fpy-btn fpy-btn-outline" onClick={() => { const w = businessDayWindow(); setFilters({ ...filters, startTime: w.startTime, endTime: w.endTime }); }}>Today</button>
                    <button className="fpy-btn fpy-btn-outline" onClick={() => { const w = last2DaysWindow(); setFilters({ ...filters, startTime: w.startTime, endTime: w.endTime }); }}>Last 2 Days</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fpy-container">
            <div className="fpy-header">
                <div className="fpy-title-section">
                    <h1>First Pass Yield</h1>
                    <p className="fpy-subtitle">Assembly First Pass Yield Analysis</p>
                    <div className="fpy-data-status">
                        <span className={`fpy-status-badge ${apiStatus}`}>
                            {apiStatus === "connected" ? "LIVE" : apiStatus === "connecting" ? "CONNECTING..." : "ERROR"}
                        </span>
                        {lastUpdated && <span className="fpy-last-updated">Last updated: {lastUpdated}</span>}
                        <span className="fpy-last-updated">
                            Current time: {liveClock}
                        </span>
                        {queryWindow && (
                            <span className="fpy-last-updated">
                                Data window: {queryWindow.start} &rarr; {queryWindow.end}
                            </span>
                        )}
                    </div>
                </div>
                <div className="fpy-header-actions">
                    <Link to="/ng-ndf" className="fpy-btn fpy-btn-secondary fpy-btn-ngndf">NG% / NDF% Comparison</Link>
                    <button className="fpy-btn fpy-btn-secondary" onClick={clearAll}>View All Data</button>
                    <button className="fpy-btn fpy-btn-primary" onClick={handleShowData}>Show Data</button>
                </div>
            </div>

            {/* Filter Bar: edits update UI state only; click "Show Data" to fetch fresh LIVE T-MOM data */}
            <div className="fpy-filter-bar">
                <div className="fpy-filter-group">
                    <label>Process Name</label>
                    <select value={filters.processName} onChange={e => setFilter("processName", e.target.value)}>
                        <option value="">All Processes</option>
                        {processOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="fpy-filter-group">
                    <label>Project Name</label>
                    <select value={filters.projectName} onChange={e => setFilter("projectName", e.target.value)}>
                        <option value="">All Projects</option>
                        {projectOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="fpy-filter-group">
                    <label>Work Order</label>
                    <input type="text" value={filters.workOrder}
                        onChange={e => setFilter("workOrder", e.target.value)}
                        placeholder="e.g. 2900009434" />
                </div>
                <div className="fpy-filter-group">
                    <label>Process Section</label>
                    <input type="text" value={filters.processSection}
                        onChange={e => setFilter("processSection", e.target.value)}
                        placeholder="e.g. ASSY" />
                </div>
                <div className="fpy-filter-group">
                    <label>W.O. Type</label>
                    <input type="text" value={filters.orderType}
                        onChange={e => setFilter("orderType", e.target.value)}
                        placeholder="e.g. ZP02" />
                </div>
                <div className="fpy-filter-group">
                    <label>Start Time</label>
                    <input type="datetime-local" value={toInputDT(filters.startTime)}
                        onChange={e => setFilter("startTime", toApiDT(e.target.value))} />
                </div>
                <div className="fpy-filter-group">
                    <label>End Time</label>
                    <input type="datetime-local" value={toInputDT(filters.endTime)}
                        onChange={e => setFilter("endTime", toApiDT(e.target.value))} />
                </div>
                <button className="fpy-btn fpy-btn-outline" onClick={clearAll}>Clear Filters</button>
                <button className="fpy-btn fpy-btn-primary" onClick={handleShowData}>Show Data</button>
                {!filters.workOrder && (
                    <p className="fpy-filter-hint">
                        Note: without a Work Order, T-MOM returns project/process-level totals.
                        Enter a W.O. (e.g. 2900009434) to see that order&apos;s own production numbers.
                    </p>
                )}
            </div>

            <div className="fpy-kpi-grid">
                <div className="fpy-kpi-card blue">
                    <div className="fpy-kpi-icon">FPY</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Overall First Pass Yield</div>
                        <div className="fpy-kpi-value">{kpis.overallFPY}%</div>
                    </div>
                </div>
                <div className="fpy-kpi-card green">
                    <div className="fpy-kpi-icon">PS</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Number of production starts</div>
                        <div className="fpy-kpi-value">{kpis.totalStarts.toLocaleString()}</div>
                    </div>
                </div>
                <div className="fpy-kpi-card blue">
                    <div className="fpy-kpi-icon">GP</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Number of good products</div>
                        <div className="fpy-kpi-value">{kpis.totalGood.toLocaleString()}</div>
                    </div>
                </div>
                <div className="fpy-kpi-card red">
                    <div className="fpy-kpi-icon">DF</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Number of Defects</div>
                        <div className="fpy-kpi-value">{kpis.totalDefects.toLocaleString()}</div>
                    </div>
                </div>
                <div className="fpy-kpi-card amber">
                    <div className="fpy-kpi-icon">FD</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Number of false detections</div>
                        <div className="fpy-kpi-value">{kpis.totalFalseDetections.toLocaleString()}</div>
                    </div>
                </div>
                <div className="fpy-kpi-card purple">
                    <div className="fpy-kpi-icon">RTY</div>
                    <div className="fpy-kpi-content">
                        <div className="fpy-kpi-label">Overall First Pass Yield (RTY)</div>
                        <div className="fpy-kpi-value">{kpis.overallRTY}%</div>
                    </div>
                </div>
            </div>

            <div className="fpy-charts-grid">
                <div className="fpy-chart-card">
                    <h3>First Pass Yield by Process</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={processFPY} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="processName" stroke="#6b7280" fontSize={12} angle={-35} textAnchor="end" interval={0} height={80} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Bar dataKey="firstPassYield" fill="#3b82f6" radius={[4, 4, 0, 0]}
                                onClick={(d) => setFilter("processName", d.processName)} cursor="pointer">
                                {processFPY.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={filters.processName === entry.processName ? "#1d4ed8" : COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card">
                    <h3>First Pass Yield by Project</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={projectFPY} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="projectName" stroke="#6b7280" fontSize={12} angle={-25} textAnchor="end" interval={0} height={60} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Bar dataKey="firstPassYield" fill="#10b981" radius={[4, 4, 0, 0]}
                                onClick={(d) => setFilter("projectName", d.projectName)} cursor="pointer">
                                {projectFPY.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={filters.projectName === entry.projectName ? "#059669" : COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card">
                    <h3>Number of production starts vs Number of good products</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={productionVsGood} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="projectName" stroke="#6b7280" fontSize={12} angle={-25} textAnchor="end" interval={0} height={60} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Legend />
                            <Bar dataKey="productionStarts" fill="#3b82f6" name="Number of production starts" />
                            <Bar dataKey="goodProducts" fill="#10b981" name="Number of good products" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card">
                    <h3>Number of Defects by Process</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={processFPY} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="processName" stroke="#6b7280" fontSize={12} angle={-35} textAnchor="end" interval={0} height={80} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Bar dataKey="defects" fill="#ef4444" radius={[4, 4, 0, 0]}
                                onClick={(d) => setFilter("processName", d.processName)} cursor="pointer" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card">
                    <h3>Number of false detections by Process</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={processFPY} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="processName" stroke="#6b7280" fontSize={12} angle={-35} textAnchor="end" interval={0} height={80} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Bar dataKey="falseDetections" fill="#f59e0b" radius={[4, 4, 0, 0]}
                                onClick={(d) => setFilter("processName", d.processName)} cursor="pointer" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card">
                    <h3>Good Products vs Defects</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie data={goodVsDefects} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                                {goodVsDefects.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="fpy-chart-card full-width">
                    <h3>First Pass Yield Trend</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={fpyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} formatter={(value) => [`${value}%`, "First Pass Yield"]} />
                            <Line type="monotone" dataKey="fpy" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="First Pass Yield" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {attentionProcesses.length > 0 && (
                <div className="fpy-attention-section">
                    <h3>Processes Requiring Attention (FPY &lt; 80%)</h3>
                    <div className="fpy-attention-grid">
                        {attentionProcesses.map((proc, index) => (
                            <div key={index} className="fpy-attention-card" onClick={() => setFilter("processName", proc.processName)}>
                                <div className="fpy-attention-process">{proc.processName}</div>
                                <div className="fpy-attention-fpy red">{proc.firstPassYield}%</div>
                                <div className="fpy-attention-details">
                                    <span>Defects: {proc.defects}</span>
                                    <span>Defect Rate: {proc.defectRate}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="fpy-detail-panel">
                <h3>Detail Panel</h3>
                <div className="fpy-detail-item"><strong>Process:</strong> {filters.processName || "All Processes"}</div>
                <div className="fpy-detail-item"><strong>Project:</strong> {filters.projectName || "All Projects"}</div>
                {filters.workOrder && <div className="fpy-detail-item"><strong>Work Order:</strong> {filters.workOrder}</div>}
                <div className="fpy-detail-grid">
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">Number of production starts</span>
                        <span className="fpy-detail-value">{kpis.totalStarts.toLocaleString()}</span>
                    </div>
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">Number of good products</span>
                        <span className="fpy-detail-value">{kpis.totalGood.toLocaleString()}</span>
                    </div>
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">Number of Defects</span>
                        <span className="fpy-detail-value">{kpis.totalDefects.toLocaleString()}</span>
                    </div>
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">Number of false detections</span>
                        <span className="fpy-detail-value">{kpis.totalFalseDetections.toLocaleString()}</span>
                    </div>
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">First Pass Yield</span>
                        <span className="fpy-detail-value">{kpis.overallFPY}%</span>
                    </div>
                    <div className="fpy-detail-stat">
                        <span className="fpy-detail-label">Overall First Pass Yield (RTY)</span>
                        <span className="fpy-detail-value">{kpis.overallRTY}%</span>
                    </div>
                </div>
            </div>

            <div className="fpy-table-section">
                <h3>Data Details ({data.length} records)</h3>
                <div className="fpy-table-wrapper">
                    <table className="fpy-data-table">
                        <thead>
                            <tr>
                                <th>Process section</th>
                                <th>Project name</th>
                                <th>Work order type</th>
                                <th>Process name</th>
                                <th>Work Order</th>
                                <th>Number of production starts</th>
                                <th>Number of good products</th>
                                <th>Number of Defects</th>
                                <th>Number of false detections</th>
                                <th>Defect Rate</th>
                                <th>False Detection Rate</th>
                                <th>First Pass Yield</th>
                                <th>First Pass Yield (FPY)</th>
                                <th>Overall First Pass Yield (RTY)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan="14" className="fpy-no-data">No data available</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={index} className="fpy-clickable-row">
                                        <td>{item.processGroup || "-"}</td>
                                        <td>{item.projectName || "-"}</td>
                                        <td>{item.orderType || "-"}</td>
                                        <td>{item.processName || "-"}</td>
                                        <td>{item.orderCode || "-"}</td>
                                        <td>{(Number(item.productionStarts ?? item.numberOfProductionStarts) || 0).toLocaleString()}</td>
                                        <td>{(Number(item.goodProducts ?? item.numberOfGoodProducts) || 0).toLocaleString()}</td>
                                        <td>{(Number(item.defects ?? item.numberOfDefects) || 0).toLocaleString()}</td>
                                        <td>{(Number(item.falseDetections ?? item.numberOfFalseDetections) || 0).toLocaleString()}</td>
                                        <td>{(Number(item.defectRate) || 0).toFixed(2)}%</td>
                                        <td>{(Number(item.falseDetectionRate) || 0).toFixed(2)}%</td>
                                        <td>{(Number(item.firstPassYield) || 0).toFixed(2)}%</td>
                                        <td>{(Number(item.fpy) || 0).toFixed(2)}%</td>
                                        <td>{(Number(item.overallRTY ?? item.overallFirstPassYieldRTY) || 0).toFixed(2)}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AssemblyFPY;
