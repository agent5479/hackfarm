export interface TideSample {
  time: string;
  height: number;
  type?: 'high' | 'low';
}

/** Collapse a dense NIWA height series into labelled high/low events. */
export function extractExtremesFromSeries(rows: TideSample[]): TideSample[] {
  if (rows.length < 3) {
    return rows.map((r) => ({ ...r, type: r.type ?? 'low' }));
  }

  const out: TideSample[] = [];
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
