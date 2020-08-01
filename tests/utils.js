import React from 'react';
import { render } from '@testing-library/react';

// eslint-disable-next-line react/prop-types
const AllTheProviders = ({ children }) => {
  // TODO: Add providers here
  return <>{children}</>;
};

const renderWithAllProviders = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { renderWithAllProviders as render };
