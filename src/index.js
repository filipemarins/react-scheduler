import NoopWrapper from 'components/shared/noop-wrapper';

export const components = {
  appointmentWrapper: NoopWrapper,
  timeSlotWrapper: NoopWrapper,
  dateCellWrapper: NoopWrapper,
};

export { default as Scheduler } from 'components/scheduler';
export { DateLocalizer } from 'utils/localizer';
export { default as momentLocalizer } from './localizers/moment';
export { default as globalizeLocalizer } from './localizers/globalize';
export { default as dateFnsLocalizer } from './localizers/date-fns';
export { default as move } from 'utils/move';
export { views, navigate } from 'utils/constants';
