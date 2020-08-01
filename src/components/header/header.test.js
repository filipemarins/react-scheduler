import React from 'react';
import { render } from 'tests/utils';

import Header from './header';

describe('Header', () => {
  it('should render a header with label text', () => {
    const { getByText } = render(<Header label="test" />);

    expect(getByText('test')).toBeInTheDocument();
  });
});
