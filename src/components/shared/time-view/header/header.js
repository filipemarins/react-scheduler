import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import scrollbarSize from 'dom-helpers/scrollbarSize';

import * as dates from 'utils/dates';
import ContentRow from 'components/shared/content-row';
import NoopWrapper from 'components/shared/noop-wrapper';

class Header extends React.Component {
  handleHeaderClick = (e, date) => {
    e.preventDefault();
    this.props.onDayClick(date);
  };

  renderHeaderCells(range) {
    const {
      localizer,
      currentDate,
      components: { header: HeaderComponent = NoopWrapper },
    } = this.props;

    const today = currentDate;

    return range.map((date, i) => {
      const label = localizer.format(date, 'dayFormat');
      const header = (
        <HeaderComponent date={date} localizer={localizer}>
          {label}
        </HeaderComponent>
      );

      return (
        <div key={i} className={clsx('rbc-header', dates.eq(date, today, 'day') && 'rbc-today')}>
          <span
            onClick={(e) => this.handleHeaderClick(e, date)}
            onKeyPress={(e) => this.handleHeadingClick(e, date)}
            role="link"
            tabIndex="0"
          >
            {header}
          </span>
        </div>
      );
    });
  }

  render() {
    const {
      appointments,
      width,
      rtl,
      range,
      currentDate,
      components,
      scrollRef,
      localizer,
      isOverflowing,
      components: { timeGutterHeader: TimeGutterHeader },
    } = this.props;

    const style = {};
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`;
    }

    return (
      <div
        style={style}
        ref={scrollRef}
        className={clsx('rbc-time-header', isOverflowing && 'rbc-overflowing')}
      >
        <div
          className="rbc-label rbc-time-header-gutter"
          style={{ width, minWidth: width, maxWidth: width }}
        >
          {TimeGutterHeader && <TimeGutterHeader />}
        </div>

        <div className="rbc-time-header-content">
          <div
            className={`rbc-row rbc-time-header-cell${
              range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
            }`}
          >
            {this.renderHeaderCells(range)}
          </div>
          <ContentRow
            isAllDay
            rtl={rtl}
            currentDate={currentDate}
            minRows={2}
            range={range}
            appointments={appointments}
            className="rbc-allday-cell"
            selectedAppointment={this.props.selectedAppointment}
            components={components}
            localizer={localizer}
            onSelectAppointment={this.props.onSelectAppointment}
            onDoubleClick={this.props.onDoubleClickAppointment}
          />
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  appointments: PropTypes.array,
  range: PropTypes.array.isRequired,
  currentDate: PropTypes.instanceOf(Date),
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,

  selectedAppointment: PropTypes.object,

  onSelectAppointment: PropTypes.func,
  onDoubleClickAppointment: PropTypes.func,
  onDayClick: PropTypes.func,
  scrollRef: PropTypes.any,
};

export default Header;
