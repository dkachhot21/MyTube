export function parseFileName(fileName) {
  if (!fileName) {
    return {
      title: null,
      season: null,
      episode: null,
      stars: []
    };
  }

  // remove extension
  const clean = fileName.replace(/\.[^.]+$/, "");

  // split by " - "
  const parts = clean.split(" - ").map(p => p.trim());

  // ------------------------
  // Extract title
  // ------------------------
  const title = parts[1] || null;

  // ------------------------
  // Extract Sxx_Exx
  // ------------------------
  const se = parts[2] || "";
  const match = se.match(/S(\d+)_E(\d+)/i);

  let season = null;
  let episode = null;

  if (match) {
    season = parseInt(match[1]);
    episode = parseInt(match[2]);
  }

  // ------------------------
  // Extract stars (remaining parts)
  // ------------------------
  const stars = parts.slice(3);

  return {
    title,
    season,
    episode,
    stars
  };
}
