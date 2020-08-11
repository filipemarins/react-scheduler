import React from 'react';
import {
  arrayOf,
  bool,
  elementType,
  func,
  instanceOf,
  node,
  number,
  shape,
  string,
} from 'prop-types';
import { uncontrollable } from 'uncontrollable';
import clsx from 'clsx';
import { transform, mapValues } from 'lodash-es';

import { views as componentViews } from 'utils/prop-types';
import { navigate, views } from 'utils/constants';
import { mergeWithDefaults } from 'utils/localizer';
import defaultMessages from 'utils/messages';
import moveDate from 'utils/move';
import { SchedulerProvider } from 'utils/scheduler-context';
import NoopWrapper from 'components/shared/noop-wrapper';

import VIEWS from './views';
import Toolbar from './toolbar';

const viewNames = (_views) => {
  return !Array.isArray(_views) ? Object.keys(_views) : _views;
};

const isValidView = (view, { views: _views }) => {
  const names = viewNames(_views);
  return names.indexOf(view) !== -1;
};

const Scheduler = ({
  appointments,
  components,
  culture,
  currentDate,
  formats,
  length,
  localizer,
  max,
  messages,
  min,
  onChangeView,
  onCurrentDateChange,
  onDayClick,
  onDoubleClickAppointment,
  onRangeChange,
  onSelectAppointment,
  rtl,
  selectedAppointment,
  showMultiDayTimes,
  view,
  views,
}) => {
  const getViews = () => {
    if (Array.isArray(views)) {
      return transform(views, (obj, name) => (obj[name] = VIEWS[name]), {});
    }

    if (typeof views === 'object') {
      return mapValues(views, (value, key) => {
        if (value === true) {
          return VIEWS[key];
        }

        return value;
      });
    }

    return VIEWS;
  };

  const getView = () => {
    const currentView = getViews();

    return currentView[view];
  };

  const handleRangeChange = (date, ViewComponent) => {
    if (ViewComponent.range) {
      onRangeChange(ViewComponent.range(date, { localizer }), view);
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('onRangeChange prop not supported for this view');
    }
  };

  const handleCurrentDayChange = (action, newDate) => {
    const ViewComponent = getView();
    const today = currentDate;

    const movedDate = moveDate(ViewComponent, {
      action,
      date: newDate || currentDate,
      today,
    });

    onCurrentDateChange(movedDate, view, action);
    handleRangeChange(movedDate, ViewComponent);
  };

  const handleViewChange = (nextView) => {
    const ViewComponent = getView();

    if (nextView !== view && isValidView(view, { views })) {
      onChangeView(nextView);
    }

    handleRangeChange(currentDate, ViewComponent);
  };

  const handleSelectAppointment = (args) => {
    onSelectAppointment(args);
  };

  const handleDoubleClickAppointment = (args) => {
    onDoubleClickAppointment(args);
  };

  const handleDayClick = (nextDate) => {
    if (onDayClick) {
      onDayClick(nextDate, views.DAY);
      return;
    }
    if (views.DAY) {
      handleViewChange(views.DAY);
    }

    handleCurrentDayChange(navigate.DATE, nextDate);
  };

  const normalizeLocalizer = mergeWithDefaults(localizer, culture, formats, {
    ...defaultMessages,
    ...messages,
  });
  const normalizeViews = viewNames(views);

  const View = getView();

  const SchedulerToolbar = components?.toolbar || Toolbar;
  const label = View.title(currentDate, { localizer: normalizeLocalizer, length });

  const defaultComponents = {
    appointmentWrapper: NoopWrapper,
    appointmentContainerWrapper: NoopWrapper,
    dateCellWrapper: NoopWrapper,
    weekWrapper: NoopWrapper,
    timeSlotWrapper: NoopWrapper,
    ...components,
  };

  // Now is provider but it will be replaced for custom hooks later
  const schedulerContext = {
    appointments,
    components: defaultComponents,
    culture,
    currentDate,
    length,
    localizer: normalizeLocalizer,
    max,
    min,
    onChangeView,
    onCurrentDateChange: handleCurrentDayChange,
    onDayClick: handleDayClick,
    onDoubleClickAppointment: handleDoubleClickAppointment,
    onSelectAppointment: handleSelectAppointment,
    rtl,
    selectedAppointment,
    showMultiDayTimes,
    views: normalizeViews,
  };

  return (
    <SchedulerProvider value={schedulerContext}>
      <div className={clsx('rbc-calendar', rtl && 'rbc-rtl')}>
        <SchedulerToolbar label={label} />
        <View
          appointments={appointments}
          currentDate={currentDate}
          length={length}
          localizer={normalizeLocalizer}
          components={defaultComponents}
          showMultiDayTimes={showMultiDayTimes}
          onCurrentDateChange={handleCurrentDayChange}
          onDayClick={handleDayClick}
          onSelectAppointment={handleSelectAppointment}
          onDoubleClickAppointment={handleDoubleClickAppointment}
        />
      </div>
    </SchedulerProvider>
  );
};

Scheduler.propTypes = {
  appointments: arrayOf(
    shape({
      end: instanceOf(Date),
      start: instanceOf(Date),
    })
  ),
  components: shape({
    agenda: shape({
      appointment: elementType,
      date: elementType,
      time: elementType,
    }),
    appointment: elementType,
    appointmentContainerWrapper: elementType,
    appointmentWrapper: elementType,
    dateCellWrapper: elementType,
    day: shape({
      appointment: elementType,
      header: elementType,
    }),
    month: shape({
      appointment: elementType,
      dateHeader: elementType,
      header: elementType,
    }),
    timeGutterHeader: elementType,
    timeSlotWrapper: elementType,
    toolbar: elementType,
    week: shape({
      appointment: elementType,
      header: elementType,
    }),
  }),
  culture: string,
  currentDate: instanceOf(Date),
  formats: shape({}),
  length: number,
  localizer: shape({}).isRequired,
  max: instanceOf(Date),
  messages: shape({
    agenda: node,
    allDay: node,
    appointment: node,
    date: node,
    day: node,
    month: node,
    next: node,
    noAppointmentsInRange: node,
    previous: node,
    showMore: func,
    time: node,
    today: node,
    week: node,
  }),
  min: instanceOf(Date),
  onChangeView: func,
  onCurrentDateChange: func,
  onDayClick: func,
  onDoubleClickAppointment: func,
  onRangeChange: func,
  onSelectAppointment: func,
  rtl: bool,
  selectedAppointment: shape({}),
  showMultiDayTimes: bool,
  view: string,
  views: componentViews,
};

Scheduler.defaultProps = {
  appointments: [],
  view: views.WEEK,
  views: [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
  length: 30,
  formats: {},
  culture: 'en-US',
  rtl: false,
  selectedAppointment: {},
  showMultiDayTimes: true,
  onCurrentDateChange: () => {},
  onChangeView: () => {},
  onDayClick: () => {},
  onRangeChange: () => {},
  onSelectAppointment: () => {},
  onDoubleClickAppointment: () => {},
  components: {
    appointmentWrapper: NoopWrapper,
    appointmentContainerWrapper: NoopWrapper,
    dateCellWrapper: NoopWrapper,
    weekWrapper: NoopWrapper,
    timeSlotWrapper: NoopWrapper,
  },
  currentDate: new Date(),
  messages: defaultMessages,
};

export default uncontrollable(Scheduler, {
  view: 'onChangeView',
  currentDate: 'onCurrentDateChange',
  selectedAppointment: 'onSelectAppointment',
});
