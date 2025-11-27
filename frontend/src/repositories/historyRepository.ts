// src/repositories/historyRepository.ts
import { api } from "./apiConfig";

export interface HistorySong {
  artist_id: string | null;
  album_id: string | null;
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string | null;
  played_at: string;
  play_count?: number;
  duration_ms?: number;
}

export interface TopTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string | null;
  play_count: number;
}


export interface TopArtist {
  artist_name: string;
  play_count: number;
  artist_image?: string | null;
}


export interface TopAlbum {
  album_name: string;
  artist_name: string;
  album_image?: string | null;
  play_count: number;
}

/**
 * Record the “currently playing” track in the user’s history.
 */
export async function recordNow(userId: string) {
  return api.post(`/user/${encodeURIComponent(userId)}/history/`);
}

/**
 * Page through a user's raw listening history.
 */
export async function fetchUserHistory(
  userId: string,
  skip: number = 0,
  limit: number = 50
): Promise<HistorySong[]> {
  const resp = await api.get<HistorySong[]>(
    `/user/${encodeURIComponent(userId)}/history/`,
    { params: { skip, limit } }
  );
  return resp.data;
}

/**
 * Fetch a user’s top-played tracks.
 */
export async function fetchTopTracks(
  userId: string,
  limit: number = 10
): Promise<TopTrack[]> {
  const resp = await api.get<TopTrack[]>(
    `/user/${encodeURIComponent(userId)}/history/top`,
    { params: { limit } }
  );
  return resp.data;
}

export async function fetchTopArtists(
  userId: string,
  limit: number = 10
): Promise<TopArtist[]> {
  const resp = await api.get<TopArtist[]>(
    `/user/${encodeURIComponent(userId)}/history/top-artists`,
    { params: { limit } }
  );
  return resp.data;
}

export async function fetchTopAlbums(
  userId: string,
  limit: number = 10
): Promise<TopAlbum[]> {
  const resp = await api.get<TopAlbum[]>(
    `/user/${encodeURIComponent(userId)}/history/top-albums`,
    { params: { limit } }
  );
  return resp.data;
}