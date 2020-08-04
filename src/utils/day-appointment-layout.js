/* eslint no-unused-vars: "off" */
import { isFunction } from 'lodash-es';

import overlap from './layout-algorithms/overlap';
import noOverlap from './layout-algorithms/no-overlap';

const DefaultAlgorithms = {
  overlap,
  'no-overlap': noOverlap,
};

export function getStyledAppointments({
  appointments,
  minimumStartDifference,
  slotMetrics,
  accessors,
  dayLayoutAlgorithm, // one of DefaultAlgorithms keys
  // or custom function
}) {
  let algorithm = dayLayoutAlgorithm;

  if (dayLayoutAlgorithm in DefaultAlgorithms) algorithm = DefaultAlgorithms[dayLayoutAlgorithm];

  if (!isFunction(algorithm)) {
    // invalid algorithm
    return [];
  }

  return algorithm.apply(this, arguments);
}
