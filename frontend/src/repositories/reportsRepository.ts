import {
  fetchUserHistory,
  fetchTopArtists,
  fetchTopAlbums,
  fetchTopTracks,
  HistorySong,
  TopArtist,
  TopAlbum,
  TopTrack,
} from './historyRepository';

// Re-export types for convenience
export type { HistorySong, TopArtist, TopAlbum, TopTrack };

/**
 * A fingerprint of your listening habits, on a 0–100 scale.
 */
export interface Fingerprint {
  consistency: number;    // % of days with at least one play (over last 30 days)
  discoveryRate: number;  // % of unique tracks vs. total plays (last 30d)
  variance: number;       // normalized day-to-day play variance
  concentration: number;  // % of plays in your top-5 busiest days
  replayRate: number;     // avg plays per unique track, scaled to 0–100
}

/**
 * Shape of music-ratio data, comparing current vs a previous period.
 */
export interface RawMusicRatio {
  tracks: number;
  albums: number;
  artists: number;
  lastTracks: number;
  lastAlbums: number;
  lastArtists: number;
}

/**
 * Wraps historyRepository.fetchTopArtists
 */
export async function getTopArtists(
  userId: string,
  limit: number = 5
): Promise<TopArtist[]> {
  return fetchTopArtists(userId, limit);
}

/**
 * Wraps historyRepository.fetchTopAlbums
 */
export async function getTopAlbums(
  userId: string,
  limit: number = 5
): Promise<TopAlbum[]> {
  return fetchTopAlbums(userId, limit);
}

/**
 * Wraps historyRepository.fetchTopTracks
 */
export async function getTopTracks(
  userId: string,
  limit: number = 5
): Promise<TopTrack[]> {
  return fetchTopTracks(userId, limit);
}

/**
 * Fetch the user's raw listening history for reports.
 * Fetches all available history by paginating through results.
 */
export async function fetchReports(
  userId: string,
  _since?: string
): Promise<HistorySong[]> {
  try {
    // Fetch a large batch for reports - the backend will limit appropriately
    const allHistory: HistorySong[] = [];
    let skip = 0;
    const batchSize = 200;
    let hasMore = true;
    
    // Paginate to get full history (with a reasonable cap)
    while (hasMore && allHistory.length < 2000) {
      const batch = await fetchUserHistory(userId, skip, batchSize);
      if (batch.length === 0) {
        hasMore = false;
      } else {
        allHistory.push(...batch);
        skip += batch.length;
        if (batch.length < batchSize) {
          hasMore = false;
        }
      }
    }
    
    return allHistory;
  } catch (err) {
    console.error('Error in fetchReports:', err);
    throw err;
  }
}

/**
 * Compute the user's "Music Ratio":
 *   • # unique tracks
 *   • # unique albums
 *   • # unique artists
 * over the last `days` days, compared to the previous `days`.
 */
export async function getMusicRatio(
  userId: string,
  days: number = 30
): Promise<RawMusicRatio> {
  const history = await fetchUserHistory(userId);
  const now = Date.now();
  const periodMs = days * 24 * 60 * 60 * 1000;
  const startCurrent = now - periodMs;
  const startLast = now - 2 * periodMs;
  const endLast = startCurrent;

  const slice = (arr: HistorySong[], from: number, to: number) =>
    arr.filter(h => {
      const t = new Date(h.played_at).getTime();
      return t >= from && t < to;
    });

  const currentPeriod = slice(history, startCurrent, now);
  const lastPeriod = slice(history, startLast, endLast);

  const countUniques = (arr: HistorySong[], key: keyof HistorySong) =>
    new Set(arr.map(h => h[key] as string)).size;

  const tracks = countUniques(currentPeriod, 'track_id');
  const albums = countUniques(currentPeriod, 'album_id');
  const artists = countUniques(currentPeriod, 'artist_id');

  const lastTracks = countUniques(lastPeriod, 'track_id');
  const lastAlbums = countUniques(lastPeriod, 'album_id');
  const lastArtists = countUniques(lastPeriod, 'artist_id');

  return { tracks, albums, artists, lastTracks, lastAlbums, lastArtists };
}

/**
 * Compute a Listening Fingerprint over the last 30 days.
 */
export async function getListeningFingerprint(
  userId: string
): Promise<Fingerprint> {
  const history = await fetchUserHistory(userId);

  // only keep plays from the last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = history.filter(
    h => new Date(h.played_at).getTime() >= thirtyDaysAgo
  );

  // aggregate plays per day
  const byDay: Record<string, number> = {};
  recent.forEach(h => {
    const day = new Date(h.played_at).toDateString();
    byDay[day] = (byDay[day] || 0) + 1;
  });

  const dayCounts = Object.values(byDay);
  const daysWithPlays = dayCounts.length;
  const totalPlays = dayCounts.reduce((sum, c) => sum + c, 0);

  // 1) Consistency: what % of the last 30 days had any plays?
  const consistency = Math.round((daysWithPlays / 30) * 100);

  // 2) Discovery Rate: % of plays that were unique tracks
  const uniqueTracks = new Set(recent.map(h => h.track_id)).size;
  const discoveryRate = totalPlays > 0
    ? Math.round((uniqueTracks / totalPlays) * 100)
    : 0;

  // 3) Variance: normalized stddev of daily play counts
  const mean = daysWithPlays > 0 ? totalPlays / daysWithPlays : 0;
  const varianceRaw = daysWithPlays > 0
    ? Math.sqrt(
        dayCounts.reduce((sum, c) => sum + (c - mean) ** 2, 0) /
        daysWithPlays
      )
    : 0;
  const variance = mean > 0
    ? Math.round(Math.min((varianceRaw / mean) * 100, 100))
    : 0;

  // 4) Concentration: % of total plays that occurred on your top-5 days
  const top5Sum = [...dayCounts]
    .sort((a, b) => b - a)
    .slice(0, 5)
    .reduce((sum, c) => sum + c, 0);
  const concentration = totalPlays > 0
    ? Math.round((top5Sum / totalPlays) * 100)
    : 0;

  // 5) Replay Rate: avg plays per unique track, scaled to 0–100
  const replayRateRaw = uniqueTracks > 0 ? recent.length / uniqueTracks : 0;
  const replayRate = Math.min(Math.round(replayRateRaw * 10), 100);

  return { consistency, discoveryRate, variance, concentration,  replayRate };
}

/**
 * Compute the distribution of plays by hour of day (0–23).
 */
export async function getListeningClock(
  userId: string
): Promise<number[]> {
  const history = await fetchUserHistory(userId);
  const counts = Array<number>(24).fill(0);
  history.forEach(h => {
    const hr = new Date(h.played_at).getHours();
    counts[hr]++;
  });
  return counts;
}
