const createAppointments = (idx = 0, date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  const sets = [
    [
      {
        title: 'Appointment 1',
        start: new Date(y, m, d, 10, 30, 0, 0),
        end: new Date(y, m, d, 13, 30, 0, 0),
      },
      {
        title: 'Appointment 2',
        start: new Date(y, m, d, 10, 30, 0, 0),
        end: new Date(y, m, d, 13, 30, 0, 0),
      },
      {
        title: 'Appointment 3',
        start: new Date(y, m, d, 10, 30, 0, 0),
        end: new Date(y, m, d, 12, 30, 0, 0),
      },
      {
        title: 'Appointment 4',
        start: new Date(y, m, d, 8, 30, 0, 0),
        end: new Date(y, m, d, 18, 0, 0, 0),
      },
      {
        title: 'Appointment 5',
        start: new Date(y, m, d, 15, 30, 0, 0),
        end: new Date(y, m, d, 16, 0, 0, 0),
      },
      {
        title: 'Appointment 6',
        start: new Date(y, m, d, 11, 0, 0, 0),
        end: new Date(y, m, d, 12, 0, 0, 0),
      },
      {
        title: 'Appointment 7',
        start: new Date(y, m, d, 1, 0, 0, 0),
        end: new Date(y, m, d, 2, 0, 0, 0),
      },
    ],
    [
      {
        title: 'Appointment 1',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 15, 30, 0, 0),
      },
      {
        title: 'Appointment 2',
        start: new Date(y, m, d, 11, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 3',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 11, 30, 0, 0),
      },
      {
        title: 'Appointment 4',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 10, 30, 0, 0),
      },
      {
        title: 'Appointment 5',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 11, 0, 0, 0),
      },
      {
        title: 'Appointment 6',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 11, 0, 0, 0),
      },
      {
        title: 'Appointment 7',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 10, 30, 0, 0),
      },
      {
        title: 'Appointment 8',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 10, 30, 0, 0),
      },
      {
        title: 'Appointment 9',
        start: new Date(y, m, d, 9, 30, 0, 0),
        end: new Date(y, m, d, 10, 30, 0, 0),
      },
      {
        title: 'Appointment 10',
        start: new Date(y, m, d, 10, 30, 0, 0),
        end: new Date(y, m, d, 12, 30, 0, 0),
      },
      {
        title: 'Appointment 11',
        start: new Date(y, m, d, 12, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 12',
        start: new Date(y, m, d, 12, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 13',
        start: new Date(y, m, d, 12, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 14',
        start: new Date(y, m, d, 12, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 15',
        start: new Date(y, m, d, 6, 30, 0, 0),
        end: new Date(y, m, d, 8, 0, 0, 0),
      },
      {
        title: 'Appointment 16',
        start: new Date(y, m, d, 16, 0, 0, 0),
        end: new Date(y, m, d, 17, 30, 0, 0),
      },
    ],
    [
      {
        title: 'Appointment 1',
        start: new Date(y, m, d, 2, 30, 0, 0),
        end: new Date(y, m, d, 4, 30, 0, 0),
      },
      {
        title: 'Appointment 2',
        start: new Date(y, m, d, 2, 30, 0, 0),
        end: new Date(y, m, d, 3, 30, 0, 0),
      },
      {
        title: 'Appointment 3',
        start: new Date(y, m, d, 3, 0, 0, 0),
        end: new Date(y, m, d, 4, 0, 0, 0),
      },
    ],
    [
      {
        title: 'Appointment 1',
        start: new Date(y, m, d, 6, 30, 0, 0),
        end: new Date(y, m, d, 7, 0, 0, 0),
      },
      {
        title: 'Appointment 2',
        start: new Date(y, m, d, 8, 0, 0, 0),
        end: new Date(y, m, d, 17, 0, 0, 0),
      },
      {
        title: 'Appointment 3',
        start: new Date(y, m, d, 8, 0, 0, 0),
        end: new Date(y, m, d, 11, 0, 0, 0),
      },
      {
        title: 'Appointment 4',
        start: new Date(y, m, d, 8, 0, 0, 0),
        end: new Date(y, m, d, 12, 0, 0, 0),
      },
      {
        title: 'Appointment 5',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 6',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
      {
        title: 'Appointment 7',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 13, 0, 0, 0),
      },
    ],
    [
      {
        title: 'Appointment 1',
        start: new Date(y, m, d, 19, 0, 0, 0),
        end: new Date(y, m, d, 20, 55, 0, 0),
      },
      {
        title: 'Appointment 2',
        start: new Date(y, m, d, 19, 15, 0, 0),
        end: new Date(y, m, d, 20, 15, 0, 0),
      },
      {
        title: 'Appointment 3',
        start: new Date(y, m, d, 19, 45, 0, 0),
        end: new Date(y, m, d, 22, 30, 0, 0),
      },
      {
        title: 'Appointment 4',
        start: new Date(y, m, d, 20, 45, 0, 0),
        end: new Date(y, m, d, 22, 5, 0, 0),
      },
      {
        title: 'Appointment 5',
        start: new Date(y, m, d, 10, 0, 0, 0),
        end: new Date(y, m, d, 11, 0, 0, 0),
      },
      {
        title: 'Appointment 6',
        start: new Date(y, m, d, 10, 30, 0, 0),
        end: new Date(y, m, d, 11, 30, 0, 0),
      },
    ],
  ];

  return sets[idx];
};

export default createAppointments;
