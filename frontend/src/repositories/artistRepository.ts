// src/repositories/artistRepository.ts
import axios from 'axios';

// New: the shape we’ll use in TopArtists.tsx
export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
}

// Fetch the top artists for a time range
export async function fetchTopArtists(timeRange: string): Promise<Artist[]> {
  const resp = await axios.get<{ top_artists: any[] }>(
    `http://localhost:8000/artists/top_artists?time_range=${timeRange}`,
    { withCredentials: true }
  );
  if (resp.status !== 200) {
    throw new Error(`Failed to load top artists (${resp.status})`);
  }
  return resp.data.top_artists.map(a => ({
    id: a.artist_id,
    name: a.artist_name,
    image: a.image_url,
    bio: a.description,
  }));
}

// (Keep your other two exports here:)
export interface ArtistInfo { /* … */ }
export async function fetchArtistInfo(artistId: string): Promise<ArtistInfo> { /* … */ }
export async function fetchLastFmImages(artistName: string): Promise<string[]> { /* … */ }
