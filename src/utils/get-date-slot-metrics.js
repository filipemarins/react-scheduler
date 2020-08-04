import memoize from 'memoize-one';
import * as dates from './dates';
import { appointmentSegments, endOfRange, appointmentLevels } from './appointment-levels';

const isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;

const isEqual = (a, b) => a[0].range === b[0].range && a[0].appointments === b[0].appointments;

const getDateSlotMetrics = () => {
  return memoize((options) => {
    const { range, appointments, maxRows, minRows, accessors } = options;
    const { first, last } = endOfRange(range);

    const segments = appointments.map((evt) => appointmentSegments(evt, range, accessors));

    const { levels, extra } = appointmentLevels(segments, Math.max(maxRows - 1, 1));
    while (levels.length < minRows) levels.push([]);

    return {
      first,
      last,

      levels,
      extra,
      range,
      slots: range.length,

      clone(args) {
        const metrics = getDateSlotMetrics();
        return metrics({ ...options, ...args });
      },

      getDateForSlot(slotNumber) {
        return range[slotNumber];
      },

      getSlotForDate(date) {
        return range.find((r) => dates.eq(r, date, 'day'));
      },

      getAppointmentsForSlot(slot) {
        return segments
          .filter((segment) => isSegmentInSlot(segment, slot))
          .map((segment) => segment.appointment);
      },

      continuesPrior(appointment) {
        return dates.lt(accessors.start(appointment), first, 'day');
      },

      continuesAfter(appointment) {
        const appointmentEnd = accessors.end(appointment);
        const singleDayDuration = dates.eq(accessors.start(appointment), appointmentEnd, 'minutes');

        return singleDayDuration
          ? dates.gte(appointmentEnd, last, 'minutes')
          : dates.gt(appointmentEnd, last, 'minutes');
      },
    };
  }, isEqual);
};

export default getDateSlotMetrics;
