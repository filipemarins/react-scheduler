import React from 'react';
import moment from 'moment';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import 'sass/styles.scss';
import momentLocalizer from 'localizers/moment';
import { views } from 'utils/constants';
import { eventsWithCustomSize, fakeEvents } from 'tests/fixtures/events';
import resources from 'tests/fixtures/resources';
import { dateCellWrapper, timeSlotWrapper, eventWrapper } from 'tests/fixtures/custom-components';
import createEvents from 'tests/fixtures/create-events';

import BaseCalendar from './calendar';

const localizer = momentLocalizer(moment);

addDecorator((fn) => <div style={{ height: 600 }}>{fn()}</div>);

const Calendar = (props) => <BaseCalendar localizer={localizer} {...props} />;

storiesOf('Basic Usage', module)
  .add('demo', () => (
    <Calendar
      events={fakeEvents}
      onSelectEvent={action('event selected')}
      defaultDate={new Date(2015, 3, 1)}
    />
  ))
  .add('default view', () => (
    <Calendar
      defaultView={views.WEEK}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      defaultDate={new Date()}
    />
  ))
  .add('selectable', () => (
    <Calendar
      selectable
      defaultView={views.WEEK}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      defaultDate={new Date()}
    />
  ))
  .add('complex day view layout', () => (
    <Calendar defaultDate={new Date()} defaultView={views.DAY} events={createEvents(1)} step={30} />
  ))
  .add('multi-day', () => (
    <Calendar
      showMultiDayTimes
      defaultDate={new Date(2016, 11, 4)}
      max={moment().endOf('day').add(-1, 'hours').toDate()}
      events={[
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
    <Calendar defaultView={views.AGENDA} events={eventsWithCustomSize} length={14} />
  ))
  .add('custom now is the first of the month', () => {
    // Issue on week view
    const customNow = () => {
      const now = new Date();
      now.setDate(1);
      return now;
    };
    return (
      <Calendar
        defaultView={views.WEEK}
        getNow={customNow}
        min={moment('12:00am', 'h:mma').toDate()}
        max={moment('11:59pm', 'h:mma').toDate()}
        events={eventsWithCustomSize}
        onSelectEvent={action('event selected')}
        defaultDate={new Date()}
      />
    );
  })
  .add('add custom date header', () => (
    <Calendar
      defaultView={views.MONTH}
      events={eventsWithCustomSize}
      components={{
        month: {
          // eslint-disable-next-line react/prop-types
          dateHeader: ({ children }) => <span>{children} - custom date header</span>,
        },
      }}
    />
  ))
  .add('add custom week header', () => (
    <Calendar
      defaultView={views.WEEK}
      events={eventsWithCustomSize}
      components={{
        week: {
          // eslint-disable-next-line react/prop-types
          header: ({ children }) => <span>{children} - custom week header</span>,
        },
      }}
    />
  ))
  .add('add custom toolbar', () => (
    <Calendar
      defaultView={views.WEEK}
      events={eventsWithCustomSize}
      components={{
        week: {
          // eslint-disable-next-line react/prop-types
          toolbar: ({ children }) => <span>{children} - xablau</span>,
        },
      }}
    />
  ))
  .add('custom time gutter header', () => {
    // Should rename to TimeScaleHeader
    const TimeGutter = () => <p>Custom gutter text</p>;
    return (
      <Calendar
        events={fakeEvents}
        onSelectEvent={action('event selected')}
        defaultDate={new Date(2015, 3, 1)}
        defaultView="week"
        views={['week', 'day']}
        components={{
          timeGutterHeader: TimeGutter,
        }}
      />
    );
  })
  .add('add custom dateCellWrapper', () => (
    <Calendar
      defaultView={views.MONTH}
      events={eventsWithCustomSize}
      components={{
        dateCellWrapper,
      }}
    />
  ))
  .add('add custom timeSlotWrapper', () => (
    <Calendar
      defaultView={views.DAY}
      events={eventsWithCustomSize}
      components={{
        timeSlotWrapper,
      }}
    />
  ))
  .add('add custom eventWrapper', () => (
    <Calendar
      defaultView={views.DAY}
      events={eventsWithCustomSize}
      components={{
        eventWrapper,
      }}
    />
  ))
  .add('add custom no agenda events label', () => (
    <Calendar
      defaultView={views.AGENDA}
      events={eventsWithCustomSize}
      messages={{
        noEventsInRange: 'There are no special events in this range [test message]',
      }}
    />
  ))
  .add('add custom timeSlotWrapper', () => (
    <Calendar
      defaultView={views.WEEK}
      events={eventsWithCustomSize}
      components={{
        timeSlotWrapper,
      }}
    />
  ));

storiesOf('Event Durations', module)
  .add('Daylight savings starts', () => (
    <Calendar
      defaultView={views.DAY}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={[
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
      defaultDate={new Date(2017, 2, 12)}
    />
  ))
  .add('Daylight savings ends', () => (
    <Calendar
      defaultView={views.DAY}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={[
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
      defaultDate={new Date(2017, 10, 5)}
    />
  ))
  .add('Daylight savings starts, after 2am', () => (
    <Calendar
      defaultView={views.DAY}
      min={moment('3:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={[
        {
          title: 'After DST',
          start: new Date(2017, 2, 12, 7),
          end: new Date(2017, 2, 12, 9, 30),
          allDay: false,
        },
      ]}
      defaultDate={new Date(2017, 2, 12)}
    />
  ))
  .add('Daylight savings ends, after 2am', () => (
    <Calendar
      defaultView={views.DAY}
      min={moment('3:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={[
        {
          title: 'After DST',
          start: new Date(2017, 10, 5, 7),
          end: new Date(2017, 10, 5, 9, 30),
          allDay: false,
        },
      ]}
      defaultDate={new Date(2017, 10, 5)}
    />
  ));

storiesOf('Layout Issues', module)
  .add('event layout', () => (
    <Calendar
      defaultView={views.DAY}
      defaultDate={new Date()}
      timeslots={4}
      events={createEvents(1)}
    />
  ))
  .add('first of the week all-day event', () => (
    <Calendar
      defaultDate={new Date(2016, 11, 4)}
      events={[
        {
          allDay: true,
          title: 'All Day Event',
          start: new Date(2016, 11, 4),
          end: new Date(2016, 11, 4),
        },
      ]}
    />
  ))
  .add('end of the week all-day event', () => (
    <Calendar
      defaultDate={new Date(2016, 11, 3)}
      events={[
        {
          allDay: true,
          title: 'All Day Event',
          start: new Date(2016, 11, 3),
          end: new Date(2016, 11, 3),
        },
      ]}
    />
  ))
  .add('event at end of week', () => (
    <Calendar
      defaultDate={new Date(2016, 11, 3)}
      events={[
        {
          title: 'has time',
          start: moment(new Date(2016, 11, 3)).add(1, 'days').subtract(5, 'hours').toDate(),
          end: moment(new Date(2016, 11, 3)).add(1, 'days').subtract(4, 'hours').toDate(),
        },
      ]}
    />
  ))
  .add('event at start of week', () => (
    <Calendar
      defaultDate={new Date(2016, 11, 4)}
      events={[
        {
          title: 'has time',
          start: moment(new Date(2016, 11, 4)).add(1, 'days').subtract(5, 'hours').toDate(),
          end: moment(new Date(2016, 11, 4)).add(1, 'days').subtract(4, 'hours').toDate(),
        },
      ]}
    />
  ))
  .add('events on a constrained day column', () => (
    <Calendar
      defaultView={views.DAY}
      min={moment('8 am', 'h a').toDate()}
      max={moment('5 pm', 'h a').toDate()}
      events={eventsWithCustomSize}
    />
  ))
  .add('no duration', () => (
    /* should display all three events */
    <Calendar
      defaultDate={new Date(2016, 11, 4)}
      events={[
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
    <Calendar
      defaultDate={new Date(2015, 3, 1)}
      events={[
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

storiesOf('Resources', module).add('demo', () => (
  <Calendar
    events={resources.events}
    resources={resources.list}
    defaultView={views.DAY}
    defaultDate={new Date(2015, 3, 4)}
  />
));

storiesOf('Timeslots', module)
  .add('selectable, step 15, 4 timeslots', () => (
    <Calendar
      defaultView={views.WEEK}
      selectable
      timeslots={4}
      step={15}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      defaultDate={new Date()}
    />
  ))
  .add('selectable, step 10, 6 timeslots', () => (
    <Calendar
      selectable
      defaultView={views.WEEK}
      timeslots={6}
      step={10}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      defaultDate={new Date()}
    />
  ))
  .add('selectable, step 5, 6 timeslots', () => (
    <Calendar
      selectable
      defaultView={views.WEEK}
      timeslots={6}
      step={5}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      defaultDate={new Date()}
    />
  ))
  .add('selectable, 3 timeslots', () => (
    <Calendar
      defaultView={views.WEEK}
      selectable
      timeslots={3}
      getNow={() => moment('9:30am', 'h:mma').toDate()}
      min={moment('12:00am', 'h:mma').toDate()}
      max={moment('11:59pm', 'h:mma').toDate()}
      events={eventsWithCustomSize}
      onSelectEvent={action('event selected')}
      onSelectSlot={action('slot selected')}
      defaultDate={new Date()}
    />
  ));
