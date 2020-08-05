import { findIndex } from 'lodash-es';

import * as dates from './dates';

export const endOfRange = (dateRange, unit = 'day') => ({
  first: dateRange[0],
  last: dates.add(dateRange[dateRange.length - 1], 1, unit),
});

export const appointmentSegments = (appointment, range) => {
  const { first, last } = endOfRange(range);

  const slots = dates.diff(first, last, 'day');
  const start = dates.max(dates.startOf(appointment.start, 'day'), first);
  const end = dates.min(dates.ceil(appointment.end, 'day'), last);

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
  let segment;
  const levels = [];
  const extra = [];

  for (i = 0; i < rowSegments.length; i += 1) {
    segment = rowSegments[i];

    for (j = 0; j < levels.length; j += 1) if (!segmentsOverlap(segment, levels[j])) break;

    if (j >= limit) {
      extra.push(segment);
    } else {
      (levels[j] || (levels[j] = [])).push(segment);
    }
  }

  for (i = 0; i < levels.length; i += 1) {
    levels[i].sort((a, b) => a.left - b.left);
  }

  return { levels, extra };
};

export const inRange = (appointment, start, end) => {
  const appointmentStart = dates.startOf(appointment.start, 'day');
  const appointmentEnd = appointment.end;

  const startsBeforeEnd = dates.lte(appointmentStart, end, 'day');
  // when the appointment is zero duration we need to handle a bit differently
  const endsAfterStart = !dates.eq(appointmentStart, appointmentEnd, 'minutes')
    ? dates.gt(appointmentEnd, start, 'minutes')
    : dates.gte(appointmentEnd, start, 'minutes');

  return startsBeforeEnd && endsAfterStart;
};

export const sortAppointments = (appointmentA, appointmentB) => {
  const startSort =
    +dates.startOf(appointmentA.start, 'day') - +dates.startOf(appointmentB.start, 'day');

  const durA = dates.diff(appointmentA.start, dates.ceil(appointmentA.end, 'day'), 'day');

  const durB = dates.diff(appointmentB.start, dates.ceil(appointmentB.end, 'day'), 'day');

  return (
    startSort || // sort by start Day first
    Math.max(durB, 1) - Math.max(durA, 1) || // appointments spanning multiple days go first
    !!appointmentB.allDay - !!appointmentA.allDay || // then allDay single day appointments
    +appointmentA.start - +appointmentB.start
  ); // then sort by start time
};
