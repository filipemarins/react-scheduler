import PropTypes from 'prop-types';
import React from 'react';

import * as dates from 'utils/dates';
import { navigate } from 'utils/constants';
import TimeView from 'components/shared/time-view';

class Day extends React.Component {
  render() {
    const { currentDate, ...props } = this.props;
    const range = Day.range(currentDate);

    return <TimeView {...props} currentDate={currentDate} range={range} appointmentOffset={10} />;
  }
}

Day.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
};

Day.range = (date) => {
  return [dates.startOf(date, 'day')];
};

Day.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day');

    case navigate.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};

Day.title = (date, { localizer }) => localizer.format(date, 'dayHeaderFormat');

export default Day;
