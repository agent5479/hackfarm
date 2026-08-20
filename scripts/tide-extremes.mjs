/** @typedef {{ time: string, height: number, type?: 'high' | 'low' }} TideRow */

/**
 * @param {unknown} data
 * @returns {TideRow[]}
 */
export function normaliseNiwaRows(data) {
  const payload = /** @type {{ extremes?: unknown[], values?: unknown[] }} */ (data);
  const raw = payload.extremes ?? payload.values ?? [];
  return raw
    .map((row) => {
      const v = /** @type {{ time?: string, date?: string, value?: number, height?: number, type?: string }} */ (row);
      const time = v.time || v.date;
      if (!time) return null;
      const height = Number(v.value ?? v.height ?? 0);
      let type = undefined;
      if (v.type) {
        type = String(v.type).toLowerCase().includes('high') ? 'high' : 'low';
      }
      return { time, height, type };
    })
    .filter(Boolean);
}

/**
 * Collapse a dense height series (e.g. 10-minute interval) into high/low events.
 * @param {TideRow[]} rows
 * @returns {TideRow[]}
 */
export function extractExtremesFromSeries(rows) {
  if (rows.length < 3) {
    return rows.map((r) => ({ ...r, type: r.type ?? 'low' }));
  }

  /** @type {TideRow[]} */
  const out = [];
  let i = 1;

  while (i < rows.length - 1) {
    let j = i;
    while (j < rows.length - 1 && rows[j].height === rows[j + 1].height) j += 1;

    const height = rows[i].height;
    const prev = rows[i - 1].height;
    const next = rows[Math.min(j + 1, rows.length - 1)].height;
    const isHigh = height > prev && height >= next;
    const isLow = height < prev && height <= next;

    if (isHigh || isLow) {
      const mid = Math.floor((i + j) / 2);
      out.push({
        time: rows[mid].time,
        height: rows[mid].height,
        type: isHigh ? 'high' : 'low',
      });
    }

    i = j + 1;
  }

  return out;
}

/**
 * @param {TideRow[]} rows
 * @returns {TideRow[]}
 */
export function labelSparseExtremes(rows) {
  return rows.map((r, i) => {
    if (r.type) return r;
    const prev = rows[i - 1]?.height ?? r.height;
    const next = rows[i + 1]?.height ?? r.height;
    const type = r.height >= prev && r.height >= next ? 'high' : 'low';
    return { ...r, type };
  });
}

/**
 * @param {unknown} data
 * @param {number} days
 * @returns {{ extremes: TideRow[], source: string }}
 */
export function parseNiwaExtremes(data, days) {
  const rows = normaliseNiwaRows(data);
  if (!rows.length) return { extremes: [], source: 'empty' };

  const allTyped = rows.every((r) => r.type);
  if (allTyped) {
    return { extremes: rows, source: 'niwa-extremes' };
  }

  const denseThreshold = days * 8;
  if (rows.length > denseThreshold) {
    return {
      extremes: extractExtremesFromSeries(rows),
      source: 'niwa-series-derived',
    };
  }

  return { extremes: labelSparseExtremes(rows), source: 'niwa-sparse' };
}
