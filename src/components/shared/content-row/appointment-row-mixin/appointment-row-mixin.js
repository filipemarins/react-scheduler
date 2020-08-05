import React from 'react';
import PropTypes from 'prop-types';

import { isSelected } from 'utils/selection';

import AppointmentCell from './appointment-cell';

/* eslint-disable react/prop-types */
export default {
  propTypes: {
    slotMetrics: PropTypes.object.isRequired,

    selected: PropTypes.object,
    isAllDay: PropTypes.bool,

    localizer: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,

    onSelect: PropTypes.func,
    onDoubleClick: PropTypes.func,
  },

  defaultProps: {
    segments: [],
    selected: {},
  },

  renderAppointment(props, appointment) {
    const {
      selected,
      isAllDay: _,
      onSelect,
      onDoubleClick,
      localizer,
      slotMetrics,
      components,
    } = props;

    const continuesPrior = slotMetrics.continuesPrior(appointment);
    const continuesAfter = slotMetrics.continuesAfter(appointment);

    return (
      <AppointmentCell
        appointment={appointment}
        localizer={localizer}
        components={components}
        onSelect={onSelect}
        onDoubleClick={onDoubleClick}
        continuesPrior={continuesPrior}
        continuesAfter={continuesAfter}
        slotStart={slotMetrics.first}
        slotEnd={slotMetrics.last}
        selected={isSelected(appointment, selected)}
      />
    );
  },

  renderSpan(slots, len, key, content = ' ') {
    const per = `${(Math.abs(len) / slots) * 100}%`;

    return (
      <div
        key={key}
        className="rbc-row-segment"
        // IE10/11 need max-width. flex-basis doesn't respect box-sizing
        style={{ WebkitFlexBasis: per, flexBasis: per, maxWidth: per }}
      >
        {content}
      </div>
    );
  },
};
