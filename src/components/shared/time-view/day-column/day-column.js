import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';

import * as dates from 'utils/dates';
import getTimeSlotMetrics from 'utils/get-time-slot-metrics';
import { isSelected } from 'utils/selection';
import getAppointmentsDayStyled from 'utils/get-appointments-day-styled';

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
    if (this.props.isNow) {
      this.setTimeIndicatorPositionUpdateInterval();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    const { min, max, currentDate } = this.props;

    if (currentDate >= min && currentDate <= max) {
      const top = this.slotMetrics.getCurrentTimePosition(currentDate);
      this.intervalTriggered = true;
      this.setState({ timeIndicatorPosition: top });
    } else {
      this.clearTimeIndicatorInterval();
    }
  }

  renderAppointments = () => {
    const { appointments, rtl, selectedAppointment, localizer, components } = this.props;

    const { slotMetrics } = this;
    const { messages } = localizer;

    const styledAppointments = getAppointmentsDayStyled({
      appointments,
      slotMetrics,
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
  date: PropTypes.instanceOf(Date).isRequired,
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  isNow: PropTypes.bool,

  rtl: PropTypes.bool,

  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  showMultiDayTimes: PropTypes.bool,

  selectedAppointment: PropTypes.object,
  appointmentOffset: PropTypes.number,

  onSelectAppointment: PropTypes.func.isRequired,
  onDoubleClickAppointment: PropTypes.func.isRequired,

  className: PropTypes.string,
};

DayColumn.defaultProps = {};

export default DayColumn;
