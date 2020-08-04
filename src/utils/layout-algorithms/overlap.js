import { sortBy } from 'lodash-es';

class Appointment {
  constructor(data, { accessors, slotMetrics }) {
    const { start, startDate, end, endDate, top, height } = slotMetrics.getRange(
      accessors.start(data),
      accessors.end(data)
    );

    this.start = start;
    this.end = end;
    this.startMs = +startDate;
    this.endMs = +endDate;
    this.top = top;
    this.height = height;
    this.data = data;
  }

  /**
   * The appointment's width without any overlap.
   */
  get _width() {
    // The container appointment's width is determined by the maximum number of
    // appointments in any of its rows.
    if (this.rows) {
      const columns =
        this.rows.reduce(
          (max, row) => Math.max(max, row.leaves.length + 1), // add itself
          0
        ) + 1; // add the container

      return 100 / columns;
    }

    const availableWidth = 100 - this.container._width;

    // The row appointment's width is the space left by the container, divided
    // among itself and its leaves.
    if (this.leaves) {
      return availableWidth / (this.leaves.length + 1);
    }

    // The leaf appointment's width is determined by its row's width
    return this.row._width;
  }

  /**
   * The appointment's calculated width, possibly with extra width added for
   * overlapping effect.
   */
  get width() {
    const noOverlap = this._width;
    const overlap = Math.min(100, this._width * 1.7);

    // Containers can always grow.
    if (this.rows) {
      return overlap;
    }

    // Rows can grow if they have leaves.
    if (this.leaves) {
      return this.leaves.length > 0 ? overlap : noOverlap;
    }

    // Leaves can grow unless they're the last item in a row.
    const { leaves } = this.row;
    const index = leaves.indexOf(this);
    return index === leaves.length - 1 ? noOverlap : overlap;
  }

  get xOffset() {
    // Containers have no offset.
    if (this.rows) return 0;

    // Rows always start where their container ends.
    if (this.leaves) return this.container._width;

    // Leaves are spread out evenly on the space left by its row.
    const { leaves, xOffset, _width } = this.row;
    const index = leaves.indexOf(this) + 1;
    return xOffset + index * _width;
  }
}

/**
 * Return true if appointment a and b is considered to be on the same row.
 */
function onSameRow(a, b, minimumStartDifference) {
  return (
    // Occupies the same start slot.
    Math.abs(b.start - a.start) < minimumStartDifference ||
    // A's start slot overlaps with b's end slot.
    (b.start > a.start && b.start < a.end)
  );
}

function sortByRender(appointments) {
  const sortedByTime = sortBy(appointments, ['startMs', (e) => -e.endMs]);

  const sorted = [];
  while (sortedByTime.length > 0) {
    const appointment = sortedByTime.shift();
    sorted.push(appointment);

    for (let i = 0; i < sortedByTime.length; i++) {
      const test = sortedByTime[i];

      // Still inside this appointment, look for next.
      if (appointment.endMs > test.startMs) continue;

      // We've found the first appointment of the next appointment group.
      // If that appointment is not right next to our current appointment, we have to
      // move it here.
      if (i > 0) {
        const appointment = sortedByTime.splice(i, 1)[0];
        sorted.push(appointment);
      }

      // We've already found the next appointment group, so stop looking.
      break;
    }
  }

  return sorted;
}

export default function getStyledAppointments({
  appointments,
  minimumStartDifference,
  slotMetrics,
  accessors,
}) {
  // Create proxy appointments and order them so that we don't have
  // to fiddle with z-indexes.
  const proxies = appointments.map(
    (appointment) => new Appointment(appointment, { slotMetrics, accessors })
  );
  const appointmentsInRenderOrder = sortByRender(proxies);

  // Group overlapping appointments, while keeping order.
  // Every appointment is always one of: container, row or leaf.
  // Containers can contain rows, and rows can contain leaves.
  const containerAppointments = [];
  for (let i = 0; i < appointmentsInRenderOrder.length; i++) {
    const appointment = appointmentsInRenderOrder[i];

    // Check if this appointment can go into a container appointment.
    const container = containerAppointments.find(
      (c) =>
        c.end > appointment.start || Math.abs(appointment.start - c.start) < minimumStartDifference
    );

    // Couldn't find a container — that means this appointment is a container.
    if (!container) {
      appointment.rows = [];
      containerAppointments.push(appointment);
      continue;
    }

    // Found a container for the appointment.
    appointment.container = container;

    // Check if the appointment can be placed in an existing row.
    // Start looking from behind.
    let row = null;
    for (let j = container.rows.length - 1; !row && j >= 0; j--) {
      if (onSameRow(container.rows[j], appointment, minimumStartDifference)) {
        row = container.rows[j];
      }
    }

    if (row) {
      // Found a row, so add it.
      row.leaves.push(appointment);
      appointment.row = row;
    } else {
      // Couldn't find a row – that means this appointment is a row.
      appointment.leaves = [];
      container.rows.push(appointment);
    }
  }

  // Return the original appointments, along with their styles.
  return appointmentsInRenderOrder.map((appointment) => ({
    appointment: appointment.data,
    style: {
      top: appointment.top,
      height: appointment.height,
      width: appointment.width,
      xOffset: Math.max(0, appointment.xOffset),
    },
  }));
}
