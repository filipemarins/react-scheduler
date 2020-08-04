import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import AppointmentRowMixin from '../appointment-row-mixin';

class AppointmentRow extends React.Component {
  render() {
    const {
      segments,
      slotMetrics: { slots },
      className,
    } = this.props;

    let lastEnd = 1;

    return (
      <div className={clsx(className, 'rbc-row')}>
        {segments.reduce((row, { appointment, left, right, span }, li) => {
          const key = `_lvl_${li}`;
          const gap = left - lastEnd;

          const content = AppointmentRowMixin.renderAppointment(this.props, appointment);

          if (gap) row.push(AppointmentRowMixin.renderSpan(slots, gap, `${key}_gap`));

          row.push(AppointmentRowMixin.renderSpan(slots, span, key, content));

          lastEnd = right + 1;

          return row;
        }, [])}
      </div>
    );
  }
}

AppointmentRow.propTypes = {
  segments: PropTypes.array,
  ...AppointmentRowMixin.propTypes,
};

AppointmentRow.defaultProps = {
  ...AppointmentRowMixin.defaultProps,
};

export default AppointmentRow;
