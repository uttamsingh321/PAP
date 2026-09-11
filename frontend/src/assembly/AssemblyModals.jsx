import React, { useEffect, useMemo, useState } from 'react';
import { filterAudRecords, filterMmiRecords, goodOf, ndfOf, ngOf, summarize } from './assemblyGroups';

/*
 * Assembly detail modals — GOOD / NG / NDF / PROCESS (AUD + MMI).
 * Data source: the SAME single /api/assembly/fpy (T-MOM) response already
 * fetched by Assembly.jsx. No new fetch, no new endpoint, no mock values.
 *
 * Flow:
 *   PROCESS -> AUD/MMI cards -> AUD (or MMI) Input/GOOD/NG/NDF cards
 *           -> NG Details (paginated) / NDF Details (paginated)
 * GOOD / NG / NDF dashboard cards keep their existing raw-record tables.
 */

function fmtQty(v) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '--';
    return Number(v).toLocaleString();
}

function fmtPct(v) {
    if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return '--%';
    return `${Number(v).toFixed(2)}%`;
}

/* Reusable metric card in the same dashboard card style. */
function MetricCard({ title, icon, accent, value, sub, hint, onClick, cta }) {
    return (
        <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? `${title} — click for details` : title}
            className={`kpi-card asm-card ${accent}${onClick ? ' asm-clickable' : ''}`}
            onClick={onClick}
            onKeyDown={onClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className={`kpi-icon ${accent === 'amber' ? 'amber' : accent}`}>
                <span aria-hidden="true">{icon}</span>
            </div>
            <div className="kpi-content">
                <div className="kpi-label">{title}</div>
                <div className="kpi-value">{value}</div>
                <div className="kpi-change">{sub}</div>
                {hint ? <div className="kpi-period">{hint}</div> : null}
                {onClick ? <div className="asm-card-cta">{cta || 'Click for details ›'}</div> : null}
            </div>
        </div>
    );
}

/* Reusable process-family card (AUD / MMI) with arrow affordance. */
function ProcessSummaryCard({ name, summary, onClick }) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`${name} — click for details`}
            className="kpi-card asm-card blue asm-clickable"
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="kpi-content">
                <div className="kpi-label">{name}</div>
                <div className="kpi-value">{fmtPct(summary?.fpy)}</div>
                <div className="kpi-period">Pass rate</div>
                <div className="asm-card-cta" aria-hidden="true">→</div>
            </div>
        </div>
    );
}

function DataRow({ label, value }) {
    return (
        <div className="asm-modal-row">
            <span className="asm-modal-label">{label}</span>
            <span className="asm-modal-value">{value}</span>
        </div>
    );
}

/* Reusable paginated detail table for NG / NDF records. */
function DetailTable({ rows, pageSize = 10 }) {
    const [page, setPage] = useState(0);
    const safeRows = Array.isArray(rows) ? rows : [];
    const totalPages = Math.max(1, Math.ceil(safeRows.length / pageSize));
    const safePage = Math.min(page, totalPages - 1);
    const start = safePage * pageSize;
    const pageRows = safeRows.slice(start, start + pageSize);

    useEffect(() => { setPage(0); }, [safeRows.length]);

    const numOf = (item, ...keys) => {
        for (const k of keys) {
            const n = Number(item[k]);
            if (Number.isFinite(n)) return n;
        }
        return 0;
    };
    const strOf = (item, ...keys) => {
        for (const k of keys) {
            const v = item[k];
            if (v !== null && v !== undefined && String(v).trim() !== '') return String(v);
        }
        return '--';
    };

    if (safeRows.length === 0) {
        return <div className="asm-chart-placeholder">No detailed records in this data window.</div>;
    }

    return (
        <>
            <div className="asm-table-wrap">
                <table className="asm-raw-table">
                    <thead>
                        <tr>
                            <th>Date &amp; Time</th>
                            <th>Part Number</th>
                            <th>Quantity</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((r, idx) => (
                            <tr key={`${r.workOrder || r.orderCode || idx}-${start + idx}`}>
                                <td>{strOf(r, 'recordDate', 'startTime', 'endTime')}</td>
                                <td>{strOf(r, 'projectName', 'processName', 'workOrder', 'orderCode')}</td>
                                <td>{numOf(r, 'defects', 'numberOfDefects', 'falseDetections', 'numberOfFalseDetections').toLocaleString()}</td>
                                <td>{strOf(r, 'processName', 'workOrderType', 'orderType', 'processSection', 'processGroup')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="asm-pager" aria-label="Detail table pages">
                <button
                    type="button"
                    className="asm-pager-btn"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                    ‹ Prev
                </button>
                <span className="asm-pager-label">Page {safePage + 1} of {totalPages}</span>
                <button
                    type="button"
                    className="asm-pager-btn"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                    Next ›
                </button>
            </div>
        </>
    );
}

function AssemblyModals({ activeId, onClose, totals, selectedLabel, records }) {
    const [view, setView] = useState({ name: null, detail: null });
    useEffect(() => { setView({ name: null, detail: null }); }, [activeId]);
    useEffect(() => {
        if (!activeId) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeId, onClose]);

    const rowsData = useMemo(() => (Array.isArray(records) ? records : []), [records]);
    const audRecords = useMemo(() => filterAudRecords(rowsData), [rowsData]);
    const mmiRecords = useMemo(() => filterMmiRecords(rowsData), [rowsData]);
    const aud = useMemo(() => summarize(audRecords), [audRecords]);
    const mmi = useMemo(() => summarize(mmiRecords), [mmiRecords]);

    if (!activeId) return null;
    const t = totals || {};
    const dateValue = selectedLabel || '--';

    const numOf = (item, ...keys) => {
        for (const k of keys) {
            const n = Number(item[k]);
            if (Number.isFinite(n)) return n;
        }
        return 0;
    };
    const strOf = (item, ...keys) => {
        for (const k of keys) {
            const v = item[k];
            if (v !== null && v !== undefined && String(v).trim() !== '') return String(v);
        }
        return '--';
    };
/* Raw GOOD/NG/NDF dashboard-card table (existing behaviour). */
    const rawTable = (tableRows, tableTitle, emptyText) => (
        <div className="asm-modal-group">
            <div className="asm-modal-group-title">{tableTitle} ({tableRows.length})</div>
            {tableRows.length === 0 ? (
                <div className="asm-chart-placeholder">{emptyText}</div>
            ) : (
                <div className="asm-table-wrap">
                    <table className="asm-raw-table">
                        <thead>
                            <tr>
                                <th>Process</th>
                                <th>Project</th>
                                <th>Work Order</th>
                                <th>Section</th>
                                <th>W.O. Type</th>
                                <th>Starts</th>
                                <th>Good</th>
                                <th>Defects</th>
                                <th>False Det.</th>
                                <th>FPY %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((r, idx) => (
                                <tr key={`${r.workOrder || r.orderCode || idx}-${idx}`}>
                                    <td>{strOf(r, 'processName')}</td>
                                    <td>{strOf(r, 'projectName')}</td>
                                    <td>{strOf(r, 'workOrder', 'orderCode')}</td>
                                    <td>{strOf(r, 'processSection', 'processGroup')}</td>
                                    <td>{strOf(r, 'workOrderType', 'orderType')}</td>
                                    <td>{numOf(r, 'productionStarts', 'numberOfProductionStarts').toLocaleString()}</td>
                                    <td>{numOf(r, 'goodProducts', 'numberOfGoodProducts').toLocaleString()}</td>
                                    <td>{numOf(r, 'defects', 'numberOfDefects').toLocaleString()}</td>
                                    <td>{numOf(r, 'falseDetections', 'numberOfFalseDetections').toLocaleString()}</td>
                                    <td>{(() => {
                                        const f = r.firstPassYield ?? r.fpy ?? r.firstPassYieldFPY;
                                        const n = Number(f);
                                        return Number.isFinite(n) ? `${n.toFixed(2)}%` : '--';
                                    })()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
/* AUD / MMI drill-down: GOOD/NG/NDF cards -> NG/NDF detail table. */
    const famDetail = (fname, frecords, s) => {
        if (view.detail === 'ng') {
            const list = frecords.filter((r) => ngOf(r) > 0);
            return (
                <>
                    <div className="asm-modal-grid-2">
                        <MetricCard title="Total NG" icon="❌" accent="red" value={fmtQty(s.ng)} sub={`NG % = NG / Input x 100 = ${fmtPct(s.ngPct)}`} />
                        <MetricCard title="NG %" icon="📉" accent="red" value={fmtPct(s.ngPct)} sub={`NG ${fmtQty(s.ng)} / Input ${fmtQty(s.input)}`} />
                    </div>
                    <div className="asm-modal-group">
                        <div className="asm-modal-group-title">{fname} NG Details ({list.length})</div>
                        <DetailTable rows={list} />
                    </div>
                    <button type="button" className="asm-back-btn" onClick={() => setView({ name: fname, detail: null })}>‹ Back to {fname}</button>
                </>
            );
        }
        if (view.detail === 'ndf') {
            const list = frecords.filter((r) => ndfOf(r) > 0);
            return (
                <>
                    <div className="asm-modal-grid-2">
                        <MetricCard title="Total NDF" icon="🔁" accent="amber" value={fmtQty(s.ndf)} sub={`NDF % = NDF / Input x 100 = ${fmtPct(s.ndfPct)}`} />
                        <MetricCard title="NDF %" icon="📉" accent="amber" value={fmtPct(s.ndfPct)} sub={`NDF ${fmtQty(s.ndf)} / Input ${fmtQty(s.input)}`} />
                    </div>
                    <div className="asm-modal-group">
                        <div className="asm-modal-group-title">{fname} NDF Details ({list.length})</div>
                        <DetailTable rows={list} />
                    </div>
                    <button type="button" className="asm-back-btn" onClick={() => setView({ name: fname, detail: null })}>‹ Back to {fname}</button>
                </>
            );
        }
        return (
            <>
                <div className="asm-modal-grid-2">
                    <MetricCard title="Input" icon="📥" accent="blue" value={fmtQty(s.input)} sub={`${s.recordCount} record${s.recordCount === 1 ? '' : 's'}`} hint={dateValue} />
                    <MetricCard title="GOOD" icon="✅" accent="green" value={fmtQty(s.good)} sub={fmtPct(s.goodPct)} hint="Good products" />
                    <MetricCard title="NG" icon="❌" accent="red" value={fmtQty(s.ng)} sub={fmtPct(s.ngPct)} hint="Click NG for detailed records" onClick={() => setView({ name: fname, detail: 'ng' })} cta="Click for detailed records ›" />
                    <MetricCard title="NDF" icon="🔁" accent="amber" value={fmtQty(s.ndf)} sub={fmtPct(s.ndfPct)} hint="Click NDF for detailed records" onClick={() => setView({ name: fname, detail: 'ndf' })} cta="Click for detailed records ›" />
                </div>
                <div className="asm-chart-placeholder">Click NG or NDF for detailed records</div>
                <button type="button" className="asm-back-btn" onClick={() => setView({ name: null, detail: null })}>‹ Back to PROCESS</button>
            </>
        );
    };
let title = 'Details';
    let icon = '📊';
    let body = <DataRow label="Selected Date" value={dateValue} />;

    if (activeId === 'good') {
        title = 'GOOD Details'; icon = '✅';
        const tableRows = rowsData.filter((r) => goodOf(r) > 0);
        body = (<>
            <DataRow label="Total GOOD" value={fmtQty(t.good)} />
            <DataRow label="Good %" value={fmtPct(t.goodPct)} />
            <DataRow label="Selected Date" value={dateValue} />
            {rawTable(tableRows, 'Raw GOOD records (good products > 0)', 'No GOOD records in this data window.')}
        </>);
    } else if (activeId === 'ng') {
        title = 'NG Details'; icon = '❌';
        const tableRows = rowsData.filter((r) => ngOf(r) > 0);
        body = (<>
            <DataRow label="Total NG" value={fmtQty(t.ng)} />
            <DataRow label="NG %" value={fmtPct(t.ngPct)} />
            <DataRow label="Selected Date" value={dateValue} />
            {rawTable(tableRows, 'Raw NG records (defects > 0)', 'No NG records in this data window.')}
        </>);
    } else if (activeId === 'ndf') {
        title = 'NDF Details'; icon = '🔁';
        const tableRows = rowsData.filter((r) => ndfOf(r) > 0);
        body = (<>
            <DataRow label="Total NDF" value={fmtQty(t.ndf)} />
            <DataRow label="NDF %" value={fmtPct(t.ndfPct)} />
            <DataRow label="Selected Date" value={dateValue} />
            {rawTable(tableRows, 'Raw NDF records (false detections > 0)', 'No NDF records in this data window.')}
        </>);
    } else if (activeId === 'process') {
        title = 'PROCESS Details'; icon = '⚙️';
        if (view.name === 'AUD') {
            title = 'AUD Details';
            body = famDetail('AUD', audRecords, aud);
        } else if (view.name === 'MMI') {
            title = 'MMI Details';
            body = famDetail('MMI', mmiRecords, mmi);
        } else {
            body = (
                <div className="asm-modal-grid-2">
                    <ProcessSummaryCard name="AUD" summary={aud} onClick={() => setView({ name: 'AUD', detail: null })} />
                    <ProcessSummaryCard name="MMI" summary={mmi} onClick={() => setView({ name: 'MMI', detail: null })} />
                </div>
            );
        }
    }

    return (
        <div className="asm-modal-overlay" onClick={onClose} role="presentation">
            <div
                className="asm-modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="asm-modal-header">
                    <h3><span aria-hidden="true">{icon}</span> {title}</h3>
                    <button type="button" className="asm-modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
                </div>
                <div className="asm-modal-body">{body}</div>
            </div>
        </div>
    );
}

export default AssemblyModals;
export { DetailTable, MetricCard, ProcessSummaryCard };