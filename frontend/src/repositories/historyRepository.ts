// repositories/historyRepository.ts

import { api } from './apiConfig';

export interface Song {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
  play_count?: number;
}

/**
 * Fetch a page of the user's history.
 * @param username Spotify username
 * @param skip how many records to skip (for pagination)
 */
// repositories/historyRepository.ts
export async function recordNow(username: string) {
  // insert a history row for “right now”
  return api.post(`/user/${username}/history/`);
}

export async function fetchUserHistory(
  username: string,
  skip: number = 0
): Promise<Song[]> {
  // note trailing slash
  const resp = await api.get<Song[]>(
    `/user/${encodeURIComponent(username)}/history/`,
    { params: { skip } }
  );
  console.log("Fetched history:", resp.data);
  return resp.data;
}
