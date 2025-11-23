export function extractMediaInfo(dataList) {
  if (!Array.isArray(dataList)) return [];

  const mediaItems = [];
  const internalIds = [];

  for (const item of dataList) {
    if (!Array.isArray(item) || item.length < 2) continue;

    const internalId = item[0] || null; // <-- corrected
    const mediaInfo = item[1];
    if (!mediaInfo || !Array.isArray(mediaInfo)) continue;

    const url = mediaInfo[0] || null;
    const width = mediaInfo[1] || null;
    const height = mediaInfo[2] || null;

    const timestampTaken = item[2] || null;
    const timestampUploaded = item[5] || null;

    const metaData = item[9] || null;
    let durationMs = null;
    if (metaData && typeof metaData === "object") {
      for (const key of Object.keys(metaData)) {
        const block = metaData[key];

        // Must be an array
        if (!Array.isArray(block)) continue;

        // block[0] should be duration in ms (your confirmed value)
        if (
          typeof block[0] === "number" &&
          block[0] > 1000 && // duration must be > 1 sec
          block[2] <= width && // width matches
          block[3] <= height // height matches
        ) {
          durationMs = block[0];
          break;
        }
      }
    }
    internalIds.push(internalId);
    mediaItems.push({
      internalId,
      url,
      width,
      height,
      Duration: durationMs,
      timestampTaken,
      timestampUploaded,
    });
  }

  return [internalIds, mediaItems];
}


export function extractDataArray(block) {
  const dataPos = block.indexOf("data:");
  if (dataPos === -1) return null;

  let i = dataPos + 5;
  while (block[i] && !/[[]/.test(block[i])) i++;
  if (!block[i] || block[i] !== "[") return null;

  let bracketCount = 0;
  let start = i;
  let end = i;

  while (end < block.length) {
    if (block[end] === "[") bracketCount++;
    else if (block[end] === "]") bracketCount--;

    end++;
    if (bracketCount === 0) break;
  }

  return block.slice(start, end);
}