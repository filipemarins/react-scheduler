import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import clsx from 'clsx';
import * as animationFrame from 'dom-helpers/animationFrame';
import { chunk } from 'lodash-es';

import * as dates from 'utils/dates';
import { navigate } from 'utils/constants';
import { inRange, sortAppointments } from 'utils/appointment-levels';
import ContentRow from 'components/shared/content-row';
import NoopWrapper from 'components/shared/noop-wrapper';

const appointmentsForWeek = (evts, start, end) => evts.filter((e) => inRange(e, start, end));

class Month extends React.Component {
  constructor(...args) {
    super(...args);

    this._bgRows = [];
    this._pendingSelection = [];
    this.slotRowRef = React.createRef();
    this.state = {
      rowLimit: 3,
      needLimitMeasure: true,
    };
  }

  UNSAFE_componentWillReceiveProps({ date }) {
    this.setState({
      needLimitMeasure: !dates.eq(date, this.props.date, 'month'),
    });
  }

  componentDidMount() {
    let running;

    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);

    window.addEventListener(
      'resize',
      (this._resizeListener = () => {
        if (!running) {
          animationFrame.request(() => {
            running = false;
            this.setState({ needLimitMeasure: true }) //eslint-disable-line
          });
        }
      }),
      false
    );
  }

  componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false);
  }

  handleSelectSlot = (range, slotInfo) => {
    this._pendingSelection = this._pendingSelection.concat(range);

    clearTimeout(this._selectTimer);
    this._selectTimer = setTimeout(() => this.selectDates(slotInfo));
  };

  handleHeadingClick = (e, date) => {
    e.preventDefault();
    this.clearSelection();
    this.props.onDayClick(date);
  };

  handleSelectAppointment = (args) => {
    this.clearSelection();
    this.props.onSelectAppointment(args);
  };

  handleDoubleClickAppointment = (args) => {
    this.clearSelection();
    this.props.onDoubleClickAppointment(args);
  };

  readerDateHeading = ({ date, className, ...props }) => {
    const { currentDate, localizer } = this.props;

    const isOffRange = dates.month(date) !== dates.month(currentDate);
    const isCurrent = dates.eq(date, currentDate, 'day');
    const label = localizer.format(date, 'dateFormat');
    const DateHeaderComponent = this.props.components.dateHeader || NoopWrapper;

    return (
      <div
        {...props}
        role="link"
        tabIndex="0"
        className={clsx(className, isOffRange && 'rbc-off-range', isCurrent && 'rbc-current')}
        onClick={(e) => this.handleHeadingClick(e, date)}
        onKeyPress={(e) => this.handleHeadingClick(e, date)}
      >
        <DateHeaderComponent>{label}</DateHeaderComponent>
      </div>
    );
  };

  selectDates(slotInfo) {
    const slots = this._pendingSelection.slice();

    this._pendingSelection = [];

    slots.sort((a, b) => +a - +b);
  }

  clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  }

  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
    });
  }

  renderWeek = (week, weekIdx) => {
    let { appointments, components, currentDate, selectedAppointment, localizer } = this.props;

    const { needLimitMeasure, rowLimit } = this.state;

    appointments = appointmentsForWeek(appointments, week[0], week[week.length - 1]);

    appointments.sort((a, b) => sortAppointments(a, b));

    return (
      <ContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? this.slotRowRef : undefined}
        className="rbc-month-row"
        range={week}
        appointments={appointments}
        maxRows={rowLimit}
        renderHeader={this.readerDateHeading}
        renderForMeasure={needLimitMeasure}
      />
    );
  };

  renderHeaders(row) {
    const { localizer, components } = this.props;
    const first = row[0];
    const last = row[row.length - 1];
    const HeaderComponent = components.header || NoopWrapper;

    return dates.range(first, last, 'day').map((day, idx) => (
      <div key={`header_${idx}`} className="rbc-header">
        <HeaderComponent date={day} localizer={localizer}>
          {localizer.format(day, 'weekdayFormat')}
        </HeaderComponent>
      </div>
    ));
  }

  render() {
    const { currentDate, localizer, className } = this.props;
    const month = dates.visibleDays(currentDate, localizer);
    const weeks = chunk(month, 7);

    return (
      <div className={clsx('rbc-month-view', className)}>
        <div className="rbc-row rbc-month-header">{this.renderHeaders(weeks[0])}</div>
        {weeks.map(this.renderWeek)}
      </div>
    );
  }
}

Month.propTypes = {
  appointments: PropTypes.array.isRequired,

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  currentDate: PropTypes.instanceOf(Date),

  scrollToTime: PropTypes.instanceOf(Date),
  rtl: PropTypes.bool,
  width: PropTypes.number,

  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selectedAppointment: PropTypes.object,

  onSelectSlot: PropTypes.func,
  onSelectAppointment: PropTypes.func,
  onDoubleClickAppointment: PropTypes.func,
  onDayClick: PropTypes.func,
};

Month.range = (date, { localizer }) => {
  const start = dates.firstVisibleDay(date, localizer);
  const end = dates.lastVisibleDay(date, localizer);
  return { start, end };
};

Month.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'month');

    case navigate.NEXT:
      return dates.add(date, 1, 'month');

    default:
      return date;
  }
};

Month.title = (date, { localizer }) => localizer.format(date, 'monthHeaderFormat');

export default Month;
