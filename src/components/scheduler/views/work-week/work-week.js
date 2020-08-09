import React from 'react';
import PropTypes from 'prop-types';

import TimeView from 'components/shared/time-view';
import Week from '../week';

function workWeekRange(date, options) {
  return Week.range(date, options).filter((d) => [6, 0].indexOf(d.getDay()) === -1);
}

class WorkWeek extends React.Component {
  render() {
    const { currentDate, ...props } = this.props;
    const range = workWeekRange(currentDate, this.props);

    return <TimeView {...props} currentDate={currentDate} range={range} appointmentOffset={15} />;
  }
}

WorkWeek.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
};

WorkWeek.defaultProps = TimeView.defaultProps;

WorkWeek.range = workWeekRange;

WorkWeek.navigate = Week.navigate;

WorkWeek.title = (date, { localizer }) => {
  const [start, ...rest] = workWeekRange(date, { localizer });

  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat');
};

export default WorkWeek;
