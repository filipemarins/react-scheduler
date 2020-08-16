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
    rtl,
    selectedAppointment,
    label,
    continuesEarlier,
    continuesLater,
    onClick,
    onDoubleClick,
    components: { appointment: AppointmentComponent, appointmentWrapper: AppointmentWrapper },
  } = props;

  const { title, tooltip } = appointment;
  const { height, top, width, xOffset } = style;
  const inner = [
    <div key="1" className="rbc-appointment-label">
      {label}
    </div>,
    <div key="2" className="rbc-appointment-content">
      <AppointmentComponent appointment={appointment}>{title}</AppointmentComponent>
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
          'rbc-selected': selectedAppointment,
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
