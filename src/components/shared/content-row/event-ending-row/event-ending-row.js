import PropTypes from 'prop-types';
import React from 'react';
import { eventLevels } from 'utils/event-levels';
import range from 'lodash/range';
import EventRowMixin from '../event-row-mixin';

const isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;
const eventsInSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).length;

class EventEndingRow extends React.Component {
  render() {
    const {
      segments,
      slotMetrics: { slots },
    } = this.props;
    const rowSegments = eventLevels(segments).levels[0];

    let current = 1;
    let lastEnd = 1;
    const row = [];

    while (current <= slots) {
      const key = `_lvl_${current}`;

      const { event, left, right, span } =
        rowSegments.filter(seg => isSegmentInSlot(seg, current))[0] || {} //eslint-disable-line

      if (!event) {
        current++;
        continue;
      }

      const gap = Math.max(0, left - lastEnd);

      if (this.canRenderSlotEvent(left, span)) {
        const content = EventRowMixin.renderEvent(this.props, event);

        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, `${key}_gap`));
        }

        row.push(EventRowMixin.renderSpan(slots, span, key, content));

        lastEnd = current = right + 1;
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, `${key}_gap`));
        }

        row.push(EventRowMixin.renderSpan(slots, 1, key, this.renderShowMore(segments, current)));
        lastEnd = current += 1;
      }
    }

    return <div className="rbc-row">{row}</div>;
  }

  canRenderSlotEvent(slot, span) {
    const { segments } = this.props;

    return range(slot, slot + span).every((s) => {
      const count = eventsInSlot(segments, s);

      return count === 1;
    });
  }

  renderShowMore(segments, slot) {
    const { localizer } = this.props;
    const count = eventsInSlot(segments, slot);

    return count ? (
      <a
        key={`sm_${slot}`}
        href="#"
        className="rbc-show-more"
        onClick={(e) => this.showMore(slot, e)}
      >
        {localizer.messages.showMore(count)}
      </a>
    ) : (
      false
    );
  }

  showMore(slot, e) {
    e.preventDefault();
    this.props.onShowMore(slot, e.target);
  }
}

EventEndingRow.propTypes = {
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func,
  ...EventRowMixin.propTypes,
};

EventEndingRow.defaultProps = {
  ...EventRowMixin.defaultProps,
};

export default EventEndingRow;
