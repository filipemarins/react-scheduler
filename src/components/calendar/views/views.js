import { views } from 'utils/constants';
import Month from './month';
import Day from './day';
import Week from './week';
import WorkWeek from './work-week';
import Agenda from './agenda';

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
};

export default VIEWS;
