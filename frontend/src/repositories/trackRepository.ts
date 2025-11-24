// src/repositories/trackRepository.ts
import { api } from './apiConfig';

export interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
  play_count?: number;
}

export async function fetchRecentTracks(username: string, skip: number): Promise<Song[]> {
  const resp = await api.get<{ recent_tracks: Song[] }>(
    `/tracks/user/${encodeURIComponent(username)}/library/recently_played_db?skip=${skip}`
  );
  return resp.data.recent_tracks;
}

export async function fetchMostPlayedSongs(): Promise<Song[]> {
  const resp = await api.get<{ songs: Song[] }>('/tracks/songs_most_played');
  return resp.data.songs;
}
