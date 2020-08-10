import React, { useContext } from 'react';
import { arrayOf, instanceOf } from 'prop-types';
import clsx from 'clsx';

import { SchedulerContext } from 'utils/scheduler-context';
import * as dates from 'utils/dates';

const Cells = ({ range }) => {
  const {
    currentDate,
    components: { dateCellWrapper: Wrapper },
  } = useContext(SchedulerContext);

  return (
    <div className="rbc-row-bg">
      {range.map((date) => {
        return (
          <Wrapper key={date} value={date} range={range}>
            <div
              className={clsx(
                'rbc-day-bg',
                dates.eq(date, currentDate, 'day') && 'rbc-today',
                currentDate && dates.month(currentDate) !== dates.month(date) && 'rbc-off-range-bg'
              )}
            />
          </Wrapper>
        );
      })}
    </div>
  );
};

Cells.propTypes = {
  range: arrayOf(instanceOf(Date)).isRequired,
};

export default Cells;
