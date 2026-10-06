/* Pure display metrics for real follower growth; this never changes KPI goals. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GrowthModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const count = value => finite(value) && Number.isSafeInteger(value) && value >= 0;
  const validDay = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const stamp = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value;
  };
  const shiftDay = (value, days) => new Date(Date.parse(value + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);

  function describe(channel, maxPositiveDaily) {
    const c = channel && typeof channel === 'object' ? channel : {};
    const monthly = c.monthly === true || (typeof c.period === 'string' && /월/.test(c.period));
    const hasCurrent = count(c.current);
    const daily = !monthly && c.period === '전일' && validDay(c.dataDate);
    const delta = finite(c.delta) ? c.delta : null;
    let mode = monthly ? 'monthly' : 'unknown';
    if (daily && hasCurrent && !c.stale && delta !== null) {
      mode = delta > 0 ? 'growth' : delta < 0 ? 'decline' : 'flat';
    }
    // A common daily maximum lets every card use the same honest speed scale.
    const ratio = mode === 'growth' && finite(maxPositiveDaily) && maxPositiveDaily > 0
      ? Math.max(0, Math.min(1, delta / maxPositiveDaily)) : 0;
    const result = {
      mode,
      duration: mode === 'growth' ? 6 - 3 * ratio : null,
      nextPercent: null,
      nextTarget: null,
      nextRemaining: null,
      projectedDays: null,
      average7: daily && finite(c.dailyAvg7) ? c.dailyAvg7 : null,
      change7: null,
      streak: null,
      surplus: null
    };

    if (hasCurrent && count(c.goal) && count(c.baseline) && c.goal > c.baseline) {
      if (c.current >= c.goal) {
        result.surplus = c.current - c.goal;
      } else {
        // Compare integer follower milestones directly, avoiding percent-rounding errors.
        for (let step = 1; step <= 10; step++) {
          const target = Math.min(c.goal, Math.ceil(c.baseline + (c.goal - c.baseline) * step / 10));
          if (target > c.current) {
            result.nextPercent = step * 10;
            result.nextTarget = target;
            result.nextRemaining = target - c.current;
            break;
          }
        }
        if (daily && !c.stale && result.nextRemaining !== null && result.average7 > 0) {
          const days = Math.ceil(result.nextRemaining / result.average7);
          result.projectedDays = Number.isFinite(days) ? days : null;
        }
      }
    }

    if (daily && hasCurrent) {
      const values = new Map();
      for (const point of Array.isArray(c.history) ? c.history : []) {
        if (point && validDay(point.date) && point.date <= c.dataDate && count(point.value)) {
          values.set(point.date, point.value);
        }
      }
      // The latest source reading wins over the first history reading of today.
      values.set(c.dataDate, c.current);
      const weekAgo = shiftDay(c.dataDate, -7);
      if (values.has(weekAgo)) result.change7 = c.current - values.get(weekAgo);
      let cursor = c.dataDate;
      if (values.has(shiftDay(cursor, -1))) {
        result.streak = 0;
        while (values.has(cursor) && values.has(shiftDay(cursor, -1)) && values.get(cursor) > values.get(shiftDay(cursor, -1))) {
          result.streak++;
          cursor = shiftDay(cursor, -1);
        }
      }
    }
    return result;
  }
  return {describe};
});
