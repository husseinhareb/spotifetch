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
import { fetchArtistInfo, fetchLastFmImages, fetchArtistGallery, ArtistInfo } from '../../repositories/artistRepository';

const PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';
const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [lastFmImages, setLastFmImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImageSrc, setMainImageSrc] = useState<string>('https://via.placeholder.com/300');

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
          // Try the new gallery endpoint first (uses web scraping)
          const gallery = await fetchArtistGallery(data.artist_info.artist_name, 12);
          if (gallery.length > 0) {
            setLastFmImages(gallery);
          } else {
            // Fallback to Last.fm if gallery is empty
            const lastfmImgs = await fetchLastFmImages(data.artist_info.artist_name);
            const filtered = lastfmImgs.filter(url => url && !url.includes(PLACEHOLDER_HASH));
            setLastFmImages(filtered.length > 0 ? filtered : []);
          }
        } catch (imgErr) {
          console.error('Failed to load images', imgErr);
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

  // update main image when artistInfo or lastFmImages change
  useEffect(() => {
    if (!artistInfo) {
      setMainImageSrc('https://via.placeholder.com/300');
      return;
    }
    const computed =
      (artistInfo.artist_info.images && artistInfo.artist_info.images.length > 0 && artistInfo.artist_info.images[0]) ||
      (artistInfo.artist_info.track_images && artistInfo.artist_info.track_images.length > 0 && artistInfo.artist_info.track_images[0]) ||
      (lastFmImages && lastFmImages.length > 0 && lastFmImages[0]) ||
      'https://via.placeholder.com/300';
    setMainImageSrc(computed);
  }, [artistInfo, lastFmImages]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!artistInfo) return <p>No artist information found.</p>;


  return (
    <ArtistDetailsContainer>
      <h1>{artistInfo.artist_info.artist_name}</h1>
      <ArtistImage
        src={mainImageSrc}
        alt={artistInfo.artist_info.artist_name}
        crossOrigin="anonymous"
        onError={() => setMainImageSrc('https://via.placeholder.com/300')}
      />
      <p>{(artistInfo.artist_info.genres || []).join(', ')}</p>
      <p>Popularity: {artistInfo.artist_info.popularity}</p>
      <p>Description: {artistInfo.artist_info.description}</p>

      {/* Gallery of images */}
      <h2>Gallery</h2>
      <ImageGallery>
        {(lastFmImages.length ? lastFmImages : ["https://via.placeholder.com/150"]).map((imageUrl, index) => (
          <GalleryImage
            key={index}
            src={imageUrl}
            alt={`Image of ${artistInfo.artist_info.artist_name} ${index + 1}`}
            onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
          />
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
