import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import getTimeSlotMetrics from 'utils/get-time-slot-metrics';
import TimeSlot from '../time-slot';

export default class TimeGutter extends Component {
  constructor(...args) {
    super(...args);

    const { min, max, timeslots, step } = this.props;
    this.slotMetrics = getTimeSlotMetrics({
      min,
      max,
      timeslots,
      step,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { min, max, timeslots, step } = nextProps;
    this.slotMetrics = this.slotMetrics.update({ min, max, timeslots, step });
  }

  renderSlot = (value, idx) => {
    if (idx !== 0) return null;
    const { localizer, currentDate } = this.props;

    const isNow = this.slotMetrics.dateIsInGroup(currentDate, idx);
    return (
      <span className={clsx('rbc-label', isNow && 'rbc-now')}>
        {localizer.format(value, 'timeGutterFormat')}
      </span>
    );
  };

  render() {
    const { components } = this.props;

    return (
      <div className="rbc-time-gutter rbc-time-column">
        {this.slotMetrics.groups.map((grp, idx) => {
          return (
            <TimeSlot key={idx} group={grp} components={components} renderSlot={this.renderSlot} />
          );
        })}
      </div>
    );
  }
}

TimeGutter.propTypes = {
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  timeslots: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,

  currentDate: PropTypes.instanceOf(Date).isRequired,
  components: PropTypes.object.isRequired,

  localizer: PropTypes.object.isRequired,
};
