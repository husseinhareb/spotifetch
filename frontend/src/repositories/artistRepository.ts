import axios from 'axios';

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
  const resp = await axios.get<{ top_artists: any[] }>(
    `http://localhost:8000/artists/top_artists?time_range=${timeRange}`,
    { withCredentials: true }
  );
  if (resp.status !== 200) {
    throw new Error(`Failed to load top artists (${resp.status})`);
  }
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
  const resp = await axios.get<ArtistInfo>(
    `http://localhost:8000/artists/artist_info/${artistId}`,
    { withCredentials: true }
  );
  if (resp.status !== 200) {
    throw new Error(`Failed to load artist info (${resp.status})`);
  }
  return resp.data;
}

/**
 * Fetch additional images for an artist from Last.fm via backend proxy
 */
export async function fetchLastFmImages(
  artistName: string
): Promise<string[]> {
  const resp = await axios.get<{ images: string[] }>(
    `http://localhost:8000/artists/artist_images/${encodeURIComponent(artistName)}`
  );
  if (resp.status !== 200) {
    throw new Error(`Failed to load Last.fm images (${resp.status})`);
  }
  return resp.data.images;
}

export async function fetchArtistGallery(
  artistName: string,
  limit = 12
): Promise<string[]> {
  const resp = await axios.get<{ images: string[] }>(
    `http://localhost:8000/artists/artist_gallery/${encodeURIComponent(artistName)}?limit=${limit}`
  );
  if (resp.status !== 200) {
    throw new Error(`Failed to load artist gallery (${resp.status})`);
  }
  return resp.data.images;
}
