import React, { Fragment } from 'react';
import { arrayOf, shape } from 'prop-types';

import AppointmentCell from './appointment-cell';

const AppointmentRow = ({ segments, slotMetrics }) => {
  let lastEnd = 1;
  return (
    <div className="rbc-row">
      {segments.map(({ appointment, left, right, span }, index) => {
        const key = `_lvl_${index}`;
        const gap = left - lastEnd;

        lastEnd = right + 1;

        const gapPer = `${(Math.abs(gap) / slotMetrics.slots) * 100}%`;
        const spanPer = `${(Math.abs(span) / slotMetrics.slots) * 100}%`;

        const continuesPrior = slotMetrics.continuesPrior(appointment);
        const continuesAfter = slotMetrics.continuesAfter(appointment);

        return (
          <Fragment key={key}>
            {!!gap && (
              <div
                className="rbc-row-segment"
                style={{ WebkitFlexBasis: gapPer, flexBasis: gapPer, maxWidth: gapPer }}
              />
            )}
            <div
              className="rbc-row-segment"
              style={{ WebkitFlexBasis: spanPer, flexBasis: spanPer, maxWidth: spanPer }}
            >
              <AppointmentCell
                appointment={appointment}
                continuesPrior={continuesPrior}
                continuesAfter={continuesAfter}
                slotStart={slotMetrics.first}
                slotEnd={slotMetrics.last}
              />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

AppointmentRow.propTypes = {
  segments: arrayOf(shape({})),
  slotMetrics: shape({}).isRequired,
};

AppointmentRow.defaultProps = {
  segments: [],
};

export default AppointmentRow;
