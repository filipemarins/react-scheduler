import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import clsx from 'clsx';
import * as animationFrame from 'dom-helpers/animationFrame';
import { chunk } from 'lodash-es';

import * as dates from 'utils/dates';
import { navigate, views } from 'utils/constants';
import { notify } from 'utils/helpers';
import { inRange, sortAppointments } from 'utils/appointment-levels';
import ContentRow from 'components/shared/content-row';
import NoopWrapper from 'components/shared/noop-wrapper';

const appointmentsForWeek = (evts, start, end, accessors) =>
  evts.filter((e) => inRange(e, start, end, accessors));

class Month extends React.Component {
  constructor(...args) {
    super(...args);

    this._bgRows = [];
    this._pendingSelection = [];
    this.slotRowRef = React.createRef();
    this.state = {
      rowLimit: 5,
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

  getContainer = () => {
    return findDOMNode(this);
  };

  handleSelectSlot = (range, slotInfo) => {
    this._pendingSelection = this._pendingSelection.concat(range);

    clearTimeout(this._selectTimer);
    this._selectTimer = setTimeout(() => this.selectDates(slotInfo));
  };

  handleHeadingClick = (date, view, e) => {
    e.preventDefault();
    this.clearSelection();
    notify(this.props.onDrillDown, [date, view]);
  };

  handleSelectAppointment = (...args) => {
    this.clearSelection();
    notify(this.props.onSelectAppointment, args);
  };

  handleDoubleClickAppointment = (...args) => {
    this.clearSelection();
    notify(this.props.onDoubleClickAppointment, args);
  };

  handleShowMore = (appointments, date, cell, slot) => {
    const { onDrillDown, onShowMore, getDrilldownView } = this.props;
    // cancel any pending selections so only the appointment click goes through.
    this.clearSelection();

    notify(onDrillDown, [date, getDrilldownView(date) || views.DAY]);

    notify(onShowMore, [appointments, date, slot]);
  };

  readerDateHeading = ({ date, className, ...props }) => {
    const { date: currentDate, getDrilldownView, localizer } = this.props;

    const isOffRange = dates.month(date) !== dates.month(currentDate);
    const isCurrent = dates.eq(date, currentDate, 'day');
    const drilldownView = getDrilldownView(date);
    const label = localizer.format(date, 'dateFormat');
    const DateHeaderComponent = this.props.components.dateHeader || NoopWrapper;

    return (
      <div
        {...props}
        role="link"
        tabIndex="0"
        className={clsx(className, isOffRange && 'rbc-off-range', isCurrent && 'rbc-current')}
        onClick={(e) => this.handleHeadingClick(date, drilldownView, e)}
        onKeyPress={(e) => this.handleHeadingClick(date, drilldownView, e)}
      >
        <DateHeaderComponent>{label}</DateHeaderComponent>
      </div>
    );
  };

  selectDates(slotInfo) {
    const slots = this._pendingSelection.slice();

    this._pendingSelection = [];

    slots.sort((a, b) => +a - +b);

    notify(this.props.onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box,
    });
  }

  clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  }

  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.slotRowRef.current.getRowLimit(),
    });
  }

  renderWeek = (week, weekIdx) => {
    let {
      appointments,
      components,
      selectable,
      getNow,
      selected,
      date,
      localizer,
      longPressThreshold,
      accessors,
    } = this.props;

    const { needLimitMeasure, rowLimit } = this.state;

    appointments = appointmentsForWeek(appointments, week[0], week[week.length - 1], accessors);

    appointments.sort((a, b) => sortAppointments(a, b, accessors));

    return (
      <ContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? this.slotRowRef : undefined}
        container={this.getContainer}
        className="rbc-month-row"
        getNow={getNow}
        date={date}
        range={week}
        appointments={appointments}
        maxRows={rowLimit}
        selected={selected}
        selectable={selectable}
        components={components}
        accessors={accessors}
        localizer={localizer}
        renderHeader={this.readerDateHeading}
        renderForMeasure={needLimitMeasure}
        onShowMore={this.handleShowMore}
        onSelect={this.handleSelectAppointment}
        onDoubleClick={this.handleDoubleClickAppointment}
        onSelectSlot={this.handleSelectSlot}
        longPressThreshold={longPressThreshold}
        rtl={this.props.rtl}
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
    const { date, localizer, className } = this.props;
    const month = dates.visibleDays(date, localizer);
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
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  rtl: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectAppointment: PropTypes.func,
  onDoubleClickAppointment: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
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
