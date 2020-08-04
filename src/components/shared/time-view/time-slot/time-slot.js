import React, { Component } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import NoopWrapper from 'components/shared/noop-wrapper';

export default class TimeSlot extends Component {
  render() {
    const {
      renderSlot,
      group,
      getters,
      components: { timeSlotWrapper: Wrapper = NoopWrapper } = {},
    } = this.props;

    const groupProps = getters ? getters.slotGroupProp() : {};
    return (
      <div className="rbc-timeslot-group" {...groupProps}>
        {group.map((value, idx) => {
          const slotProps = getters ? getters.slotProp(value) : {};
          return (
            <Wrapper key={idx} value={value}>
              <div {...slotProps} className={clsx('rbc-time-slot', slotProps.className)}>
                {renderSlot && renderSlot(value, idx)}
              </div>
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
  getters: PropTypes.object,
};
