import { findIndex } from 'lodash-es';

import * as dates from './dates';

export const endOfRange = (dateRange, unit = 'day') => ({
  first: dateRange[0],
  last: dates.add(dateRange[dateRange.length - 1], 1, unit),
});

export const eventSegments = (event, range, accessors) => {
  const { first, last } = endOfRange(range);

  const slots = dates.diff(first, last, 'day');
  const start = dates.max(dates.startOf(accessors.start(event), 'day'), first);
  const end = dates.min(dates.ceil(accessors.end(event), 'day'), last);

  const padding = findIndex(range, (x) => dates.eq(x, start, 'day'));
  let span = dates.diff(start, end, 'day');

  span = Math.min(span, slots);
  span = Math.max(span, 1);

  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  };
};

export const segmentsOverlap = (seg, otherSegments) =>
  otherSegments.some((otherSeg) => otherSeg.left <= seg.right && otherSeg.right >= seg.left);

export const eventLevels = (rowSegments, limit = Infinity) => {
  let i;
  let j;
  let seg;
  const levels = [];
  const extra = [];

  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i];

    for (j = 0; j < levels.length; j++) if (!segmentsOverlap(seg, levels[j])) break;

    if (j >= limit) {
      extra.push(seg);
    } else {
      (levels[j] || (levels[j] = [])).push(seg);
    }
  }

  for (i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left) //eslint-disable-line
  }

  return { levels, extra };
};

export const inRange = (e, start, end, accessors) => {
  const eStart = dates.startOf(accessors.start(e), 'day');
  const eEnd = accessors.end(e);

  const startsBeforeEnd = dates.lte(eStart, end, 'day');
  // when the event is zero duration we need to handle a bit differently
  const endsAfterStart = !dates.eq(eStart, eEnd, 'minutes')
    ? dates.gt(eEnd, start, 'minutes')
    : dates.gte(eEnd, start, 'minutes');

  return startsBeforeEnd && endsAfterStart;
};

export const sortEvents = (evtA, evtB, accessors) => {
  const startSort =
    +dates.startOf(accessors.start(evtA), 'day') - +dates.startOf(accessors.start(evtB), 'day');

  const durA = dates.diff(accessors.start(evtA), dates.ceil(accessors.end(evtA), 'day'), 'day');

  const durB = dates.diff(accessors.start(evtB), dates.ceil(accessors.end(evtB), 'day'), 'day');

  return (
    startSort || // sort by start Day first
    Math.max(durB, 1) - Math.max(durA, 1) || // events spanning multiple days go first
    !!accessors.allDay(evtB) - !!accessors.allDay(evtA) || // then allDay single day events
    +accessors.start(evtA) - +accessors.start(evtB)
  ); // then sort by start time
};
