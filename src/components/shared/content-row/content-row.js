import clsx from 'clsx';
import getHeight from 'dom-helpers/height';
import qsa from 'dom-helpers/querySelectorAll';
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

  handleShowMore = (slot, target) => {
    const { range, onShowMore } = this.props;
    const metrics = this.slotMetrics(this.props);
    const row = qsa(findDOMNode(this), '.rbc-row-bg')[0];

    let cell;
    if (row) cell = row.children[slot - 1];

    const appointments = metrics.getAppointmentsForSlot(slot);
    onShowMore(appointments, range[slot - 1], cell, slot, target);
  };

  createHeadingRef = (r) => {
    this.headingRow = r;
  };

  createAppointmentRef = (r) => {
    this.appointmentRow = r;
  };

  getContainer = () => {
    const { container } = this.props;
    return container ? container() : findDOMNode(this);
  };

  handleSelectSlot = (slot) => {
    const { range, onSelectSlot } = this.props;

    onSelectSlot(range.slice(slot.start, slot.end + 1), slot);
  };

  renderHeadingCell = (date, index) => {
    const { renderHeader, getNow } = this.props;

    return renderHeader({
      date,
      key: `header_${index}`,
      className: clsx('rbc-date-cell', dates.eq(date, getNow(), 'day') && 'rbc-now'),
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
      date,
      rtl,
      range,
      className,
      selected,
      selectable,
      renderForMeasure,

      components,

      getNow,
      renderHeader,
      onSelect,
      localizer,
      onSelectStart,
      onSelectEnd,
      onDoubleClick,
      isAllDay,
    } = this.props;

    if (renderForMeasure) return this.renderDummy();

    const metrics = this.slotMetrics(this.props);
    const { levels, extra } = metrics;

    const WeekWrapper = components.weekWrapper;

    const appointmentRowProps = {
      selected,
      localizer,
      components,
      onSelect,
      onDoubleClick,
      slotMetrics: metrics,
    };

    return (
      <div className={className}>
        <Cells
          date={date}
          getNow={getNow}
          rtl={rtl}
          range={range}
          selectable={selectable}
          container={this.getContainer}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onSelectSlot={this.handleSelectSlot}
          components={components}
        />

        <div className="rbc-row-content">
          {renderHeader && (
            <div className="rbc-row " ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          <WeekWrapper isAllDay={isAllDay} {...appointmentRowProps}>
            {levels.map((segs, idx) => (
              <AppointmentRow key={idx} segments={segs} {...appointmentRowProps} />
            ))}
            {!!extra.length && (
              <AppointmentEndingRow
                segments={extra}
                onShowMore={this.handleShowMore}
                {...appointmentRowProps}
              />
            )}
          </WeekWrapper>
        </div>
      </div>
    );
  }
}

ContentRow.propTypes = {
  date: PropTypes.instanceOf(Date),
  appointments: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,

  rtl: PropTypes.bool,
  renderForMeasure: PropTypes.bool,
  renderHeader: PropTypes.func,

  container: PropTypes.func,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),

  onShowMore: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onDoubleClick: PropTypes.func,

  getNow: PropTypes.func.isRequired,
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
