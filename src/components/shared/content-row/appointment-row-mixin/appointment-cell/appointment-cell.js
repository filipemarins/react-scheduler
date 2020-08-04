import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import * as dates from 'utils/dates';

class AppointmentCell extends React.Component {
  render() {
    const {
      style,
      className,
      appointment,
      selected,
      isAllDay,
      onSelect,
      onDoubleClick,
      localizer,
      continuesPrior,
      continuesAfter,
      accessors,
      getters,
      children,
      components: { appointment: Appointment, appointmentWrapper: AppointmentWrapper },
      slotStart,
      slotEnd,
      ...props
    } = this.props;

    const title = accessors.title(appointment);
    const tooltip = accessors.tooltip(appointment);
    const end = accessors.end(appointment);
    const start = accessors.start(appointment);
    const allDay = accessors.allDay(appointment);

    const showAsAllDay = isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1;

    const userProps = getters.appointmentProp(appointment, start, end, selected);

    const content = (
      <div className="rbc-appointment-content" title={tooltip || undefined}>
        {Appointment ? (
          <Appointment
            appointment={appointment}
            continuesPrior={continuesPrior}
            continuesAfter={continuesAfter}
            title={title}
            isAllDay={allDay}
            localizer={localizer}
            slotStart={slotStart}
            slotEnd={slotEnd}
          />
        ) : (
          title
        )}
      </div>
    );

    return (
      <AppointmentWrapper {...this.props} type="date">
        <div
          {...props}
          tabIndex={0}
          style={{ ...userProps.style, ...style }}
          className={clsx('rbc-appointment', className, userProps.className, {
            'rbc-selected': selected,
            'rbc-appointment-allday': showAsAllDay,
            'rbc-appointment-continues-prior': continuesPrior,
            'rbc-appointment-continues-after': continuesAfter,
          })}
          onClick={(e) => onSelect && onSelect(appointment, e)}
          onDoubleClick={(e) => onDoubleClick && onDoubleClick(appointment, e)}
        >
          {typeof children === 'function' ? children(content) : content}
        </div>
      </AppointmentWrapper>
    );
  }
}

AppointmentCell.propTypes = {
  appointment: PropTypes.object.isRequired,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.instanceOf(Date),

  selected: PropTypes.bool,
  isAllDay: PropTypes.bool,
  continuesPrior: PropTypes.bool,
  continuesAfter: PropTypes.bool,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object,

  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
};

export default AppointmentCell;
