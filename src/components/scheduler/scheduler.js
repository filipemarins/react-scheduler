/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { uncontrollable } from 'uncontrollable';
import clsx from 'clsx';
import { omit, defaults, transform, mapValues } from 'lodash-es';

import { dateFormat, dateRangeFormat, views as componentViews } from 'utils/prop-types';
import { notify } from 'utils/helpers';
import { navigate, views } from 'utils/constants';
import { mergeWithDefaults } from 'utils/localizer';
import message from 'utils/messages';
import moveDate from 'utils/move';

import NoopWrapper from 'components/shared/noop-wrapper';
import VIEWS from './views';
import Toolbar from './toolbar';

function viewNames(_views) {
  return !Array.isArray(_views) ? Object.keys(_views) : _views;
}

function isValidView(view, { views: _views }) {
  const names = viewNames(_views);
  return names.indexOf(view) !== -1;
}

class Scheduler extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      context: this.getContext(this.props),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ context: this.getContext(nextProps) });
  }

  // eslint-disable-next-line class-methods-use-this
  getContext({ view, views, localizer, culture, messages = {}, components = {}, formats = {} }) {
    const names = viewNames(views);
    const msgs = message(messages);
    return {
      viewNames: names,
      localizer: mergeWithDefaults(localizer, culture, formats, msgs),
      components: defaults(components[view] || {}, omit(components, names), {
        appointmentWrapper: NoopWrapper,
        appointmentContainerWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
        timeSlotWrapper: NoopWrapper,
      }),
    };
  }

  getViews = () => {
    const { views } = this.props;

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

  getView = () => {
    const views = this.getViews();

    return views[this.props.view];
  };

  /**
   *
   * @param date
   * @param viewComponent
   * @param {'month'|'week'|'work_week'|'day'|'agenda'} [view] - optional
   * parameter. It appears when range change on view changing. It could be handy
   * when you need to have both: range and view type at once, i.e. for manage rbc
   * state via url
   */
  handleRangeChange = (date, viewComponent, view) => {
    const { onRangeChange, localizer } = this.props;

    if (onRangeChange) {
      if (viewComponent.range) {
        onRangeChange(viewComponent.range(date, { localizer }), view);
      } else if (process.env.NODE_ENV !== 'production') {
        console.error('onRangeChange prop not supported for this view');
      }
    }
  };

  handleNavigate = (action, newDate) => {
    let { view, date, getNow, onNavigate, ...props } = this.props;
    const ViewComponent = this.getView();
    const today = getNow();

    date = moveDate(ViewComponent, {
      ...props,
      action,
      date: newDate || date || today,
      today,
    });

    onNavigate(date, view, action);
    this.handleRangeChange(date, ViewComponent);
  };

  handleViewChange = (view) => {
    if (view !== this.props.view && isValidView(view, this.props)) {
      this.props.onView(view);
    }

    const views = this.getViews();
    this.handleRangeChange(this.props.date || this.props.getNow(), views[view], view);
  };

  handleSelectAppointment = (...args) => {
    notify(this.props.onSelectAppointment, args);
  };

  handleDoubleClickAppointment = (...args) => {
    notify(this.props.onDoubleClickAppointment, args);
  };

  handleSelectSlot = (slotInfo) => {
    notify(this.props.onSelectSlot, slotInfo);
  };

  handleDayClick = (date) => {
    const { onDayClick } = this.props;
    if (onDayClick) {
      onDayClick(date, views.DAY);
      return;
    }
    if (views.DAY) this.handleViewChange(views.DAY);

    this.handleNavigate(navigate.DATE, date);
  };

  render() {
    let {
      view,
      toolbar,
      appointments,
      style,
      className,
      elementProps,
      date: current,
      getNow,
      length,
      showMultiDayTimes,
      onShowMore,
      components: _0,
      formats: _1,
      messages: _2,
      culture: _3,
      ...props
    } = this.props;

    current = current || getNow();

    const View = this.getView();
    const { components, localizer, viewNames } = this.state.context;

    const CalToolbar = components.toolbar || Toolbar;
    const label = View.title(current, { localizer, length });

    return (
      <div
        {...elementProps}
        className={clsx(className, 'rbc-calendar', props.rtl && 'rbc-rtl')}
        style={style}
      >
        {toolbar && (
          <CalToolbar
            date={current}
            view={view}
            views={viewNames}
            label={label}
            onView={this.handleViewChange}
            onNavigate={this.handleNavigate}
            localizer={localizer}
          />
        )}
        <View
          {...props}
          appointments={appointments}
          date={current}
          getNow={getNow}
          length={length}
          localizer={localizer}
          components={components}
          showMultiDayTimes={showMultiDayTimes}
          onNavigate={this.handleNavigate}
          onDayClick={this.handleDayClick}
          onSelectAppointment={this.handleSelectAppointment}
          onDoubleClickAppointment={this.handleDoubleClickAppointment}
          onSelectSlot={this.handleSelectSlot}
          onShowMore={onShowMore}
        />
      </div>
    );
  }
}

Scheduler.propTypes = {
  localizer: PropTypes.shape({}).isRequired,

  /**
   * Props passed to main scheduler `<div>`.
   *
   */
  elementProps: PropTypes.shape({}),

  /**
   * The current date value of the scheduler. Determines the visible view range.
   * If `date` is omitted then the result of `getNow` is used; otherwise the
   * current date is used.
   *
   * @controllable onNavigate
   */
  date: PropTypes.instanceOf(Date),

  /**
   * The current view of the scheduler.
   *
   * @default 'month'
   * @controllable onView
   */
  view: PropTypes.string,

  /**
   * The initial view set for the scheduler.
   * @type Scheduler.Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @default 'month'
   */
  defaultView: PropTypes.string,

  /**
   * An array of appointment objects to display on the scheduler. Appointments objects
   * can be any shape, as long as the scheduler knows how to retrieve the
   * following details of the appointment:
   *
   *  - start time
   *  - end time
   *  - title
   *  - whether its an "all day" appointment or not
   *
   *
   * ```js
   * Appointment {
   *   title: string,
   *   start: Date,
   *   end: Date,
   *   allDay?: boolean
   * }
   * ```
   */
  appointments: PropTypes.arrayOf(PropTypes.object),

  /**
   * Determines the current date/time which is highlighted in the views.
   *
   * The value affects which day is shaded and which time is shown as
   * the current time. It also affects the date used by the Today button in
   * the toolbar.
   *
   * Providing a value here can be useful when you are implementing time zones.
   *
   * @type {func}
   * @default () => new Date()
   */
  getNow: PropTypes.func,

  /**
   * Callback fired when the `date` value changes.
   *
   * @controllable date
   */
  onNavigate: PropTypes.func,

  /**
   * Callback fired when the `view` value changes.
   *
   * @controllable view
   */
  onView: PropTypes.func,

  /**
   * Callback fired when date header, or the truncated appointments links are clicked
   *
   */
  onDayClick: PropTypes.func,

  /**
   *
   * ```js
   * (dates: Date[] | { start: Date; end: Date }, view: 'month'|'week'|'work_week'|'day'|'agenda'|undefined) => void
   * ```
   *
   * Callback fired when the visible date range changes. Returns an Array of dates
   * or an object with start and end dates for BUILTIN views. Optionally new `view`
   * will be returned when callback called after view change.
   *
   * Custom views may return something different.
   */
  onRangeChange: PropTypes.func,

  /**
   * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
   *
   * ```js
   * (
   *   slotInfo: {
   *     start: Date,
   *     end: Date,
   *     slots: Array<Date>,
   *     action: "select" | "click" | "doubleClick",
   *     bounds: ?{ // For "select" action
   *       x: number,
   *       y: number,
   *       top: number,
   *       right: number,
   *       left: number,
   *       bottom: number,
   *     },
   *     box: ?{ // For "click" or "doubleClick" actions
   *       clientX: number,
   *       clientY: number,
   *       x: number,
   *       y: number,
   *     },
   *   }
   * ) => any
   * ```
   */
  onSelectSlot: PropTypes.func,

  /**
   * Callback fired when a scheduler appointment is selected.
   *
   * ```js
   * (appointment: Object, e: SyntheticAppointment) => any
   * ```
   *
   * @controllable selected
   */
  onSelectAppointment: PropTypes.func,

  /**
   * Callback fired when a scheduler appointment is clicked twice.
   *
   * ```js
   * (appointment: Object, e: SyntheticAppointment) => void
   * ```
   */
  onDoubleClickAppointment: PropTypes.func,

  /**
   * Callback fired when dragging a selection in the Time views.
   *
   * Returning `false` from the handler will prevent a selection.
   *
   * ```js
   * (range: { start: Date, end: Date }) => ?boolean
   * ```
   */
  onSelecting: PropTypes.func,

  /**
   * Callback fired when a +{count} more is clicked
   *
   * ```js
   * (appointments: Object, date: Date) => any
   * ```
   */
  onShowMore: PropTypes.func,

  /**
   * The selected appointment, if any.
   */
  selected: PropTypes.object,

  /**
   * An array of built-in view names to allow the scheduler to display.
   * accepts either an array of builtin view names,
   *
   * ```jsx
   * views={['month', 'day', 'agenda']}
   * ```
   * or an object hash of the view name and the component (or boolean for builtin).
   *
   * ```jsx
   * views={{
   *   month: true,
   *   week: false,
   *   myweek: WorkWeekViewComponent,
   * }}
   * ```
   *
   * Custom views can be any React component, that implements the following
   * interface:
   *
   * ```js
   * interface View {
   *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
   *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
   * }
   * ```
   *
   * @type Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @View
   ['month', 'week', 'day', 'agenda']
   */
  views: componentViews,

  /**
   * Determines the end date from date prop in the agenda view
   * date prop + length (in number of days) = end date
   */
  length: PropTypes.number,

  /**
   * Determines whether the toolbar is displayed
   */
  toolbar: PropTypes.bool,

  /**
   * Allows mouse selection of ranges of dates/times.
   *
   * The 'ignoreAppointments' option prevents selection code from running when a
   * drag begins over an appointment. Useful when you want custom appointment click or drag
   * logic
   */
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),

  /**
   * Determines the selectable time increments in week and day views, in minutes.
   */
  step: PropTypes.number,

  /**
   * The number of slots per "section" in the time grid views. Adjust with `step`
   * to change the default of 1 hour long groups, with 30 minute slots.
   */
  timeslots: PropTypes.number,

  /**
   *Switch the scheduler to a `right-to-left` read direction.
   */
  rtl: PropTypes.bool,

  /**
   * Support to show multi-day appointments with specific start and end times in the
   * main time grid (rather than in the all day header).
   *
   * **Note: This may cause schedulers with several appointments to look very busy in
   * the week and day views.**
   */
  showMultiDayTimes: PropTypes.bool,

  /**
   * Constrains the minimum _time_ of the Day and Week views.
   */
  min: PropTypes.instanceOf(Date),

  /**
   * Constrains the maximum _time_ of the Day and Week views.
   */
  max: PropTypes.instanceOf(Date),

  /**
   * Determines how far down the scroll pane is initially scrolled down.
   */
  scrollToTime: PropTypes.instanceOf(Date),

  /**
   * Specify a specific culture code for the scheduler.
   *
   * **Note: it's generally better to handle this globally via your i18n library.**
   */
  culture: PropTypes.string,

  /**
   * Localizer specific formats, tell the scheduler how to format and display dates.
   *
   * `format` types are dependent on the configured localizer; both Moment and Globalize
   * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
   *
   * ```jsx
   * let formats = {
   *   dateFormat: 'dd',
   *
   *   dayFormat: (date, , localizer) =>
   *     localizer.format(date, 'DDD', culture),
   *
   *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
   *     localizer.format(start, { date: 'short' }, culture) + ' – ' +
   *     localizer.format(end, { date: 'short' }, culture)
   * }
   *
   * <Scheduler formats={formats} />
   * ```
   *
   * All localizers accept a function of
   * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
   */
  formats: PropTypes.shape({
    /**
     * Format for the day of the month heading in the Month view.
     * e.g. "01", "02", "03", etc
     */
    dateFormat,

    /**
     * A day of the week format for Week and Day headings,
     * e.g. "Wed 01/04"
     *
     */
    dayFormat: dateFormat,

    /**
     * Week day name format for the Month week day headings,
     * e.g: "Sun", "Mon", "Tue", etc
     *
     */
    weekdayFormat: dateFormat,

    /**
     * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
     */
    timeGutterFormat: dateFormat,

    /**
     * Toolbar header format for the Month view, e.g "2015 April"
     *
     */
    monthHeaderFormat: dateFormat,

    /**
     * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
     */
    dayRangeHeaderFormat: dateRangeFormat,

    /**
     * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
     */
    dayHeaderFormat: dateFormat,

    /**
     * Toolbar header format for the Agenda view, e.g. "4/1/2015 – 5/1/2015"
     */
    agendaHeaderFormat: dateRangeFormat,

    /**
     * A time range format for selecting time slots, e.g "8:00am – 2:00pm"
     */
    selectRangeFormat: dateRangeFormat,

    agendaDateFormat: dateFormat,
    agendaTimeFormat: dateFormat,
    agendaTimeRangeFormat: dateRangeFormat,

    /**
     * Time range displayed on appointments.
     */
    appointmentTimeRangeFormat: dateRangeFormat,

    /**
     * An optional appointment time range for appointments that continue onto another day
     */
    appointmentTimeRangeStartFormat: dateFormat,

    /**
     * An optional appointment time range for appointments that continue from another day
     */
    appointmentTimeRangeEndFormat: dateFormat,
  }),

  /**
   * Customize how different sections of the scheduler render by providing custom Components.
   * In particular the `Appointment` component can be specified for the entire scheduler, or you can
   * provide an individual component for each view type.
   *
   * ```jsx
   * const components = {
   *   appointment: MyAppointment, // used by each view (Month, Day, Week)
   *   appointmentWrapper: MyAppointmentWrapper,
   *   appointmentContainerWrapper: MyAppointmentContainerWrapper,
   *   dateCellWrapper: MyDateCellWrapper,
   *   timeSlotWrapper: MyTimeSlotWrapper,
   *   timeGutterHeader: MyTimeGutterWrapper,
   *   toolbar: MyToolbar,
   *   agenda: {
   *   	 appointment: MyAgendaAppointment // with the agenda view use a different component to render appointments
   *     time: MyAgendaTime,
   *     date: MyAgendaDate,
   *   },
   *   day: {
   *     header: MyDayHeader,
   *     appointment: MyDayAppointment,
   *   },
   *   week: {
   *     header: MyWeekHeader,
   *     appointment: MyWeekAppointment,
   *   },
   *   month: {
   *     header: MyMonthHeader,
   *     dateHeader: MyMonthDateHeader,
   *     appointment: MyMonthAppointment,
   *   }
   * }
   * <Scheduler components={components} />
   * ```
   */
  components: PropTypes.shape({
    appointment: PropTypes.elementType,
    appointmentWrapper: PropTypes.elementType,
    appointmentContainerWrapper: PropTypes.elementType,
    dateCellWrapper: PropTypes.elementType,
    timeSlotWrapper: PropTypes.elementType,
    timeGutterHeader: PropTypes.elementType,
    toolbar: PropTypes.elementType,

    agenda: PropTypes.shape({
      date: PropTypes.elementType,
      time: PropTypes.elementType,
      appointment: PropTypes.elementType,
    }),

    day: PropTypes.shape({
      header: PropTypes.elementType,
      appointment: PropTypes.elementType,
    }),
    week: PropTypes.shape({
      header: PropTypes.elementType,
      appointment: PropTypes.elementType,
    }),
    month: PropTypes.shape({
      header: PropTypes.elementType,
      dateHeader: PropTypes.elementType,
      appointment: PropTypes.elementType,
    }),
  }),

  /**
   * String messages used throughout the component, override to provide localizations
   */
  messages: PropTypes.shape({
    allDay: PropTypes.node,
    previous: PropTypes.node,
    next: PropTypes.node,
    today: PropTypes.node,
    month: PropTypes.node,
    week: PropTypes.node,
    day: PropTypes.node,
    agenda: PropTypes.node,
    date: PropTypes.node,
    time: PropTypes.node,
    appointment: PropTypes.node,
    noAppointmentsInRange: PropTypes.node,
    showMore: PropTypes.func,
  }),
};

Scheduler.defaultProps = {
  elementProps: {},
  toolbar: true,
  view: views.MONTH,
  views: [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
  step: 30,
  length: 30,

  getNow: () => new Date(),
};

export default uncontrollable(Scheduler, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectAppointment',
});
