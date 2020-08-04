import { findIndex } from 'lodash-es';

import * as dates from './dates';

export const endOfRange = (dateRange, unit = 'day') => ({
  first: dateRange[0],
  last: dates.add(dateRange[dateRange.length - 1], 1, unit),
});

export const appointmentSegments = (appointment, range, accessors) => {
  const { first, last } = endOfRange(range);

  const slots = dates.diff(first, last, 'day');
  const start = dates.max(dates.startOf(accessors.start(appointment), 'day'), first);
  const end = dates.min(dates.ceil(accessors.end(appointment), 'day'), last);

  const padding = findIndex(range, (x) => dates.eq(x, start, 'day'));
  let span = dates.diff(start, end, 'day');

  span = Math.min(span, slots);
  span = Math.max(span, 1);

  return {
    appointment,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  };
};

export const segmentsOverlap = (seg, otherSegments) =>
  otherSegments.some((otherSeg) => otherSeg.left <= seg.right && otherSeg.right >= seg.left);

export const appointmentLevels = (rowSegments, limit = Infinity) => {
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

export const inRange = (appointment, start, end, accessors) => {
  const appointmentStart = dates.startOf(accessors.start(appointment), 'day');
  const appointmentEnd = accessors.end(appointment);

  const startsBeforeEnd = dates.lte(appointmentStart, end, 'day');
  // when the appointment is zero duration we need to handle a bit differently
  const endsAfterStart = !dates.eq(appointmentStart, appointmentEnd, 'minutes')
    ? dates.gt(appointmentEnd, start, 'minutes')
    : dates.gte(appointmentEnd, start, 'minutes');

  return startsBeforeEnd && endsAfterStart;
};

export const sortAppointments = (appointmentA, appointmentB, accessors) => {
  const startSort =
    +dates.startOf(accessors.start(appointmentA), 'day') -
    +dates.startOf(accessors.start(appointmentB), 'day');

  const durA = dates.diff(
    accessors.start(appointmentA),
    dates.ceil(accessors.end(appointmentA), 'day'),
    'day'
  );

  const durB = dates.diff(
    accessors.start(appointmentB),
    dates.ceil(accessors.end(appointmentB), 'day'),
    'day'
  );

  return (
    startSort || // sort by start Day first
    Math.max(durB, 1) - Math.max(durA, 1) || // appointments spanning multiple days go first
    !!accessors.allDay(appointmentB) - !!accessors.allDay(appointmentA) || // then allDay single day appointments
    +accessors.start(appointmentA) - +accessors.start(appointmentB)
  ); // then sort by start time
};
