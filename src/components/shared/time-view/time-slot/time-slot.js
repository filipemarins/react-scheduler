import React, { Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import NoopWrapper from 'components/shared/noop-wrapper';

export default class TimeSlot extends Component {
  render() {
    const {
      renderSlot,
      group,
      components: { timeSlotWrapper: Wrapper = NoopWrapper } = {},
    } = this.props;

    return (
      <div className="rbc-timeslot-group">
        {group.map((value, idx) => {
          return (
            <Wrapper key={idx} value={value}>
              <div className={clsx('rbc-time-slot')}>{renderSlot && renderSlot(value, idx)}</div>
            </Wrapper>
          );
        })}
      </div>
    );
  }
}

TimeSlot.propTypes = {
  renderSlot: PropTypes.func,
  group: PropTypes.array.isRequired,
  components: PropTypes.object,
};
