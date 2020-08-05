import overlap from './overlap';

function getMaxIdxDFS(node, maxIdx, visited) {
  let maxIndex = maxIdx;
  for (let i = 0; i < node.friends.length; i += 1) {
    if (visited.indexOf(node.friends[i]) > -1) {
      maxIndex = maxIdx > node.friends[i].idx ? maxIdx : node.friends[i].idx;
      // TODO : trace it by not object but kinda index or something for performance
      visited.push(node.friends[i]);
      const newIdx = getMaxIdxDFS(node.friends[i], maxIdx, visited);
      maxIndex = maxIdx > newIdx ? maxIdx : newIdx;
    }
  }
  return maxIndex;
}

const noOverlap = ({ appointments, minimumStartDifference, slotMetrics }) => {
  const styledAppointments = overlap({
    appointments,
    minimumStartDifference,
    slotMetrics,
  });

  styledAppointments.sort((a, b) => {
    const { style: aStyle } = a;
    const { style: bStyle } = b;
    if (aStyle.top !== bStyle.top) {
      return aStyle.top > bStyle.top ? 1 : -1;
    }

    return aStyle.top + aStyle.height < bStyle.top + bStyle.height ? 1 : -1;
  });

  for (let i = 0; i < styledAppointments.length; i += 1) {
    styledAppointments[i].friends = [];
    delete styledAppointments[i].style.left;
    delete styledAppointments[i].style.left;
    delete styledAppointments[i].idx;
    delete styledAppointments[i].size;
  }

  for (let i = 0; i < styledAppointments.length - 1; i += 1) {
    const se1 = styledAppointments[i];
    const y1 = se1.style.top;
    const y2 = se1.style.top + se1.style.height;

    for (let j = i + 1; j < styledAppointments.length; j += 1) {
      const se2 = styledAppointments[j];
      const y3 = se2.style.top;
      const y4 = se2.style.top + se2.style.height;

      // be friends when overlapped
      if ((y3 <= y1 && y1 < y4) || (y1 <= y3 && y3 < y2)) {
        // TODO : hashmap would be effective for performance
        se1.friends.push(se2);
        se2.friends.push(se1);
      }
    }
  }

  for (let i = 0; i < styledAppointments.length; i += 1) {
    const se = styledAppointments[i];
    const bitmap = [];
    for (let j = 0; j < 100; j += 1) {
      bitmap.push(1); // 1 means available
    }

    for (let j = 0; j < se.friends.length; j += 1) {
      if (se.friends[j].idx !== undefined) bitmap[se.friends[j].idx] = 0; // 0 means reserved
    }

    se.idx = bitmap.indexOf(1);
  }

  for (let i = 0; i < styledAppointments.length; i += 1) {
    let size = 0;

    if (styledAppointments[i].size) {
      const allFriends = [];
      const maxIdx = getMaxIdxDFS(styledAppointments[i], 0, allFriends);
      size = 100 / (maxIdx + 1);
      styledAppointments[i].size = size;

      for (let j = 0; j < allFriends.length; j += 1) {
        allFriends[j].size = size;
      }
    }
  }

  for (let i = 0; i < styledAppointments.length; i += 1) {
    const e = styledAppointments[i];
    e.style.left = e.idx * e.size;

    // stretch to maximum
    let maxIdx = 0;
    for (let j = 0; j < e.friends.length; j += 1) {
      const idx = e.friends[j];
      maxIdx = maxIdx > idx ? maxIdx : idx;
    }
    if (maxIdx <= e.idx) e.size = 100 - e.idx * e.size;

    // padding between appointments
    // for this feature, `width` is not percentage based unit anymore
    // it will be used with calc()
    const padding = e.idx === 0 ? 0 : 3;
    e.style.width = `calc(${e.size}% - ${padding}px)`;
    e.style.height = `calc(${e.style.height}% - 2px)`;
    e.style.xOffset = `calc(${e.style.left}% + ${padding}px)`;
  }

  return styledAppointments;
};

export default noOverlap;
