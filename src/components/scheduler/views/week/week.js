import React from 'react';
import PropTypes from 'prop-types';

import * as dates from 'utils/dates';
import { navigate } from 'utils/constants';
import TimeView from 'components/shared/time-view';

class Week extends React.Component {
  render() {
    const { currentDate, ...props } = this.props;
    const range = Week.range(currentDate, this.props);

    return <TimeView {...props} currentDate={currentDate} range={range} appointmentOffset={15} />;
  }
}

Week.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
};

Week.defaultProps = TimeView.defaultProps;

Week.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week');

    case navigate.NEXT:
      return dates.add(date, 1, 'week');

    default:
      return date;
  }
};

Week.range = (date, { localizer }) => {
  const firstOfWeek = localizer.startOfWeek();
  const start = dates.startOf(date, 'week', firstOfWeek);
  const end = dates.endOf(date, 'week', firstOfWeek);

  return dates.range(start, end);
};

Week.title = (date, { localizer }) => {
  const [start, ...rest] = Week.range(date, { localizer });
  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat');
};

export default Week;
