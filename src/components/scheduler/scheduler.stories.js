/* eslint-disable react/prop-types */
import React from 'react';
import moment from 'moment';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import 'sass/styles.scss';
import momentLocalizer from 'localizers/moment';
import { views } from 'utils/constants';
import { appointmentsWithCustomSize, fakeAppointments } from 'tests/fixtures/appointments';
import {
  dateCellWrapper,
  timeSlotWrapper,
  appointmentWrapper,
} from 'tests/fixtures/custom-components';
import createAppointments from 'tests/fixtures/create-appointments';

import BaseScheduler from './scheduler';

const localizer = momentLocalizer(moment);

addDecorator((fn) => <div style={{ height: 600 }}>{fn()}</div>);

const Scheduler = (props) => <BaseScheduler localizer={localizer} {...props} />;

storiesOf('Basic Usage', module)
  .add('demo', () => (
    <Scheduler
      appointments={fakeAppointments}
      onSelectAppointment={action('appointment selected')}
      defaultCurrentDate={new Date(2015, 3, 1)}
    />
  ))
  .add('default view', () => (
    <Scheduler
      defaultView={views.WEEK}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      appointments={appointmentsWithCustomSize}
      onSelectAppointment={action('appointment selected')}
      defaultCurrentDate={new Date()}
    />
  ))
  .add('complex day view layout', () => (
    <Scheduler
      defaultCurrentDate={new Date()}
      defaultView={views.DAY}
      appointments={createAppointments(1)}
    />
  ))
  .add('multi-day', () => (
    <Scheduler
      showMultiDayTimes
      defaultCurrentDate={new Date(2016, 11, 4)}
      max={moment().endOf('day').add(-1, 'hours').toDate()}
      appointments={[
        {
          title: 'start of the week',
          start: new Date(2016, 11, 4, 15),
          end: new Date(2016, 11, 5, 3),
        },
        {
          title: 'single day longer than max',
          start: new Date(2016, 11, 4, 15),
          end: new Date(2016, 11, 4, 23, 30),
        },
        {
          title: 'end of the week',
          start: new Date(2016, 11, 3),
          end: new Date(2016, 11, 3),
        },
        {
          title: 'middle',
          start: new Date(2016, 11, 6),
          end: new Date(2016, 11, 6),
        },
      ]}
    />
  ))
  .add('agenda view - with length prop', () => (
    /* should display as title toolbar (from now to now + 14 days) */
    <Scheduler defaultView={views.AGENDA} appointments={appointmentsWithCustomSize} length={14} />
  ))
  .add('custom now is the first of the month', () => {
    // Issue on week view
    const customNow = () => {
      const now = new Date();
      now.setDate(1);
      return now;
    };
    return (
      <Scheduler
        defaultView={views.WEEK}
        min={moment('12:00am', 'h:mma').toDate()}
        max={moment('11:59pm', 'h:mma').toDate()}
        appointments={appointmentsWithCustomSize}
        onSelectAppointment={action('appointment selected')}
        defaultCurrentDate={customNow()}
      />
    );
  })
  .add('add custom date header', () => (
    <Scheduler
      defaultView={views.MONTH}
      appointments={appointmentsWithCustomSize}
      components={{
        month: {
          dateHeader: ({ children }) => <span>{children} - custom date header</span>,
        },
      }}
    />
  ))
  .add('add custom week header', () => (
    <Scheduler
      defaultView={views.WEEK}
      appointments={appointmentsWithCustomSize}
      components={{
        week: {
          header: ({ children }) => <span>{children} - custom week header</span>,
        },
      }}
    />
  ))
  .add('add custom toolbar', () => (
    <Scheduler
      defaultView={views.WEEK}
      appointments={appointmentsWithCustomSize}
      components={{
        week: {
          toolbar: () => <span>custom toolbar</span>,
        },
      }}
    />
  ))
  .add('custom time gutter header', () => {
    // Should rename to TimeScaleHeader
    const TimeGutter = () => <p>Custom gutter text</p>;
    return (
      <Scheduler
        appointments={fakeAppointments}
        onSelectAppointment={action('appointment selected')}
        defaultCurrentDate={new Date(2015, 3, 12)}
        defaultView="week"
        views={['week', 'day']}
        components={{
          timeGutterHeader: TimeGutter,
        }}
      />
    );
  })
  .add('add custom dateCellWrapper', () => (
    <Scheduler
      defaultView={views.MONTH}
      appointments={appointmentsWithCustomSize}
      components={{
        dateCellWrapper,
      }}
    />
  ))
  .add('add custom appointmentWrapper', () => (
    <Scheduler
      defaultView={views.DAY}
      appointments={appointmentsWithCustomSize}
      components={{
        appointmentWrapper,
      }}
    />
  ))
  .add('add custom timeSlotWrapper', () => (
    <Scheduler
      defaultView={views.WEEK}
      appointments={appointmentsWithCustomSize}
      components={{
        timeSlotWrapper,
      }}
    />
  ))
  .add('add custom no agenda appointments label', () => (
    <Scheduler
      defaultView={views.AGENDA}
      appointments={appointmentsWithCustomSize}
      messages={{
        noAppointmentsInRange: 'There are no special appointments in this range [test message]',
      }}
    />
  ))
  .add('add custom appointment', () => (
    <Scheduler
      defaultView={views.WEEK}
      appointments={appointmentsWithCustomSize}
      components={{
        appointment: ({ children }) => <span>{children} - custom appointment</span>,
      }}
    />
  ));

storiesOf('Appointment Durations', module)
  .add('Daylight savings starts', () => (
    <Scheduler
      defaultView={views.DAY}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      appointments={[
        {
          title: 'on DST',
          start: new Date(2017, 2, 12, 1),
          end: new Date(2017, 2, 12, 2, 30),
          allDay: false,
        },
        {
          title: 'crosses DST',
          start: new Date(2017, 2, 12, 1),
          end: new Date(2017, 2, 12, 6, 30),
          allDay: false,
        },
        {
          title: 'After DST',
          start: new Date(2017, 2, 12, 7),
          end: new Date(2017, 2, 12, 9, 30),
          allDay: false,
        },
      ]}
      defaultCurrentDate={new Date(2017, 2, 12)}
    />
  ))
  .add('Daylight savings ends', () => (
    <Scheduler
      defaultView={views.DAY}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      appointments={[
        {
          title: 'on DST',
          start: new Date(2017, 10, 5, 1),
          end: new Date(2017, 10, 5, 3, 30),
          allDay: false,
        },
        {
          title: 'crosses DST',
          start: new Date(2017, 10, 5, 1),
          end: new Date(2017, 10, 5, 6, 30),
          allDay: false,
        },
        {
          title: 'After DST',
          start: new Date(2017, 10, 5, 7),
          end: new Date(2017, 10, 5, 7, 45),
          allDay: false,
        },
      ]}
      defaultCurrentDate={new Date(2017, 10, 5)}
    />
  ))
  .add('Daylight savings starts, after 2am', () => (
    <Scheduler
      defaultView={views.DAY}
      min={moment('3:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      appointments={[
        {
          title: 'After DST',
          start: new Date(2017, 2, 12, 7),
          end: new Date(2017, 2, 12, 9, 30),
          allDay: false,
        },
      ]}
      defaultCurrentDate={new Date(2017, 2, 12)}
    />
  ))
  .add('Daylight savings ends, after 2am', () => (
    <Scheduler
      defaultView={views.DAY}
      min={moment('3:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      appointments={[
        {
          title: 'After DST',
          start: new Date(2017, 10, 5, 7),
          end: new Date(2017, 10, 5, 9, 30),
          allDay: false,
        },
      ]}
      defaultCurrentDate={new Date(2017, 10, 5)}
    />
  ));

storiesOf('Layout Issues', module)
  .add('appointment layout', () => (
    <Scheduler
      defaultView={views.DAY}
      defaultCurrentDate={new Date()}
      appointments={createAppointments(1)}
    />
  ))
  .add('first of the week all-day appointment', () => (
    <Scheduler
      defaultCurrentDate={new Date(2016, 11, 4)}
      appointments={[
        {
          allDay: true,
          title: 'All Day Appointment',
          start: new Date(2016, 11, 4),
          end: new Date(2016, 11, 4),
        },
      ]}
    />
  ))
  .add('end of the week all-day appointment', () => (
    <Scheduler
      defaultCurrentDate={new Date(2016, 11, 3)}
      appointments={[
        {
          allDay: true,
          title: 'All Day Appointment',
          start: new Date(2016, 11, 3),
          end: new Date(2016, 11, 3),
        },
      ]}
    />
  ))
  .add('appointment at end of week', () => (
    <Scheduler
      defaultCurrentDate={new Date(2016, 11, 3)}
      appointments={[
        {
          title: 'has time',
          start: moment(new Date(2016, 11, 3)).add(1, 'days').subtract(5, 'hours').toDate(),
          end: moment(new Date(2016, 11, 3)).add(1, 'days').subtract(4, 'hours').toDate(),
        },
      ]}
    />
  ))
  .add('appointment at start of week', () => (
    <Scheduler
      defaultCurrentDate={new Date(2016, 11, 4)}
      appointments={[
        {
          title: 'has time',
          start: moment(new Date(2016, 11, 4)).add(1, 'days').subtract(5, 'hours').toDate(),
          end: moment(new Date(2016, 11, 4)).add(1, 'days').subtract(4, 'hours').toDate(),
        },
      ]}
    />
  ))
  .add('appointments on a constrained day column', () => (
    <Scheduler
      defaultView={views.DAY}
      min={moment('8 am', 'h a').toDate()}
      max={moment('5 pm', 'h a').toDate()}
      appointments={appointmentsWithCustomSize}
    />
  ))
  .add('no duration', () => (
    /* should display all three appointments */
    <Scheduler
      defaultCurrentDate={new Date(2016, 11, 4)}
      appointments={[
        {
          title: 'start of the week',
          start: new Date(2016, 11, 4),
          end: new Date(2016, 11, 4),
        },
        {
          title: 'end of the week',
          start: new Date(2016, 11, 3),
          end: new Date(2016, 11, 3),
        },
        {
          title: 'middle',
          start: new Date(2016, 11, 6),
          end: new Date(2016, 11, 6),
        },
      ]}
    />
  ))
  .add('Single days should only span one slot, multi-days multiple', () => (
    <Scheduler
      defaultCurrentDate={new Date(2015, 3, 1)}
      appointments={[
        {
          title: 'SingleDay 1',
          start: new Date(2015, 3, 10),
          end: new Date(2015, 3, 11),
        },
        {
          title: 'SingleDay 2',
          start: new Date(2015, 3, 11),
          end: new Date(2015, 3, 12),
        },
        {
          title: 'SingleDay 3',
          start: new Date(2015, 3, 12),
          end: new Date(2015, 3, 13),
        },
        {
          title: 'SingleDay 4',
          start: new Date(2015, 3, 13),
          end: new Date(2015, 3, 14),
        },
        {
          title: 'MultiDay 1',
          start: new Date(2015, 3, 24),
          end: new Date(2015, 3, 25, 1, 0, 0, 0),
        },
        {
          title: 'MultiDay 2',
          start: new Date(2015, 3, 25),
          end: new Date(2015, 3, 26, 1, 0, 0, 0),
        },
      ]}
    />
  ));
