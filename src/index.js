import NoopWrapper from 'components/shared/noop-wrapper';

export const components = {
  eventWrapper: NoopWrapper,
  timeSlotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
};

export { default as Calendar } from 'components/calendar';
export { DateLocalizer } from 'utils/localizer';
export { default as momentLocalizer } from './localizers/moment';
export { default as globalizeLocalizer } from './localizers/globalize';
export { default as dateFnsLocalizer } from './localizers/date-fns';
export { default as move } from 'utils/move';
export { views, navigate } from 'utils/constants';
