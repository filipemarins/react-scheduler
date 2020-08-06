import PropTypes from 'prop-types';
import { views as Views } from './constants';

const viewNames = Object.keys(Views).map((k) => Views[k]);

export const dateFormat = PropTypes.any;

export const dateRangeFormat = PropTypes.func;

/**
 * accepts either an array of builtin view names:
 *
 * ```
 * views={['month', 'day', 'agenda']}
 * ```
 *
 * or an object hash of the view name and the component (or boolean for builtin)
 *
 * ```
 * views={{
 *   month: true,
 *   week: false,
 *   workweek: WorkWeekViewComponent,
 * }}
 * ```
 */

export const views = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.oneOf(viewNames)),
  PropTypes.objectOf((prop, key, ...args) => {
    const isBuiltinView = viewNames.indexOf(key) !== -1 && typeof prop[key] === 'boolean';
    if (isBuiltinView) {
      return null;
    }
    return PropTypes.elementType(prop, key, ...args);
  }),
]);
