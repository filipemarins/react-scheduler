import invariant from 'invariant';
import VIEWS from 'components/scheduler/views';
import { navigate } from './constants';

const moveDate = (View, { action, date, today, ...props }) => {
  const view = typeof View === 'string' ? VIEWS[View] : View;
  let movedDate;

  switch (action) {
    case navigate.TODAY:
      movedDate = today || new Date();
      break;
    case navigate.DATE:
      break;
    default:
      invariant(
        View && typeof view.navigate === 'function',
        'Calendar View components must implement a static `.navigate(date, action)` method.s'
      );
      movedDate = view.navigate(date, action, props);
  }
  return movedDate;
};

export default moveDate;
