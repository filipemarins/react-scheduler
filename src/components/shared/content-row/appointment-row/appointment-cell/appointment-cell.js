import React, { useContext } from 'react';
import { bool, instanceOf, shape } from 'prop-types';
import clsx from 'clsx';

import { SchedulerContext } from 'utils/scheduler-context';
import { isSelected } from 'utils/selection';
import * as dates from 'utils/dates';

const AppointmentCell = ({ appointment, continuesPrior, continuesAfter, slotStart, slotEnd }) => {
  const {
    selectedAppointment,
    onSelectAppointment,
    onDoubleClick,
    localizer,
    components: { appointment: Appointment, appointmentWrapper: AppointmentWrapper },
  } = useContext(SchedulerContext);

  const { title, tooltip, end, start, allDay } = appointment;
  const showAsAllDay = allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1;

  return (
    <AppointmentWrapper type="date">
      <div
        role="link"
        tabIndex="0"
        className={clsx('rbc-appointment', {
          'rbc-selected': isSelected(appointment, selectedAppointment),
          'rbc-appointment-allday': showAsAllDay,
          'rbc-appointment-continues-prior': continuesPrior,
          'rbc-appointment-continues-after': continuesAfter,
        })}
        onClick={(e) => onSelectAppointment && onSelectAppointment(appointment, e)}
        onDoubleClick={(e) => onDoubleClick && onDoubleClick(appointment, e)}
        onKeyPress={(e) => onSelectAppointment && onSelectAppointment(appointment, e)}
      >
        <div className="rbc-appointment-content" title={tooltip || undefined}>
          <Appointment
            appointment={appointment}
            continuesPrior={continuesPrior}
            continuesAfter={continuesAfter}
            localizer={localizer}
            slotStart={slotStart}
            slotEnd={slotEnd}
          >
            {title}
          </Appointment>
        </div>
      </div>
    </AppointmentWrapper>
  );
};

AppointmentCell.propTypes = {
  appointment: shape({}).isRequired,
  continuesAfter: bool.isRequired,
  continuesPrior: bool.isRequired,
  slotEnd: instanceOf(Date).isRequired,
  slotStart: instanceOf(Date).isRequired,
};

export default AppointmentCell;
