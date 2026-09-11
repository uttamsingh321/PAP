import React from 'react';
import { summarizeGroups } from './assemblyGroups';

/*
 * Assembly overview cards — LIVE DATA from existing FPY/T-MOM source.
 * Exactly FOUR cards: GOOD / NG / NDF / PROCESS (AUD + MMI %).
 * Values are passed in as props derived from ONE /api/assembly/fpy response.
 * No API calls, no mock data in this component.
 */

function formatQty(v) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '--';
    return Number(v).toLocaleString();
}

function formatPct(v) {
    if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) return '--%';
    return `${Number(v).toFixed(2)}%`;
}

function AssemblyCards({ totals, loading, onOpen, records }) {
    const t = totals || {};
    const groups = summarizeGroups(records);

    const cards = [
        {
            id: 'good',
            title: 'GOOD',
            icon: '✅',
            accent: 'green',
            value: loading ? 'Loading...' : formatQty(t.good),
            sub: loading ? '--' : formatPct(t.goodPct),
            hint: 'Good products',
        },
        {
            id: 'ng',
            title: 'NG',
            icon: '❌',
            accent: 'red',
            value: loading ? 'Loading...' : formatQty(t.ng),
            sub: loading ? '--' : formatPct(t.ngPct),
            hint: 'Defective products',
        },
        {
            id: 'ndf',
            title: 'NDF',
            icon: '🔁',
            accent: 'amber',
            value: loading ? 'Loading...' : formatQty(t.ndf),
            sub: loading ? '--' : formatPct(t.ndfPct),
            hint: 'No defect found',
        },
    ];

    const processBody = loading ? (
        <>
            <div className="kpi-value">Loading...</div>
            <div className="kpi-change">--</div>
        </>
    ) : (
        <div className="asm-process-lines">
            <div className="asm-process-line">
                <span className="asm-process-name">AUD</span>
                <span className="asm-process-value">{formatPct(groups?.aud?.fpy)}</span>
            </div>
            <div className="asm-process-line">
                <span className="asm-process-name">MMI</span>
                <span className="asm-process-value">{formatPct(groups?.mmi?.fpy)}</span>
            </div>
        </div>
    );

    return (
        <div className="asm-card-grid asm-card-grid-4" aria-label="Assembly overview cards">
            {cards.map((card) => (
                <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${card.title} — click for details`}
                    className={`kpi-card asm-card ${card.accent}`}
                    onClick={() => onOpen(card.id)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpen(card.id);
                        }
                    }}
                >
                    <div className={`kpi-icon ${card.accent === 'amber' ? 'amber' : card.accent}`}>
                        <span aria-hidden="true">{card.icon}</span>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">{card.title}</div>
                        <div className="kpi-value">{card.value}</div>
                        <div className="kpi-change">{card.sub}</div>
                        <div className="kpi-period">{card.hint}</div>
                        <div className="asm-card-cta">Click for details ›</div>
                    </div>
                </div>
            ))}
            <div
                role="button"
                tabIndex={0}
                aria-label="PROCESS — click for details"
                className="kpi-card asm-card blue"
                onClick={() => onOpen('process')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpen('process');
                    }
                }}
            >
                <div className="kpi-icon blue">
                    <span aria-hidden="true">⚙️</span>
                </div>
                <div className="kpi-content">
                    <div className="kpi-label">PROCESS</div>
                    {processBody}
                    <div className="kpi-period">AUD / MMI pass rate</div>
                    <div className="asm-card-cta">Click for details ›</div>
                </div>
            </div>
        </div>
    );
}

export default AssemblyCards;

