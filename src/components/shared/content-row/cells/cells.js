import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';

import * as dates from 'utils/dates';

class Cells extends React.Component {
  render() {
    const {
      range,
      currentDate,
      components: { dateCellWrapper: Wrapper },
    } = this.props;

    return (
      <div className="rbc-row-bg">
        {range.map((date, index) => {
          return (
            <Wrapper key={index} value={date} range={range}>
              <div
                className={clsx(
                  'rbc-day-bg',
                  dates.eq(date, currentDate, 'day') && 'rbc-today',
                  currentDate &&
                    dates.month(currentDate) !== dates.month(date) &&
                    'rbc-off-range-bg'
                )}
              />
            </Wrapper>
          );
        })}
      </div>
    );
  }
}

Cells.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,

  components: PropTypes.object.isRequired,

  container: PropTypes.func,

  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string,
};

export default Cells;
