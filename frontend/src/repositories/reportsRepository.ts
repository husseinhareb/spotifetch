import {
  fetchTopArtists,
  fetchTopAlbums,
  fetchTopTracks,
  fetchUserHistory,
  HistorySong,
  TopArtist,
  TopAlbum,
  TopTrack,
} from './historyRepository';

// Re-export types for convenience
export type { HistorySong, TopArtist, TopAlbum, TopTrack };

/**
 * Get the user's top artists (wraps historyRepository.fetchTopArtists)
 */
export async function getTopArtists(
  userId: string,
  limit: number = 5
): Promise<TopArtist[]> {
  return fetchTopArtists(userId, limit);
}

/**
 * Get the user's top albums (wraps historyRepository.fetchTopAlbums)
 */
export async function getTopAlbums(
  userId: string,
  limit: number = 5
): Promise<TopAlbum[]> {
  return fetchTopAlbums(userId, limit);
}

/**
 * Get the user's top tracks (wraps historyRepository.fetchTopTracks)
 */
export async function getTopTracks(
  userId: string,
  limit: number = 5
): Promise<TopTrack[]> {
  return fetchTopTracks(userId, limit);
}

/**
 * Fetch the user's raw listening history for reports.
 * Delegates to historyRepository.fetchUserHistory, which handles URL construction and errors.
 * Optionally filter by ISO timestamp 'since'.
 */
export async function fetchReports(
  userId: string,
  since?: string
): Promise<HistorySong[]> {
  try {
    // Convert ISO timestamp to milliseconds for fetchUserHistory
    const sinceMs: number | undefined = since ? Date.parse(since) : undefined;
    return await fetchUserHistory(userId, sinceMs);
  } catch (error) {
    console.error('Error in fetchReports:', error);
    throw error;
  }
}