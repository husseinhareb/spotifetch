// src/repositories/reportsRepository.ts

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
 * Delegates to fetchUserHistory, optionally since a given ISO timestamp.
 */
export async function fetchReports(
  userId: string,
  since?: string
): Promise<HistorySong[]> {
  try {
    const sinceMs = since ? Date.parse(since) : undefined;
    return await fetchUserHistory(userId, sinceMs);
  } catch (err) {
    console.error('Error in fetchReports:', err);
    throw err;
  }
}

/**
 * Compute the user's “Music Ratio”:
 *   • # unique tracks
 *   • # unique albums
 *   • # unique artists
 */
export async function getMusicRatio(userId: string): Promise<{
  tracks: number;
  albums: number;
  artists: number;
}> {
  const history = await fetchUserHistory(userId);
  return {
    tracks: new Set(history.map(h => h.track_id)).size,
    albums: new Set(history.map(h => h.album_id)).size,
    artists: new Set(history.map(h => h.artist_id)).size,
  };
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

  return { consistency, discoveryRate, variance, concentration, replayRate };
}


// just below getListeningFingerprint(...)
export async function getListeningClock(
  userId: string
): Promise<number[]> {
  const history = await fetchUserHistory(userId);
  // zeroed array for 24h
  const counts = Array<number>(24).fill(0);
  history.forEach(h => {
    const hr = new Date(h.played_at).getHours();
    counts[hr]++;
  });
  return counts;
}
