import getAppointmentsDayStyled from './get-appointments-day-styled';
import getTimeSlotMetrics from './get-time-slot-metrics';
import * as dates from './dates';

describe('getAppointmentsDayStyled', () => {
  const d = (...args) => new Date(2015, 3, 1, ...args);
  const min = dates.startOf(d(), 'day');
  const max = dates.endOf(d(), 'day');
  const slotMetrics = getTimeSlotMetrics({ min, max, step: 30 });

  describe('matrix', () => {
    function compare(title, appointments, expectedResults) {
      it(title, () => {
        const styledAppointments = getAppointmentsDayStyled({
          appointments,
          slotMetrics,
        });
        const results = styledAppointments.map((result) => ({
          width: Math.floor(result.style.width),
          xOffset: Math.floor(result.style.xOffset),
        }));
        expect(results).toEqual(expectedResults);
      });
    }

    const toCheck = [
      ['single appointment', [{ start: d(11), end: d(12) }], [{ width: 100, xOffset: 0 }]],
      [
        'two consecutive appointments',
        [
          { start: d(11), end: d(11, 10) },
          { start: d(11, 10), end: d(11, 20) },
        ],
        [
          { width: 100, xOffset: 0 },
          { width: 100, xOffset: 0 },
        ],
      ],
      [
        'two consecutive appointments too close together',
        [
          { start: d(11), end: d(11, 5) },
          { start: d(11, 5), end: d(11, 10) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'two overlapping appointments',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'three overlapping appointments',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
          { start: d(11), end: d(12) },
        ],
        [
          { width: 56, xOffset: 0 },
          { width: 56, xOffset: 33 },
          { width: 33, xOffset: 66 },
        ],
      ],
      [
        'one big appointment overlapping with two consecutive appointments',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(11, 30) },
          { start: d(11, 30), end: d(12) },
        ],
        [
          { width: 85, xOffset: 0 },
          { width: 50, xOffset: 50 },
          { width: 50, xOffset: 50 },
        ],
      ],
      [
        'one big appointment overlapping with two consecutive appointments starting too close together',
        [
          { start: d(11), end: d(12) },
          { start: d(11), end: d(11, 5) },
          { start: d(11, 5), end: d(11, 10) },
        ],
        [
          { width: 56, xOffset: 0 },
          { width: 56, xOffset: 33 },
          { width: 33, xOffset: 66 },
        ],
      ],
    ];
    toCheck.forEach((args) => compare(...args));
  });
});
