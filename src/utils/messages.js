const defaultMessages = {
  date: 'Date',
  time: 'Time',
  appointment: 'Appointment',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: 'Back',
  next: 'Next',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',

  noAppointmentsInRange: 'There are no appointments in this range.',

  showMore: (total) => `+${total} more`,
};

export default function messages(msgs) {
  return {
    ...defaultMessages,
    ...msgs,
  };
}
