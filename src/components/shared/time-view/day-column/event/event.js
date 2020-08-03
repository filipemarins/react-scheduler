import React from 'react';
import clsx from 'clsx';

function stringifyPercent(v) {
  return typeof v === 'string' ? v : `${v}%`;
}

/* eslint-disable react/prop-types */
const Event = (props) => {
  const {
    style,
    className,
    event,
    accessors,
    rtl,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    getters,
    onClick,
    onDoubleClick,
    components: { event: Event, eventWrapper: EventWrapper },
  } = props;
  const title = accessors.title(event);
  const tooltip = accessors.tooltip(event);
  const end = accessors.end(event);
  const start = accessors.start(event);

  const userProps = getters.eventProp(event, start, end, selected);

  const { height, top, width, xOffset } = style;
  const inner = [
    <div key="1" className="rbc-event-label">
      {label}
    </div>,
    <div key="2" className="rbc-event-content">
      {Event ? <Event event={event} title={title} /> : title}
    </div>,
  ];

  return (
    <EventWrapper type="time" {...props}>
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          ...userProps.style,
          top: stringifyPercent(top),
          [rtl ? 'right' : 'left']: stringifyPercent(xOffset),
          width: stringifyPercent(width),
          height: stringifyPercent(height),
        }}
        title={tooltip ? (typeof label === 'string' ? `${label}: ` : '') + tooltip : undefined}
        className={clsx('rbc-event', className, userProps.className, {
          'rbc-selected': selected,
          'rbc-event-continues-earlier': continuesEarlier,
          'rbc-event-continues-later': continuesLater,
        })}
      >
        {inner}
      </div>
    </EventWrapper>
  );
};

export default Event;
