import EventWrapper from 'components/event-wrapper';
import BackgroundWrapper from 'components/background-wrapper';

export const components = {
  eventWrapper: EventWrapper,
  timeSlotWrapper: BackgroundWrapper,
  dateCellWrapper: BackgroundWrapper,
};

export { default as Calendar } from 'components/calendar';
export { DateLocalizer } from 'utils/localizer';
export { default as momentLocalizer } from './localizers/moment';
export { default as globalizeLocalizer } from './localizers/globalize';
export { default as dateFnsLocalizer } from './localizers/date-fns';
export { default as move } from 'utils/move';
export { views as Views, navigate as Navigate } from 'utils/constants';
