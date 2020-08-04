import React from 'react';
import { action } from '@storybook/addon-actions';

export const dateCellWrapper = (dateCellWrapperProps) => {
  // Show 'click me' text in arbitrary places by using the range prop
  const hasAlert = dateCellWrapperProps.range
    ? dateCellWrapperProps.range.some((date) => {
        return date.getDate() % 12 === 0;
      })
    : false;

  const style = {
    display: 'flex',
    flex: 1,
    borderLeft: '1px solid #DDD',
    backgroundColor: hasAlert ? '#f5f5dc' : '#fff',
  };
  return (
    <div style={style}>
      {hasAlert && (
        <button type="button" onClick={action('custom dateCellWrapper component clicked')}>
          Click me
        </button>
      )}
      {dateCellWrapperProps.children}
    </div>
  );
};

export const appointmentWrapper = (appointmentWrapperProps) => {
  const style = {
    border: '4px solid',
    borderColor: appointmentWrapperProps.appointment.start.getHours() % 2 === 0 ? 'green' : 'red',
    padding: '5px',
  };
  return <div style={style}>{appointmentWrapperProps.children}</div>;
};

export const timeSlotWrapper = (timeSlotWrapperProps) => {
  const style =
    timeSlotWrapperProps.resource === null || timeSlotWrapperProps.value.getMinutes() !== 0
      ? {}
      : {
          border: '4px solid',
          backgroundColor:
            timeSlotWrapperProps.value.getHours() >= 8 &&
            timeSlotWrapperProps.value.getHours() <= 17
              ? 'green'
              : 'red',
          padding: '5px',
        };
  return <div style={style}>{timeSlotWrapperProps.children}</div>;
};
