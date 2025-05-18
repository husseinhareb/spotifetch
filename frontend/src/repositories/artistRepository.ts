// src/repositories/artistRepository.ts
import axios from 'axios';

export interface ArtistInfo {
  artist_info: {
    artist_name: string;
    images: string[];
    genres: string[];
    popularity: number;
    description: string;
  };
  top_tracks: Array<{
    track_name: string;
    album_name: string;
    album_image: string;
    external_url: string;
  }>;
}

export async function fetchArtistInfo(artistId: string): Promise<ArtistInfo> {
  const resp = await axios.get<ArtistInfo>(`/auth/artist_info/${artistId}`, {
    withCredentials: true,
  });
  return resp.data;
}

export async function fetchLastFmImages(artistName: string): Promise<string[]> {
  const resp = await axios.get<{ images: string[] }>(`/auth/artist_images/${artistName}`);
  return resp.data.images;
}
