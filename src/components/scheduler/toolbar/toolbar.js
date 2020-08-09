import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import SchedulerContext from 'components/scheduler/scheduler-context';

import { navigate } from 'utils/constants';

const Toolbar = ({ label }) => {
  const {
    views: viewNames,
    view,
    onCurrentDateChange,
    onChangeView,
    localizer: { messages },
  } = useContext(SchedulerContext);

  const handleCurrentDateChange = (action) => {
    onCurrentDateChange(action);
  };

  const handleChangeView = (nextView) => {
    onChangeView(nextView);
  };

  const viewNamesGroup = () => {
    if (viewNames.length > 1) {
      return viewNames.map((name) => (
        <button
          type="button"
          key={name}
          className={clsx({ 'rbc-active': view === name })}
          onClick={handleChangeView.bind(null, name)}
        >
          {messages[name]}
        </button>
      ));
    }
    return false;
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={handleCurrentDateChange.bind(null, navigate.TODAY)}>
          {messages.today}
        </button>
        <button type="button" onClick={handleCurrentDateChange.bind(null, navigate.PREVIOUS)}>
          {messages.previous}
        </button>
        <button type="button" onClick={handleCurrentDateChange.bind(null, navigate.NEXT)}>
          {messages.next}
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">{viewNamesGroup()}</span>
    </div>
  );
};

Toolbar.propTypes = {
  label: PropTypes.node.isRequired,
};

export default Toolbar;
