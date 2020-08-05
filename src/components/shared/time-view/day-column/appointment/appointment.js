import React from 'react';
import clsx from 'clsx';

function stringifyPercent(v) {
  return typeof v === 'string' ? v : `${v}%`;
}

/* eslint-disable react/prop-types */
const Appointment = (props) => {
  const {
    style,
    className,
    appointment,
    accessors,
    rtl,
    selected,
    label,
    continuesEarlier,
    continuesLater,
    onClick,
    onDoubleClick,
    components: { appointment: Appointment, appointmentWrapper: AppointmentWrapper },
  } = props;
  const title = accessors.title(appointment);
  const tooltip = accessors.tooltip(appointment);
  const end = accessors.end(appointment);
  const start = accessors.start(appointment);

  const { height, top, width, xOffset } = style;
  const inner = [
    <div key="1" className="rbc-appointment-label">
      {label}
    </div>,
    <div key="2" className="rbc-appointment-content">
      {Appointment ? <Appointment appointment={appointment} title={title} /> : title}
    </div>,
  ];

  return (
    <AppointmentWrapper type="time" {...props}>
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          top: stringifyPercent(top),
          [rtl ? 'right' : 'left']: stringifyPercent(xOffset),
          width: stringifyPercent(width),
          height: stringifyPercent(height),
        }}
        title={tooltip ? (typeof label === 'string' ? `${label}: ` : '') + tooltip : undefined}
        className={clsx('rbc-appointment', className, {
          'rbc-selected': selected,
          'rbc-appointment-continues-earlier': continuesEarlier,
          'rbc-appointment-continues-later': continuesLater,
        })}
      >
        {inner}
      </div>
    </AppointmentWrapper>
  );
};

export default Appointment;
