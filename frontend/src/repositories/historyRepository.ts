// repositories/historyRepository.ts

import axios from 'axios';
import { api } from './apiConfig';

export interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
  play_count?: number;
}

export async function fetchUserHistory(username: string, skip: number): Promise<Song[]> {
  const resp = await api.get<{ recent_tracks: Song[] }>(
    `/user/${username}/history"`
  );
  return resp.data.recent_tracks;
}

