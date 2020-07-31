import * as dates from 'utils/dates';
import { DateLocalizer } from 'utils/localizer';

const dateRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'd', culture)} – ${local.format(end, 'd', culture)}`;

const timeRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 't', culture)} – ${local.format(end, 't', culture)}`;

const timeRangeStartFormat = ({ start }, culture, local) =>
  `${local.format(start, 't', culture)} – `;

const timeRangeEndFormat = ({ end }, culture, local) => ` – ${local.format(end, 't', culture)}`;

const weekRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'MMM dd', culture)} – ${local.format(
    end,
    dates.eq(start, end, 'month') ? 'dd' : 'MMM dd',
    culture
  )}`;

export const formats = {
  dateFormat: 'dd',
  dayFormat: 'ddd dd/MM',
  weekdayFormat: 'ddd',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 't',

  monthHeaderFormat: 'Y',
  dayHeaderFormat: 'dddd MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ddd MMM dd',
  agendaTimeFormat: 't',
  agendaTimeRangeFormat: timeRangeFormat,
};

export default function (globalize) {
  function getCulture(culture) {
    return culture ? globalize.findClosestCulture(culture) : globalize.culture();
  }

  function firstOfWeek(culture) {
    culture = getCulture(culture);
    return (culture && culture.calendar.firstDay) || 0;
  }

  return new DateLocalizer({
    firstOfWeek,
    formats,
    format(value, format, culture) {
      return globalize.format(value, format, culture);
    },
  });
}
