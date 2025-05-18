// src/repositories/trackRepository.ts
import axios from 'axios';

export interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
  play_count?: number;
}

export async function fetchRecentTracks(username: string, skip: number): Promise<Song[]> {
  const resp = await axios.get<{ recent_tracks: Song[] }>(
    `/tracks/user/${username}/library/recently_played_db?skip=${skip}`
  );
  return resp.data.recent_tracks;
}

export async function fetchMostPlayedSongs(): Promise<Song[]> {
  const resp = await axios.get<{ songs: Song[] }>('/tracks/songs_most_played');
  return resp.data.songs;
}
