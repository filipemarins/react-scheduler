import clsx from 'clsx';
import getHeight from 'dom-helpers/height';
import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';

import * as dates from 'utils/dates';
import getDateSlotMetrics from 'utils/get-date-slot-metrics';
import AppointmentRow from './appointment-row';
import AppointmentEndingRow from './appointment-ending-row';
import Cells from './cells';

class ContentRow extends React.Component {
  constructor(...args) {
    super(...args);

    this.slotMetrics = getDateSlotMetrics();
  }

  getRowLimit() {
    const appointmentHeight = getHeight(this.appointmentRow);
    const headingHeight = this.headingRow ? getHeight(this.headingRow) : 0;
    const appointmentSpace = getHeight(findDOMNode(this)) - headingHeight;

    return Math.max(Math.floor(appointmentSpace / appointmentHeight), 1);
  }

  createHeadingRef = (r) => {
    this.headingRow = r;
  };

  createAppointmentRef = (r) => {
    this.appointmentRow = r;
  };

  renderHeadingCell = (date, index) => {
    const { renderHeader, currentDate } = this.props;

    return renderHeader({
      date,
      key: `header_${index}`,
      className: clsx('rbc-date-cell', dates.eq(date, currentDate, 'day') && 'rbc-now'),
    });
  };

  renderDummy = () => {
    const { className, range, renderHeader } = this.props;
    return (
      <div className={className}>
        <div className="rbc-row-content">
          {renderHeader && (
            <div className="rbc-row" ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          <div className="rbc-row" ref={this.createAppointmentRef}>
            <div className="rbc-row-segment">
              <div className="rbc-appointment">
                <div className="rbc-appointment-content">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {
      rtl,
      range,
      className,
      selectedAppointment,
      renderForMeasure,

      components,

      currentDate,
      renderHeader,
      localizer,
      onSelectAppointment,
      onDoubleClick,
      isAllDay,
    } = this.props;

    if (renderForMeasure) return this.renderDummy();

    const metrics = this.slotMetrics(this.props);
    const { levels, extra } = metrics;

    const WeekWrapper = components.weekWrapper;

    const appointmentRowProps = {
      selectedAppointment,
      localizer,
      components,
      onSelectAppointment,
      onDoubleClick,
      slotMetrics: metrics,
    };

    return (
      <div className={className}>
        <Cells range={range} />

        <div className="rbc-row-content">
          {renderHeader && (
            <div className="rbc-row" ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          <WeekWrapper isAllDay={isAllDay} {...appointmentRowProps}>
            {levels.map((segs, idx) => (
              <AppointmentRow key={idx} segments={segs} {...appointmentRowProps} />
            ))}
            {!!extra.length && <AppointmentEndingRow segments={extra} {...appointmentRowProps} />}
          </WeekWrapper>
        </div>
      </div>
    );
  }
}

ContentRow.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  appointments: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,

  rtl: PropTypes.bool,
  renderForMeasure: PropTypes.bool,
  renderHeader: PropTypes.func,

  selectedAppointment: PropTypes.object,

  onSelectAppointment: PropTypes.func,
  onDoubleClick: PropTypes.func,

  isAllDay: PropTypes.bool,

  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  minRows: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired,
};

ContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity,
};

export default ContentRow;
