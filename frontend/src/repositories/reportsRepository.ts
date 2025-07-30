// src/repositories/reportsRepository.ts

import {
  fetchTopArtists,
  fetchTopAlbums,
  fetchTopTracks,
  HistorySong,
  TopArtist,
  TopAlbum,
  TopTrack,
  fetchUserHistory,
} from "./historyRepository";

// Re-export types
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
 * Fetch the raw listening history for reports
 */
export async function fetchReports(
  userId: string,
  skip: number = 0
): Promise<HistorySong[]> {
  return fetchUserHistory(userId, skip);
}
