import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./NgNdfDashboard.css";

/*
 * NG% / NDF% Comparison dashboard.
 *
 * Self-contained dashboard rendered as a standalone page (route /ng-ndf) via
 * NgNdfPage.jsx. On load it shows two card grids ("Compare by Station" /
 * "Compare by Project"). Clicking a card swaps the grid for a detail view:
 * entity header, info panel, NG%/NDF% bar charts side by side, and NG%/NDF%
 * data tables below. The component's own "Back to Dashboard" returns to the
 * card grids (page-level navigation to the FPY dashboard is handled by the
 * NgNdfPage wrapper).
 *
 * Data source: /api/assembly/ng-ndf/ (Django -> tmom/fpy_service -> T-MOM).
 * The API returns matrix[station][project] = { NG: %, NDF: % }, i.e. the same
 * structure this component renders — no client-side fabrication of values.
 *
 * Navigation is internal useState (same pattern as the rest of the FPY page:
 * no router dependency inside the dashboard itself).
 */

const API_URL = "/api/assembly/ng-ndf/";

/* Exact station / project lists — do not rename, reorder, or change casing. */
const STATIONS = ["ANTWBG", "AUD", "MMI", "MMI2_All", "PCURR", "RQC", "RQC2"];
const PROJECTS = ["CN7c", "LK6", "LK7k", "P670DAI", "P670DAI4", "P6711AI", "P6711AI4", "X6840", "X6878", "X6891"];

const NG_COLOR = "#ef4444";
const NDF_COLOR = "#f59e0b";
const MUTED_COLOR = "#e5e7eb";

const pad2 = (n) => String(n).padStart(2, "0");

/* Mirrors the FPY page: business day 08:00 -> now (local time). */
function businessDayWindow() {
    const now = new Date();
    const today8am = new Date(now);
    today8am.setHours(8, 0, 0, 0);
    const start = now >= today8am ? today8am : new Date(today8am.getTime() - 24 * 60 * 60 * 1000);
    const fmt = (d) =>
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
        `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    return { startTime: fmt(start), endTime: fmt(now) };
}

const fmtPct = (v, present) => (present ? `${Number(v).toFixed(2)}%` : "--");
const numOrZero = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function NgNdfDashboard({ window: windowProp }) {
    const [matrix, setMatrix] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);
    const [view, setView] = useState(null); // null | { type: "station"|"project", name }
    const [defaultWin] = useState(() => businessDayWindow());

    // Effective window: prefer the FPY page's already-applied window so the
    // comparison always matches what the rest of the dashboard is showing.
    const activeWindow = (windowProp && windowProp.start && windowProp.end)
        ? { startTime: windowProp.start, endTime: windowProp.end }
        : defaultWin;
useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const qs = new URLSearchParams({ startTime: activeWindow.startTime, endTime: activeWindow.endTime });
                const res = await fetch(`${API_URL}?${qs.toString()}`);
                if (cancelled) return;
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const result = await res.json();
                if (cancelled) return;
                if (result.status !== "success") throw new Error(result.message || "Failed to fetch NG/NDF data");
                setMatrix((result.data && result.data.matrix) || {});
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to connect to the NG/NDF API");
                    setMatrix({});
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [activeWindow.startTime, activeWindow.endTime, retry]);

    const caseIndex = useMemo(() => {
        const index = {};
        Object.keys(matrix).forEach((station) => {
            const sLow = String(station).toLowerCase();
            index[sLow] = station;
            Object.keys(matrix[station] || {}).forEach((project) => {
                index[`${sLow}\u0000${String(project).toLowerCase()}`] = [station, project];
            });
        });
        return index;
    }, [matrix]);

    const cellFor = useMemo(() => (station, project) => {
        const cell = matrix?.[station]?.[project];
        if (cell) return { NG: numOrZero(cell.NG), NDF: numOrZero(cell.NDF), present: true };
        // Case-insensitive fallback: live T-MOM names like "MMI2_All"/"CN7c"
        // still match the fixed display lists ("MMI2_ALL"/"CN7C"). The
        // STATIONS / PROJECTS arrays themselves stay unchanged.
        const key = `${String(station).toLowerCase()}\u0000${String(project).toLowerCase()}`;
        const pair = caseIndex[key];
        if (pair) {
            const alt = matrix?.[pair[0]]?.[pair[1]];
            if (alt) return { NG: numOrZero(alt.NG), NDF: numOrZero(alt.NDF), present: true };
        }
        return { NG: 0, NDF: 0, present: false };
    }, [matrix, caseIndex]);

    /* Station detail: one row per PROJECT. Project detail: one row per STATION. */
    const rowsFor = useMemo(() => (type, name) => {
        if (type === "station") {
            return PROJECTS.map((project) => {
                const c = cellFor(name, project);
                return { name: project, NG: c.NG, NDF: c.NDF, present: c.present };
            });
        }
        return STATIONS.map((station) => {
            const c = cellFor(station, name);
            return { name: station, NG: c.NG, NDF: c.NDF, present: c.present };
        });
    }, [cellFor]);

    const summaryFor = useMemo(() => (type, name) => {
        const rows = rowsFor(type, name).filter((r) => r.present);
        if (rows.length === 0) return null;
        const avg = (key) => rows.reduce((sum, r) => sum + r[key], 0) / rows.length;
        return { NG: avg("NG"), NDF: avg("NDF") };
    }, [rowsFor]);
/* ---------------- Loading state ---------------- */
    if (loading) {
        return (
            <div className="ngndf-dashboard" role="status" aria-live="polite">
                <div className="ngndf-loading">
                    <div className="ngndf-loading-spinner" aria-hidden="true"></div>
                    <p>Loading NG% / NDF% comparison data...</p>
                </div>
            </div>
        );
    }

    /* ---------------- Error state ---------------- */
    if (error) {
        return (
            <div className="ngndf-dashboard" role="alert">
                <div className="ngndf-error">
                    <div className="ngndf-error-icon" aria-hidden="true">&#x26A0;&#xFE0F;</div>
                    <h3>Unable to load NG% / NDF% comparison data</h3>
                    <p>{error}</p>
                    <button type="button" className="ngndf-btn ngndf-btn-primary" onClick={() => setRetry((r) => r + 1)}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    /* ---------------- Detail view ---------------- */
    if (view) {
        const isStation = view.type === "station";
        const rows = rowsFor(view.type, view.name);
        const comparedList = isStation ? PROJECTS : STATIONS;
        const comparedLabel = isStation ? "Project" : "Station";

        const chartCard = (metric, title, color) => (
            <div className="ngndf-chart-card">
                <h4>{title}</h4>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={rows} margin={{ top: 5, right: 20, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} angle={-25} textAnchor="end" interval={0} height={60} />
                        <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, title]} />
                        <Bar dataKey={metric} fill={color} radius={[4, 4, 0, 0]}>
                            {rows.map((entry, index) => (
                                <Cell key={`${metric}-${index}`} fill={entry.present ? color : MUTED_COLOR} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );

        const tableCard = (metric, title) => (
            <div className="ngndf-table-card">
                <h4>{title}</h4>
                <table className="ngndf-data-table">
                    <thead>
                        <tr>
                            <th>{comparedLabel}</th>
                            <th>{metric} %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.name}>
                                <td>{row.name}</td>
                                <td className={row.present ? "" : "ngndf-cell-empty"}>{fmtPct(row[metric], row.present)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        return (
            <div className="ngndf-dashboard">
                <div className="ngndf-detail-header">
                    <button type="button" className="ngndf-back-btn" onClick={() => setView(null)}>← Back to Dashboard</button>
                    <div className="ngndf-detail-title">
                        <span className="ngndf-detail-badge">{isStation ? "STATION" : "PROJECT"}</span>
                        <h3>{view.name}</h3>
                        <span className="ngndf-detail-meta">NG vs NDF comparison</span>
                    </div>
                </div>

                <div className="ngndf-info-panel">
                    <div className="ngndf-info-item">
                        <span className="ngndf-info-label">{isStation ? "Station" : "Project"}</span>
                        <span className="ngndf-info-value">{view.name}</span>
                    </div>
                    <div className="ngndf-info-item">
                        <span className="ngndf-info-label">Formulas</span>
                        <span className="ngndf-info-value">NG% = NG / Input × 100 &nbsp;·&nbsp; NDF% = NDF / Input × 100</span>
                    </div>
                    <div className="ngndf-info-item">
                        <span className="ngndf-info-label">Compared</span>
                        <span className="ngndf-info-value">{comparedList.join(", ")}</span>
                    </div>
                </div>

                <div className="ngndf-charts-grid">
                    {chartCard("NG", `NG% by ${comparedLabel}`, NG_COLOR)}
                    {chartCard("NDF", `NDF% by ${comparedLabel}`, NDF_COLOR)}
                </div>

                <div className="ngndf-tables-grid">
                    {tableCard("NG", `NG% by ${comparedLabel}`)}
                    {tableCard("NDF", `NDF% by ${comparedLabel}`)}
                </div>
            </div>
        );
    }
    /* ---------------- Card grid view ---------------- */
    const group = (type, title, subtitle, entities) => (
        <div className="ngndf-group">
            <div className="ngndf-group-heading">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <div className="ngndf-card-grid">
                {entities.map((name) => {
                    const summary = summaryFor(type, name);
                    return (
                        <button type="button" key={name} className={`ngndf-card ngndf-card-${type}`}
                            onClick={() => setView({ type, name })}>
                            <span className="ngndf-card-badge">{type === "station" ? "STATION" : "PROJECT"}</span>
                            <span className="ngndf-card-name">{name}</span>
                            <span className="ngndf-card-meta">
                                {summary ? `NG ${summary.NG.toFixed(2)}% · NDF ${summary.NDF.toFixed(2)}%` : "No data"}
                            </span>
                            <span className="ngndf-card-arrow" aria-hidden="true">→</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="ngndf-dashboard">
            <div className="ngndf-status-line" aria-live="polite">
                Data window: {activeWindow.startTime} &rarr; {activeWindow.endTime}
                <button type="button" className="ngndf-refresh-btn" onClick={() => setRetry((r) => r + 1)}>Refresh</button>
            </div>
            {group("station", "Compare by Station", "Pick a station to compare NG% / NDF% across projects", STATIONS)}
            {group("project", "Compare by Project", "Pick a project to compare NG% / NDF% across stations", PROJECTS)}
        </div>
    );
}