import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import clsx from 'clsx';

import * as dates from 'utils/dates';
import getTimeSlotMetrics from 'utils/get-time-slot-metrics';
import { isSelected } from 'utils/selection';
import getAppointmentsDayStyled from 'utils/get-appointments-day-styled';

import Selection, { getBoundsForNode, isAppointment } from 'components/shared/selection';
import TimeSlot from '../time-slot';
import Appointment from './appointment';

class DayColumn extends React.Component {
  state = { selecting: false, timeIndicatorPosition: null };

  intervalTriggered = false;

  constructor(...args) {
    super(...args);

    this.slotMetrics = getTimeSlotMetrics(this.props);
  }

  componentDidMount() {
    this.props.selectable && this._selectable();

    if (this.props.isNow) {
      this.setTimeIndicatorPositionUpdateInterval();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable();
    if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();

    this.slotMetrics = this.slotMetrics.update(nextProps);
  }

  componentDidUpdate(prevProps, prevState) {
    const currentDateChanged = !dates.eq(prevProps.currentDate, this.props.currentDate, 'minutes');

    if (prevProps.isNow !== this.props.isNow || currentDateChanged) {
      this.clearTimeIndicatorInterval();

      if (this.props.isNow) {
        const tail =
          !currentDateChanged &&
          dates.eq(prevProps.date, this.props.date, 'minutes') &&
          prevState.timeIndicatorPosition === this.state.timeIndicatorPosition;

        this.setTimeIndicatorPositionUpdateInterval(tail);
      }
    } else if (
      this.props.isNow &&
      (!dates.eq(prevProps.min, this.props.min, 'minutes') ||
        !dates.eq(prevProps.max, this.props.max, 'minutes'))
    ) {
      this.positionTimeIndicator();
    }
  }

  componentWillUnmount() {
    this._teardownSelectable();
    this.clearTimeIndicatorInterval();
  }

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  setTimeIndicatorPositionUpdateInterval(tail = false) {
    if (!this.intervalTriggered && !tail) {
      this.positionTimeIndicator();
    }

    this._timeIndicatorTimeout = window.setTimeout(() => {
      this.intervalTriggered = true;
      this.positionTimeIndicator();
      this.setTimeIndicatorPositionUpdateInterval();
    }, 60000);
  }

  clearTimeIndicatorInterval() {
    this.intervalTriggered = false;
    window.clearTimeout(this._timeIndicatorTimeout);
  }

  positionTimeIndicator() {
    const { min, max, currentDateChanged } = this.props;

    if (currentDateChanged >= min && currentDateChanged <= max) {
      const top = this.slotMetrics.getCurrentTimePosition(currentDateChanged);
      this.intervalTriggered = true;
      this.setState({ timeIndicatorPosition: top });
    } else {
      this.clearTimeIndicatorInterval();
    }
  }

  renderAppointments = () => {
    const {
      appointments,
      rtl,
      selectedAppointment,
      localizer,
      components,
      step,
      timeslots,
    } = this.props;

    const { slotMetrics } = this;
    const { messages } = localizer;

    const styledAppointments = getAppointmentsDayStyled({
      appointments,
      slotMetrics,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
    });

    return styledAppointments.map(({ appointment, style }, idx) => {
      const { end } = appointment;
      const { start } = appointment;
      let format = 'appointmentTimeRangeFormat';
      let label;

      const startsBeforeDay = slotMetrics.startsBeforeDay(start);
      const startsAfterDay = slotMetrics.startsAfterDay(end);

      if (startsBeforeDay) format = 'appointmentTimeRangeEndFormat';
      else if (startsAfterDay) format = 'appointmentTimeRangeStartFormat';

      if (startsBeforeDay && startsAfterDay) label = messages.allDay;
      else label = localizer.format({ start, end }, format);

      const continuesEarlier = startsBeforeDay || slotMetrics.startsBefore(start);
      const continuesLater = startsAfterDay || slotMetrics.startsAfter(end);

      return (
        <Appointment
          style={style}
          appointment={appointment}
          label={label}
          key={`evt_${idx}`}
          rtl={rtl}
          components={components}
          continuesEarlier={continuesEarlier}
          continuesLater={continuesLater}
          selectedAppointment={isSelected(appointment, selectedAppointment)}
          onClick={(e) => this._select(appointment, e)}
          onDoubleClick={(e) => this._doubleClick(appointment, e)}
        />
      );
    });
  };

  _selectable = () => {
    const node = findDOMNode(this);
    const selector = (this._selector = new Selection(() => findDOMNode(this)));

    const maybeSelect = (box) => {
      const { onSelecting } = this.props;
      const current = this.state || {};
      const state = selectionState(box);
      const { startDate: start, endDate: end } = state;

      if (onSelecting) {
        if (
          (dates.eq(current.startDate, start, 'minutes') &&
            dates.eq(current.endDate, end, 'minutes')) ||
          onSelecting({ start, end }) === false
        )
          return;
      }

      if (
        this.state.start !== state.start ||
        this.state.end !== state.end ||
        this.state.selecting !== state.selecting
      ) {
        this.setState(state);
      }
    };

    let selectionState = (point) => {
      let currentSlot = this.slotMetrics.closestSlotFromPoint(point, getBoundsForNode(node));

      if (!this.state.selecting) {
        this._initialSlot = currentSlot;
      }

      let initialSlot = this._initialSlot;
      if (dates.lte(initialSlot, currentSlot)) {
        currentSlot = this.slotMetrics.nextSlot(currentSlot);
      } else if (dates.gt(initialSlot, currentSlot)) {
        initialSlot = this.slotMetrics.nextSlot(initialSlot);
      }

      const selectRange = this.slotMetrics.getRange(
        dates.min(initialSlot, currentSlot),
        dates.max(initialSlot, currentSlot)
      );

      return {
        ...selectRange,
        selecting: true,

        top: `${selectRange.top}%`,
        height: `${selectRange.height}%`,
      };
    };

    const selectorClicksHandler = (box, actionType) => {
      if (!isAppointment(findDOMNode(this), box)) {
        const { startDate, endDate } = selectionState(box);
        this._selectSlot({
          startDate,
          endDate,
          action: actionType,
          box,
        });
      }
      this.setState({ selecting: false });
    };

    selector.on('selecting', maybeSelect);
    selector.on('selectStart', maybeSelect);

    selector.on('beforeSelect', (box) => {
      if (this.props.selectable !== 'ignoreAppointments') return;

      return !isAppointment(findDOMNode(this), box);
    });

    selector.on('click', (box) => selectorClicksHandler(box, 'click'));

    selector.on('doubleClick', (box) => selectorClicksHandler(box, 'doubleClick'));

    selector.on('select', (bounds) => {
      if (this.state.selecting) {
        this._selectSlot({ ...this.state, action: 'select', bounds });
        this.setState({ selecting: false });
      }
    });

    selector.on('reset', () => {
      if (this.state.selecting) {
        this.setState({ selecting: false });
      }
    });
  };

  _teardownSelectable = () => {
    if (!this._selector) return;
    this._selector.teardown();
    this._selector = null;
  };

  _selectSlot = ({ startDate, endDate, action, bounds, box }) => {
    let current = startDate;
    const slots = [];

    while (dates.lte(current, endDate)) {
      slots.push(current);
      current = new Date(+current + this.props.step * 60 * 1000); // using Date ensures not to create an endless loop the day DST begins
    }

    this.props.onSelectSlot({
      slots,
      start: startDate,
      end: endDate,
      action,
      bounds,
      box,
    });
  };

  _select = (args) => {
    this.props.onSelectAppointment(args);
  };

  _doubleClick = (args) => {
    this.props.onDoubleClickAppointment(args);
  };

  render() {
    const {
      max,
      rtl,
      isNow,
      localizer,
      components: { appointmentContainerWrapper: AppointmentContainer, ...components },
    } = this.props;

    const { slotMetrics } = this;
    const { selecting, top, height, startDate, endDate } = this.state;

    const selectDates = { start: startDate, end: endDate };

    return (
      <div
        className={clsx(
          'rbc-day-slot',
          'rbc-time-column',
          isNow && 'rbc-now',
          isNow && 'rbc-today', // WHY
          selecting && 'rbc-slot-selecting'
        )}
      >
        {slotMetrics.groups.map((grp, idx) => (
          <TimeSlot key={idx} group={grp} components={components} />
        ))}
        <AppointmentContainer
          localizer={localizer}
          components={components}
          slotMetrics={slotMetrics}
        >
          <div className={clsx('rbc-appointments-container', rtl && 'rtl')}>
            {this.renderAppointments()}
          </div>
        </AppointmentContainer>

        {selecting && (
          <div className="rbc-slot-selection" style={{ top, height }}>
            <span>{localizer.format(selectDates, 'selectRangeFormat')}</span>
          </div>
        )}
        {isNow && this.intervalTriggered && (
          <div
            className="rbc-current-time-indicator"
            style={{ top: `${this.state.timeIndicatorPosition}%` }}
          />
        )}
      </div>
    );
  }
}

DayColumn.propTypes = {
  appointments: PropTypes.array.isRequired,
  step: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  isNow: PropTypes.bool,

  rtl: PropTypes.bool,

  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  showMultiDayTimes: PropTypes.bool,
  culture: PropTypes.string,
  timeslots: PropTypes.number,

  selectedAppointment: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),
  appointmentOffset: PropTypes.number,

  onSelecting: PropTypes.func,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectAppointment: PropTypes.func.isRequired,
  onDoubleClickAppointment: PropTypes.func.isRequired,

  className: PropTypes.string,
  dragThroughAppointments: PropTypes.bool,
};

DayColumn.defaultProps = {
  dragThroughAppointments: true,
  timeslots: 2,
};

export default DayColumn;
