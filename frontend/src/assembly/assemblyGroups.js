/**
 * Shared grouping helpers for the Assembly Dashboard redesign.
 *
 * Reuses ONLY fields already present on the existing /api/assembly/fpy
 * (T-MOM) records. No new API, no new fetch, no hardcoded production values.
 *
 * AUD / MMI are process families. A record belongs to a family when its
 * existing text fields (processName / projectName / processSection) contain
 * that token (case-insensitive). If the current data window has no such
 * records the group is empty and the UI shows "--" / empty states.
 */

const numOf = (item, ...keys) => {
    for (const k of keys) {
        const n = Number(item?.[k]);
        if (Number.isFinite(n)) return n;
    }
    return 0;
};

const textOf = (item, ...keys) => {
    for (const k of keys) {
        const v = item?.[k];
        if (v !== null && v !== undefined && String(v).trim() !== '') return String(v);
    }
    return '';
};

export const startsOf = (r) => numOf(r, 'productionStarts', 'numberOfProductionStarts');
export const goodOf = (r) => numOf(r, 'goodProducts', 'numberOfGoodProducts');
export const ngOf = (r) => numOf(r, 'defects', 'numberOfDefects');
export const ndfOf = (r) => numOf(r, 'falseDetections', 'numberOfFalseDetections');

function familyHaystack(record) {
    return [
        textOf(record, 'processName'),
        textOf(record, 'projectName'),
        textOf(record, 'processSection', 'processGroup'),
    ].join(' ').toLowerCase();
}

export const isAudRecord = (record) => familyHaystack(record).includes('aud');
export const isMmiRecord = (record) => familyHaystack(record).includes('mmi');

/** Summarise any record array with the SAME math as the dashboard totals. */
export function summarize(records) {
    const list = Array.isArray(records) ? records : [];
    let input = 0;
    let good = 0;
    let ng = 0;
    let ndf = 0;
    list.forEach((r) => {
        input += startsOf(r);
        good += goodOf(r);
        ng += ngOf(r);
        ndf += ndfOf(r);
    });
    const pct = (part) => (input > 0 ? Number(((part / input) * 100).toFixed(2)) : null);
    return {
        input,
        good,
        ng,
        ndf,
        goodPct: pct(good),
        ngPct: pct(ng),
        ndfPct: pct(ndf),
        fpy: pct(good),
        recordCount: list.length,
    };
}

export const filterAudRecords = (records) => (Array.isArray(records) ? records.filter(isAudRecord) : []);
export const filterMmiRecords = (records) => (Array.isArray(records) ? records.filter(isMmiRecord) : []);

/** Build both process-family summaries from ONE record array. */
export function summarizeGroups(records) {
    const audRecords = filterAudRecords(records);
    const mmiRecords = filterMmiRecords(records);
    return {
        aud: summarize(audRecords),
        mmi: summarize(mmiRecords),
        audRecords,
        mmiRecords,
    };
}
