import { api } from './apiConfig';

// The simplified artist type for TopArtists component
export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres?: string[];
}

// Fetch top artists list with id, name, image, bio
export async function fetchTopArtists(timeRange: string): Promise<Artist[]> {
  const resp = await api.get<{ top_artists: any[] }>(
    `/artists/top_artists?time_range=${encodeURIComponent(timeRange)}`
  );
  return resp.data.top_artists.map((a: any) => ({
    id: a.artist_id,
    name: a.artist_name,
    image: a.image_url,
    bio: a.description,
    genres: a.genres || [],
  }));
}

// Detailed artist info from backend
export interface ArtistInfo {
  artist_info: {
    artist_name: string;
    images: string[];
    genres: string[];
    popularity: number;
  track_images?: string[];
    description: string;
  };
  top_tracks: Array<{
    track_name: string;
    album_name: string;
    album_image: string;
    external_url: string;
  }>;
}

/**
 * Fetch detailed artist information (profile + top tracks)
 */
export async function fetchArtistInfo(
  artistId: string
): Promise<ArtistInfo> {
  const resp = await api.get<ArtistInfo>(
    `/artists/artist_info/${encodeURIComponent(artistId)}`
  );
  return resp.data;
}

/**
 * Fetch additional images for an artist from Last.fm via backend proxy
 */
export async function fetchLastFmImages(
  artistName: string
): Promise<string[]> {
  const resp = await api.get<{ images: string[] }>(
    `/artists/artist_images/${encodeURIComponent(artistName)}`
  );
  return resp.data.images;
}

export async function fetchArtistGallery(
  artistName: string,
  limit = 12
): Promise<string[]> {
  const resp = await api.get<{ images: string[] }>(
    `/artists/artist_gallery/${encodeURIComponent(artistName)}?limit=${limit}`
  );
  return resp.data.images;
}
