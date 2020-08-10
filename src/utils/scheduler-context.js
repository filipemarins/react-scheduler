import React, { createContext } from 'react';
import { node, shape } from 'prop-types';

export const SchedulerContext = createContext({});

export const SchedulerProvider = ({ value, children }) => (
  <SchedulerContext.Provider value={value}>{children}</SchedulerContext.Provider>
);

SchedulerProvider.propTypes = {
  children: node.isRequired,
  value: shape({}).isRequired,
};
