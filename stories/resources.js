import React from 'react';
import { storiesOf } from '@storybook/react';

import { DragableCalendar } from './helpers';
import resources from './helpers/resource-events';

storiesOf('Resources', module).add('demo', () => (
  <DragableCalendar events={resources.events} resources={resources.list} />
));
