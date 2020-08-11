import PropTypes from 'prop-types';
import React from 'react';
import { range } from 'lodash-es';

import { appointmentLevels } from 'utils/appointment-levels';

import AppointmentRowMixin from '../appointment-row-mixin';

const isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;
const appointmentsInSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).length;

class AppointmentEndingRow extends React.Component {
  render() {
    const {
      segments,
      slotMetrics: { slots },
    } = this.props;
    const rowSegments = appointmentLevels(segments).levels[0];

    let current = 1;
    let lastEnd = 1;
    const row = [];

    while (current <= slots) {
      const key = `_lvl_${current}`;

      const { appointment, left, right, span } =
        rowSegments.filter(seg => isSegmentInSlot(seg, current))[0] || {} //eslint-disable-line

      if (!appointment) {
        current++;
        continue;
      }

      const gap = Math.max(0, left - lastEnd);

      if (this.canRenderSlotAppointment(left, span)) {
        const content = AppointmentRowMixin.renderAppointment(this.props, appointment);

        if (gap) {
          row.push(AppointmentRowMixin.renderSpan(slots, gap, `${key}_gap`));
        }

        row.push(AppointmentRowMixin.renderSpan(slots, span, key, content));

        lastEnd = current = right + 1;
      } else {
        if (gap) {
          row.push(AppointmentRowMixin.renderSpan(slots, gap, `${key}_gap`));
        }

        row.push(
          AppointmentRowMixin.renderSpan(slots, 1, key, this.renderShowMore(segments, current))
        );
        lastEnd = current += 1;
      }
    }

    return <div className="rbc-row">{row}</div>;
  }

  canRenderSlotAppointment(slot, span) {
    const { segments } = this.props;

    return range(slot, slot + span).every((s) => {
      const count = appointmentsInSlot(segments, s);

      return count === 1;
    });
  }

  renderShowMore(segments, slot) {
    const { localizer } = this.props;
    const count = appointmentsInSlot(segments, slot);

    return count ? localizer.messages.showMore(count) : false;
  }
}

AppointmentEndingRow.propTypes = {
  segments: PropTypes.array,
  slots: PropTypes.number,
  ...AppointmentRowMixin.propTypes,
};

AppointmentEndingRow.defaultProps = {
  ...AppointmentRowMixin.defaultProps,
};

export default AppointmentEndingRow;
