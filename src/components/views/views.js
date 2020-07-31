import { views } from 'utils/constants';
import Month from 'components/month';
import Day from 'components/day';
import Week from 'components/week';
import WorkWeek from 'components/work-week';
import Agenda from 'components/agenda';

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
};

export default VIEWS;
