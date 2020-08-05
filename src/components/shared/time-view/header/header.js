import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import scrollbarSize from 'dom-helpers/scrollbarSize';

import * as dates from 'utils/dates';
import ContentRow from 'components/shared/content-row';
import NoopWrapper from 'components/shared/noop-wrapper';
import { notify } from 'utils/helpers';

class Header extends React.Component {
  handleHeaderClick = (date, view, e) => {
    e.preventDefault();
    notify(this.props.onDrillDown, [date, view]);
  };

  renderHeaderCells(range) {
    const {
      localizer,
      getDrilldownView,
      getNow,
      components: { header: HeaderComponent = NoopWrapper },
    } = this.props;

    const today = getNow();

    return range.map((date, i) => {
      const drilldownView = getDrilldownView(date);
      const label = localizer.format(date, 'dayFormat');

      const header = (
        <HeaderComponent date={date} localizer={localizer}>
          {label}
        </HeaderComponent>
      );

      return (
        <div key={i} className={clsx('rbc-header', dates.eq(date, today, 'day') && 'rbc-today')}>
          <span
            onClick={(e) => this.handleHeaderClick(date, drilldownView, e)}
            onKeyPress={(e) => this.handleHeadingClick(date, drilldownView, e)}
            role="link"
            tabIndex="0"
          >
            {header}
          </span>
        </div>
      );
    });
  }

  renderRow = () => {
    const {
      appointments,
      rtl,
      selectable,
      getNow,
      range,
      localizer,
      accessors,
      components,
    } = this.props;

    return (
      <ContentRow
        isAllDay
        rtl={rtl}
        getNow={getNow}
        minRows={2}
        range={range}
        className="rbc-allday-cell"
        selectable={selectable}
        selected={this.props.selected}
        components={components}
        accessors={accessors}
        localizer={localizer}
        onSelect={this.props.onSelectAppointment}
        onDoubleClick={this.props.onDoubleClickAppointment}
        onSelectSlot={this.props.onSelectSlot}
        longPressThreshold={this.props.longPressThreshold}
      />
    );
  };

  render() {
    const {
      width,
      rtl,
      range,
      appointments,
      getNow,
      accessors,
      selectable,
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
            getNow={getNow}
            minRows={2}
            range={range}
            appointments={[]}
            className="rbc-allday-cell"
            selectable={selectable}
            selected={this.props.selected}
            components={components}
            accessors={accessors}
            localizer={localizer}
            onSelect={this.props.onSelectAppointment}
            onDoubleClick={this.props.onDoubleClickAppointment}
            onSelectSlot={this.props.onSelectSlot}
            longPressThreshold={this.props.longPressThreshold}
          />
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  range: PropTypes.array.isRequired,
  appointments: PropTypes.array.isRequired,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func,
  onSelectAppointment: PropTypes.func,
  onDoubleClickAppointment: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any,
};

export default Header;
