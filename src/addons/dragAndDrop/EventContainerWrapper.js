import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';

import Selection, { getBoundsForNode, getEventNodeFromPoint } from 'components/selection';
import TimeGridEvent from 'components/time-grid-event';
import NoopWrapper from 'components/noop-wrapper';
import { dragAccessors } from './common';
import * as dates from '../../utils/dates';

const pointInColumn = (bounds, { x, y }) => {
  const { left, right, top } = bounds;
  return x < right + 10 && x > left && y > top;
};
const propTypes = {};

class EventContainerWrapper extends React.Component {
  static propTypes = {
    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,
    slotMetrics: PropTypes.object.isRequired,
    resource: PropTypes.any,
  };

  static contextTypes = {
    draggable: PropTypes.shape({
      onStart: PropTypes.func,
      onEnd: PropTypes.func,
      onDropFromOutside: PropTypes.func,
      onBeginAction: PropTypes.func,
      dragAndDropAction: PropTypes.object,
      dragFromOutsideItem: PropTypes.func,
    }),
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._selectable();
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  reset() {
    if (this.state.event) this.setState({ event: null, top: null, height: null });
  }

  update(event, { startDate, endDate, top, height }) {
    const { event: lastEvent } = this.state;
    if (lastEvent && startDate === lastEvent.start && endDate === lastEvent.end) {
      return;
    }

    this.setState({
      top,
      height,
      event: { ...event, start: startDate, end: endDate },
    });
  }

  handleMove = (point, boundaryBox) => {
    const { event } = this.context.draggable.dragAndDropAction;
    const { accessors, slotMetrics } = this.props;

    if (!pointInColumn(boundaryBox, point)) {
      this.reset();
      return;
    }

    const currentSlot = slotMetrics.closestSlotFromPoint(
      { y: point.y - this.eventOffsetTop, x: point.x },
      boundaryBox
    );

    const eventStart = accessors.start(event);
    const eventEnd = accessors.end(event);
    const end = dates.add(currentSlot, dates.diff(eventStart, eventEnd, 'minutes'), 'minutes');

    this.update(event, slotMetrics.getRange(currentSlot, end, false, true));
  };

  handleResize(point, boundaryBox) {
    let start;
    let end;
    const { accessors, slotMetrics } = this.props;
    const { event, direction } = this.context.draggable.dragAndDropAction;

    const currentSlot = slotMetrics.closestSlotFromPoint(point, boundaryBox);
    if (direction === 'UP') {
      end = accessors.end(event);
      start = dates.min(currentSlot, slotMetrics.closestSlotFromDate(end, -1));
    } else if (direction === 'DOWN') {
      start = accessors.start(event);
      end = dates.max(currentSlot, slotMetrics.closestSlotFromDate(start));
    }

    this.update(event, slotMetrics.getRange(start, end));
  }

  handleDropFromOutside = (point, boundaryBox) => {
    const { slotMetrics, resource } = this.props;

    const start = slotMetrics.closestSlotFromPoint({ y: point.y, x: point.x }, boundaryBox);

    this.context.draggable.onDropFromOutside({
      start,
      end: slotMetrics.nextSlot(start),
      allDay: false,
      resource,
    });
  };

  _selectable = () => {
    const node = findDOMNode(this);
    let isBeingDragged = false;
    const selector = (this._selector = new Selection(() => node.closest('.rbc-time-view')));

    selector.on('beforeSelect', (point) => {
      const { dragAndDropAction } = this.context.draggable;

      if (!dragAndDropAction.action) return false;
      if (dragAndDropAction.action === 'resize') {
        return pointInColumn(getBoundsForNode(node), point);
      }

      const eventNode = getEventNodeFromPoint(node, point);
      if (!eventNode) return false;

      this.eventOffsetTop = point.y - getBoundsForNode(eventNode).top;
    });

    selector.on('selecting', (box) => {
      const bounds = getBoundsForNode(node);
      const { dragAndDropAction } = this.context.draggable;

      if (dragAndDropAction.action === 'move') this.handleMove(box, bounds);
      if (dragAndDropAction.action === 'resize') this.handleResize(box, bounds);
    });

    selector.on('dropFromOutside', (point) => {
      if (!this.context.draggable.onDropFromOutside) return;

      const bounds = getBoundsForNode(node);

      if (!pointInColumn(bounds, point)) return;

      this.handleDropFromOutside(point, bounds);
    });

    selector.on('dragOver', (point) => {
      if (!this.context.draggable.dragFromOutsideItem) return;

      const bounds = getBoundsForNode(node);

      this.handleDropFromOutside(point, bounds);
    });

    selector.on('selectStart', () => {
      isBeingDragged = true;
      this.context.draggable.onStart();
    });

    selector.on('select', (point) => {
      const bounds = getBoundsForNode(node);
      isBeingDragged = false;
      if (!this.state.event || !pointInColumn(bounds, point)) return;
      this.handleInteractionEnd();
    });

    selector.on('click', () => {
      if (isBeingDragged) this.reset();
      this.context.draggable.onEnd(null);
    });

    selector.on('reset', () => {
      this.reset();
      this.context.draggable.onEnd(null);
    });
  };

  handleInteractionEnd = () => {
    const { resource } = this.props;
    const { event } = this.state;

    this.reset();

    this.context.draggable.onEnd({
      start: event.start,
      end: event.end,
      resourceId: resource,
    });
  };

  _teardownSelectable = () => {
    if (!this._selector) return;
    this._selector.teardown();
    this._selector = null;
  };

  render() {
    const { children, accessors, components, getters, slotMetrics, localizer } = this.props;

    const { event, top, height } = this.state;

    if (!event) return children;

    const events = children.props.children;
    const { start, end } = event;

    let label;
    let format = 'eventTimeRangeFormat';

    const startsBeforeDay = slotMetrics.startsBeforeDay(start);
    const startsAfterDay = slotMetrics.startsAfterDay(end);

    if (startsBeforeDay) format = 'eventTimeRangeEndFormat';
    else if (startsAfterDay) format = 'eventTimeRangeStartFormat';

    if (startsBeforeDay && startsAfterDay) label = localizer.messages.allDay;
    else label = localizer.format({ start, end }, format);

    return React.cloneElement(children, {
      children: (
        <>
          {events}

          {event && (
            <TimeGridEvent
              event={event}
              label={label}
              className="rbc-addons-dnd-drag-preview"
              style={{ top, height, width: 100 }}
              getters={getters}
              components={{ ...components, eventWrapper: NoopWrapper }}
              accessors={{ ...accessors, ...dragAccessors }}
              continuesEarlier={startsBeforeDay}
              continuesLater={startsAfterDay}
            />
          )}
        </>
      ),
    });
  }
}

EventContainerWrapper.propTypes = propTypes;

export default EventContainerWrapper;
