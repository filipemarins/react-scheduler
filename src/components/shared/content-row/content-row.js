import React, { useContext } from 'react';
import { arrayOf, number, instanceOf, shape, string, bool, func } from 'prop-types';
import clsx from 'clsx';

import { SchedulerContext } from 'utils/scheduler-context';
import * as dates from 'utils/dates';
import getDateSlotMetrics from 'utils/get-date-slot-metrics';
import AppointmentRow from './appointment-row';
import Cells from './cells';

const ContentRow = ({
  range,
  className,
  renderForMeasure,
  renderHeader,
  isAllDay,
  maxRows,
  minRows,
  appointments,
}) => {
  const { currentDate, components } = useContext(SchedulerContext);

  const metrics = getDateSlotMetrics()({ range, appointments, maxRows, minRows });
  const { levels } = metrics;

  const WeekWrapper = components.weekWrapper;

  return renderForMeasure ? (
    <div className={className}>
      <div className="rbc-row-content">
        {renderHeader && (
          <div className="rbc-row">
            {range.map((date, index) =>
              renderHeader({
                date,
                key: `header_${index}`,
                className: clsx('rbc-date-cell', dates.eq(date, currentDate, 'day') && 'rbc-now'),
              })
            )}
          </div>
        )}
        <div className="rbc-row">
          <div className="rbc-row-segment">
            <div className="rbc-appointment">
              <div className="rbc-appointment-content">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={className}>
      <Cells range={range} />
      <div className="rbc-row-content">
        {renderHeader && (
          <div className="rbc-row">
            {range.map((date, index) =>
              renderHeader({
                date,
                key: `header_${index}`,
                className: clsx('rbc-date-cell', dates.eq(date, currentDate, 'day') && 'rbc-now'),
              })
            )}
          </div>
        )}
        <WeekWrapper isAllDay={isAllDay} slotMetrics={metrics}>
          {levels.map((segs, idx) => (
            <AppointmentRow key={idx} segments={segs} slotMetrics={metrics} />
          ))}
        </WeekWrapper>
      </div>
    </div>
  );
};

ContentRow.propTypes = {
  appointments: arrayOf(
    shape({
      end: instanceOf(Date),
      start: instanceOf(Date),
    })
  ).isRequired,
  className: string.isRequired,
  isAllDay: bool,
  maxRows: number,
  minRows: number,
  range: arrayOf(instanceOf(Date)).isRequired,
  renderForMeasure: bool,
  renderHeader: func,
};

ContentRow.defaultProps = {
  isAllDay: false,
  maxRows: Infinity,
  minRows: 0,
  renderForMeasure: false,
  renderHeader: null,
};

export default ContentRow;
