import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import * as animationFrame from 'dom-helpers/animationFrame';
import getWidth from 'dom-helpers/width';
import { findDOMNode } from 'react-dom';

import { DayLayoutAlgorithmPropType } from 'utils/prop-types';
import * as dates from 'utils/dates';
import { notify } from 'utils/helpers';
import { inRange, sortAppointments } from 'utils/appointment-levels';
import DayColumn from './day-column';
import TimeViewHeader from './header';
import TimeScale from './time-scale';

export default class TimeView extends Component {
  constructor(props) {
    super(props);

    this.state = { gutterWidth: undefined, isOverflowing: null };

    this.scrollRef = React.createRef();
    this.contentRef = React.createRef();
    this._scrollRatio = null;
  }

  UNSAFE_componentWillMount() {
    this.calculateScroll();
  }

  componentDidMount() {
    this.checkOverflow();

    if (this.props.width == null) {
      this.measureGutter();
    }

    this.applyScroll();

    window.addEventListener('resize', this.handleResize);
  }

  handleScroll = (e) => {
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  handleResize = () => {
    animationFrame.cancel(this.rafHandle);
    this.rafHandle = animationFrame.request(this.checkOverflow);
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);

    animationFrame.cancel(this.rafHandle);

    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
    }
  }

  componentDidUpdate() {
    if (this.props.width == null) {
      this.measureGutter();
    }

    this.applyScroll();
    // this.checkOverflow()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { range, scrollToTime } = this.props;
    // When paginating, reset scroll
    if (
      !dates.eq(nextProps.range[0], range[0], 'minute') ||
      !dates.eq(nextProps.scrollToTime, scrollToTime, 'minute')
    ) {
      this.calculateScroll(nextProps);
    }
  }

  gutterRef = (ref) => {
    this.gutter = ref && findDOMNode(ref);
  };

  handleSelectAlldayAppointment = (...args) => {
    // cancel any pending selections so only the appointment click goes through.
    this.clearSelection();
    notify(this.props.onSelectAppointment, args);
  };

  handleSelectAllDaySlot = (slots, slotInfo) => {
    const { onSelectSlot } = this.props;
    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
    });
  };

  clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  }

  measureGutter() {
    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
    }
    this.measureGutterAnimationFrameRequest = window.requestAnimationFrame(() => {
      const width = getWidth(this.gutter);

      if (width && this.state.gutterWidth !== width) {
        this.setState({ gutterWidth: width });
      }
    });
  }

  applyScroll() {
    if (this._scrollRatio != null) {
      const content = this.contentRef.current;
      content.scrollTop = content.scrollHeight * this._scrollRatio;
      // Only do this once
      this._scrollRatio = null;
    }
  }

  calculateScroll(props = this.props) {
    const { min, max, scrollToTime } = props;

    const diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day');
    const totalMillis = dates.diff(max, min);

    this._scrollRatio = diffMillis / totalMillis;
  }

  checkOverflow = () => {
    if (this._updatingOverflow) return;

    const content = this.contentRef.current;
    const isOverflowing = content.scrollHeight > content.clientHeight;

    if (this.state.isOverflowing !== isOverflowing) {
      this._updatingOverflow = true;
      this.setState({ isOverflowing }, () => {
        this._updatingOverflow = false;
      });
    }
  };

  renderAppointments(range, appointments, now) {
    const { min, max, components, localizer, dayLayoutAlgorithm } = this.props;

    return range.map((date) => {
      const daysAppointments = appointments.filter((appointment) =>
        dates.inRange(date, appointment.start, appointment.end, 'day')
      );
      return (
        <DayColumn
          {...this.props}
          localizer={localizer}
          min={dates.merge(date, min)}
          max={dates.merge(date, max)}
          components={components}
          isNow={dates.eq(date, now, 'day')}
          key={date}
          date={date}
          appointments={daysAppointments}
          dayLayoutAlgorithm={dayLayoutAlgorithm}
        />
      );
    });
  }

  render() {
    let {
      appointments,
      range,
      width,
      rtl,
      selected,
      getNow,
      components,
      localizer,
      min,
      max,
      showMultiDayTimes,
      longPressThreshold,
    } = this.props;

    width = width || this.state.gutterWidth;

    const start = range[0];
    const end = range[range.length - 1];

    this.slots = range.length;

    const allDayAppointments = [];
    const rangeAppointments = [];

    appointments.forEach((appointment) => {
      if (inRange(appointment, start, end)) {
        const appointmentStart = appointment.start;
        const appointmentEnd = appointment.end;
        if (
          appointment.allDay ||
          (dates.isJustDate(appointmentStart) && dates.isJustDate(appointmentEnd)) ||
          (!showMultiDayTimes && !dates.eq(appointmentStart, appointmentEnd, 'day'))
        ) {
          allDayAppointments.push(appointment);
        } else {
          rangeAppointments.push(appointment);
        }
      }
    });

    allDayAppointments.sort((a, b) => sortAppointments(a, b));

    return (
      <div className={clsx('rbc-time-view')}>
        <TimeViewHeader
          range={range}
          appointments={allDayAppointments}
          width={width}
          rtl={rtl}
          getNow={getNow}
          localizer={localizer}
          selected={selected}
          selectable={this.props.selectable}
          components={components}
          scrollRef={this.scrollRef}
          isOverflowing={this.state.isOverflowing}
          longPressThreshold={longPressThreshold}
          onSelectSlot={this.handleSelectAllDaySlot}
          onSelectAppointment={this.handleSelectAlldayAppointment}
          onDoubleClickAppointment={this.props.onDoubleClickAppointment}
          onDrillDown={this.props.onDrillDown}
          getDrilldownView={this.props.getDrilldownView}
        />
        <div ref={this.contentRef} className="rbc-time-content" onScroll={this.handleScroll}>
          <TimeScale
            date={start}
            ref={this.gutterRef}
            localizer={localizer}
            min={dates.merge(start, min)}
            max={dates.merge(start, max)}
            step={this.props.step}
            getNow={this.props.getNow}
            timeslots={this.props.timeslots}
            components={components}
            className="rbc-time-gutter"
          />
          {this.renderAppointments(range, rangeAppointments, getNow())}
        </div>
      </div>
    );
  }
}

TimeView.propTypes = {
  appointments: PropTypes.array.isRequired,

  step: PropTypes.number,
  timeslots: PropTypes.number,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  showMultiDayTimes: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onSelectAppointment: PropTypes.func,
  onDoubleClickAppointment: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
};

TimeView.defaultProps = {
  step: 30,
  timeslots: 2,
  min: dates.startOf(new Date(), 'day'),
  max: dates.endOf(new Date(), 'day'),
  scrollToTime: dates.startOf(new Date(), 'day'),
};
