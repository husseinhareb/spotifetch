import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArtistDetailsContainer,
  ArtistImage,
  TrackList,
  TrackItem,
  ImageGallery,
  GalleryImage,
} from './Styles/style';
import { fetchArtistInfo, fetchLastFmImages, ArtistInfo } from '../../repositories/artistRepository';

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [lastFmImages, setLastFmImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch artist info and Last.fm images using repository helpers
  useEffect(() => {
    const load = async () => {
      if (!artistId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArtistInfo(artistId);
        setArtistInfo(data);

        try {
          const imgs = await fetchLastFmImages(data.artist_info.artist_name);
          setLastFmImages(imgs);
        } catch (imgErr) {
          // non-fatal: keep going with empty gallery
          console.error('Failed to load Last.fm images', imgErr);
          setLastFmImages([]);
        }
      } catch (err: any) {
        console.error('Error loading artist page', err);
        setError(err?.message || 'Failed to load artist');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [artistId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!artistInfo) return <p>No artist information found.</p>;

  return (
    <ArtistDetailsContainer>
      <h1>{artistInfo.artist_info.artist_name}</h1>
      <ArtistImage src={artistInfo.artist_info.images[0] || "https://via.placeholder.com/150"} alt={artistInfo.artist_info.artist_name} />
      <p>{artistInfo.artist_info.genres.join(', ')}</p>
      <p>Popularity: {artistInfo.artist_info.popularity}</p>
      <p>Description: {artistInfo.artist_info.description}</p>

      {/* Gallery of images */}
      <h2>Gallery</h2>
      <ImageGallery>
        {(lastFmImages.length ? lastFmImages : ["https://via.placeholder.com/150"]).map((imageUrl, index) => (
          <GalleryImage key={index} src={imageUrl} alt={`Image of ${artistInfo.artist_info.artist_name} ${index + 1}`} />
        ))}
      </ImageGallery>

      {/* Display Top Tracks */}
      <h2>Top Tracks</h2>
      <TrackList>
        {artistInfo.top_tracks.map((track: any) => (
          <TrackItem key={track.external_url}>
            <p>{track.track_name} - {track.album_name}</p>
            <img src={track.album_image || "https://via.placeholder.com/150"} alt={track.album_name} />
          </TrackItem>
        ))}
      </TrackList>
    </ArtistDetailsContainer>
  );
};

export default ArtistPage;
