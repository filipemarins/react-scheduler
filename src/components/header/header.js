import React from 'react';
import { node } from 'prop-types';

const Header = ({ label }) => {
  return <span>{label}</span>;
};

Header.propTypes = {
  label: node,
};

Header.defaultProps = {
  label: null,
};

export default Header;
