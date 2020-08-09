import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import clsx from 'clsx';

import * as dates from 'utils/dates';
import { dateCellSelection, getSlotAtX, pointInBox } from 'utils/selection';
import Selection, { getBoundsForNode, isAppointment } from 'components/shared/selection';

class BackgroundCells extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selecting: false,
    };
  }

  componentDidMount() {
    this.props.selectable && this._selectable();
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable();

    if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();
  }

  _selectable() {
    const node = findDOMNode(this);
    const selector = (this._selector = new Selection(this.props.container));

    const selectorClicksHandler = (point, actionType) => {
      if (!isAppointment(findDOMNode(this), point)) {
        const rowBox = getBoundsForNode(node);
        const { range, rtl } = this.props;

        if (pointInBox(rowBox, point)) {
          const currentCell = getSlotAtX(rowBox, point.x, rtl, range.length);

          this._selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          });
        }
      }

      this._initial = {};
      this.setState({ selecting: false });
    };

    selector.on('selecting', (box) => {
      const { range, rtl } = this.props;

      let startIdx = -1;
      let endIdx = -1;

      if (!this.state.selecting) {
        this.props.onSelectStart(box);
        this._initial = { x: box.x, y: box.y };
      }
      if (selector.isSelected(node)) {
        const nodeBox = getBoundsForNode(node);
        ({ startIdx, endIdx } = dateCellSelection(this._initial, nodeBox, box, range.length, rtl));
      }

      this.setState({
        selecting: true,
        startIdx,
        endIdx,
      });
    });

    selector.on('beforeSelect', (box) => {
      if (this.props.selectable !== 'ignoreAppointments') return;

      return !isAppointment(findDOMNode(this), box);
    });

    selector.on('click', (point) => selectorClicksHandler(point, 'click'));

    selector.on('doubleClick', (point) => selectorClicksHandler(point, 'doubleClick'));

    selector.on('select', (bounds) => {
      this._selectSlot({ ...this.state, action: 'select', bounds });
      this._initial = {};
      this.setState({ selecting: false });
      this.props.onSelectEnd(this.state);
    });
  }

  _teardownSelectable() {
    if (!this._selector) return;
    this._selector.teardown();
    this._selector = null;
  }

  _selectSlot({ endIdx, startIdx, action, bounds, box }) {
    if (endIdx !== -1 && startIdx !== -1) {
      this.props.onSelectSlot &&
        this.props.onSelectSlot({
          start: startIdx,
          end: endIdx,
          action,
          bounds,
          box,
        });
    }
  }

  render() {
    const {
      range,
      currentDate,
      components: { dateCellWrapper: Wrapper },
    } = this.props;
    const { selecting, startIdx, endIdx } = this.state;

    return (
      <div className="rbc-row-bg">
        {range.map((date, index) => {
          const selected = selecting && index >= startIdx && index <= endIdx;

          return (
            <Wrapper key={index} value={date} range={range}>
              <div
                className={clsx(
                  'rbc-day-bg',
                  selected && 'rbc-selected-cell',
                  dates.eq(date, currentDate, 'day') && 'rbc-today',
                  currentDate &&
                    dates.month(currentDate) !== dates.month(date) &&
                    'rbc-off-range-bg'
                )}
              />
            </Wrapper>
          );
        })}
      </div>
    );
  }
}

BackgroundCells.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,

  components: PropTypes.object.isRequired,

  container: PropTypes.func,
  selectable: PropTypes.oneOf([true, false, 'ignoreAppointments']),

  onSelectSlot: PropTypes.func.isRequired,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,

  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string,
};

export default BackgroundCells;
