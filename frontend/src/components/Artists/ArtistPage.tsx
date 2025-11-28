import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArtistDetailsContainer,
  ArtistImage,
  TrackList,
  TrackItem,
  ImageGallery,
  GalleryImage,
  ArtistHeader,
  ArtistMeta,
  DescriptionCard,
  SectionTitle,
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

        // Collect all available images from different sources
        let allImages: string[] = [];
        
        // Add Spotify artist images first (most reliable)
        if (data.artist_info.images && data.artist_info.images.length > 0) {
          allImages.push(...data.artist_info.images);
        }
        
        // Add track/album images as additional gallery content
        if (data.artist_info.track_images && data.artist_info.track_images.length > 0) {
          allImages.push(...data.artist_info.track_images);
        }

        try {
          // Try the gallery endpoint for additional images from external sources
          const gallery = await fetchArtistGallery(data.artist_info.artist_name, 12);
          const filtered = gallery.filter(url => url && !url.includes(PLACEHOLDER_HASH));
          if (filtered.length > 0) {
            allImages.push(...filtered);
          }
        } catch (imgErr) {
          console.error('Failed to load external images', imgErr);
        }
        
        // Remove duplicates while preserving order
        const uniqueImages = [...new Set(allImages)];
        setLastFmImages(uniqueImages.length > 0 ? uniqueImages : []);
        
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
      <ArtistHeader>
        <ArtistImage
          src={mainImageSrc}
          alt={artistInfo.artist_info.artist_name}
          crossOrigin="anonymous"
          onError={() => setMainImageSrc('https://via.placeholder.com/300')}
        />

        <ArtistMeta>
          <h1>{artistInfo.artist_info.artist_name}</h1>
          <div className="genres">{(artistInfo.artist_info.genres || []).join(', ')}</div>
          <div className="popularity">Popularity: {artistInfo.artist_info.popularity}</div>

          <DescriptionCard>
            {artistInfo.artist_info.description || 'No description available.'}
          </DescriptionCard>
        </ArtistMeta>
      </ArtistHeader>

      <SectionTitle>Gallery</SectionTitle>
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

      <SectionTitle>Top Tracks</SectionTitle>
      <TrackList>
        {artistInfo.top_tracks.map((track: any) => (
          <TrackItem key={track.external_url}>
            <img className="track-thumb" src={track.album_image || "https://via.placeholder.com/150"} alt={track.album_name} />
            <div className="track-info">
              <div className="track-title">{track.track_name}</div>
              <div className="track-album">{track.album_name}</div>
            </div>
          </TrackItem>
        ))}
      </TrackList>
    </ArtistDetailsContainer>
  );
};

export default ArtistPage;
