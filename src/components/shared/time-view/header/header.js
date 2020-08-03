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
      getters: { dayProp },
      components: { header: HeaderComponent = NoopWrapper },
    } = this.props;

    const today = getNow();

    return range.map((date, i) => {
      const drilldownView = getDrilldownView(date);
      const label = localizer.format(date, 'dayFormat');

      const { className, style } = dayProp(date);

      const header = (
        <HeaderComponent date={date} localizer={localizer}>
          {label}
        </HeaderComponent>
      );

      return (
        <div
          key={i}
          style={style}
          className={clsx('rbc-header', className, dates.eq(date, today, 'day') && 'rbc-today')}
        >
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

  renderRow = (resource) => {
    const {
      events,
      rtl,
      selectable,
      getNow,
      range,
      getters,
      localizer,
      accessors,
      components,
    } = this.props;

    const resourceId = accessors.resourceId(resource);
    const eventsToDisplay = resource
      ? events.filter((event) => accessors.resource(event) === resourceId)
      : events;

    return (
      <ContentRow
        isAllDay
        rtl={rtl}
        getNow={getNow}
        minRows={2}
        range={range}
        events={eventsToDisplay}
        resourceId={resourceId}
        className="rbc-allday-cell"
        selectable={selectable}
        selected={this.props.selected}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        onSelect={this.props.onSelectEvent}
        onDoubleClick={this.props.onDoubleClickEvent}
        onSelectSlot={this.props.onSelectSlot}
        longPressThreshold={this.props.longPressThreshold}
      />
    );
  };

  render() {
    const {
      width,
      rtl,
      resources,
      range,
      events,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      scrollRef,
      localizer,
      isOverflowing,
      components: {
        timeGutterHeader: TimeGutterHeader,
        resourceHeader: ResourceHeaderComponent = NoopWrapper,
      },
    } = this.props;

    const style = {};
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`;
    }

    const groupedEvents = resources.groupEvents(events);

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

        {resources.map(([id, resource], idx) => (
          <div className="rbc-time-header-content" key={id || idx}>
            {resource && (
              <div className="rbc-row rbc-row-resource" key={`resource_${idx}`}>
                <div className="rbc-header">
                  <ResourceHeaderComponent
                    index={idx}
                    label={accessors.resourceTitle(resource)}
                    resource={resource}
                  />
                </div>
              </div>
            )}
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
              events={groupedEvents.get(id) || []}
              resourceId={resource && id}
              className="rbc-allday-cell"
              selectable={selectable}
              selected={this.props.selected}
              components={components}
              accessors={accessors}
              getters={getters}
              localizer={localizer}
              onSelect={this.props.onSelectEvent}
              onDoubleClick={this.props.onDoubleClickEvent}
              onSelectSlot={this.props.onSelectSlot}
              longPressThreshold={this.props.longPressThreshold}
            />
          </div>
        ))}
      </div>
    );
  }
}

Header.propTypes = {
  range: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  resources: PropTypes.object,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any,
};

export default Header;