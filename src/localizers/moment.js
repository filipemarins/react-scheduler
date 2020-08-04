import * as dates from 'utils/dates';
import { DateLocalizer } from 'utils/localizer';

const dateRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'L', culture)} – ${local.format(end, 'L', culture)}`;

const timeRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'LT', culture)} – ${local.format(end, 'LT', culture)}`;

const timeRangeStartFormat = ({ start }, culture, local) =>
  `${local.format(start, 'LT', culture)} – `;

const timeRangeEndFormat = ({ end }, culture, local) => ` – ${local.format(end, 'LT', culture)}`;

const weekRangeFormat = ({ start, end }, culture, local) =>
  `${local.format(start, 'MMMM DD', culture)} – ${local.format(
    end,
    dates.eq(start, end, 'month') ? 'DD' : 'MMMM DD',
    culture
  )}`;

export const formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',

  selectRangeFormat: timeRangeFormat,
  appointmentTimeRangeFormat: timeRangeFormat,
  appointmentTimeRangeStartFormat: timeRangeStartFormat,
  appointmentTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'LT',

  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
};

export default function (moment) {
  const locale = (m, c) => (c ? m.locale(c) : m);

  return new DateLocalizer({
    formats,
    firstOfWeek(culture) {
      const data = culture ? moment.localeData(culture) : moment.localeData();
      return data ? data.firstDayOfWeek() : 0;
    },

    format(value, format, culture) {
      return locale(moment(value), culture).format(format);
    },
  });
}
