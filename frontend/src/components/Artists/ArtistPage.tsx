import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faFire, faImages, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  ArtistDetailsContainer,
  ArtistImage,
  TrackList,
  TrackItem,
  ImageGallery,
  GalleryImage,
  GalleryImageWrapper,
  ArtistMeta,
  DescriptionCard,
  SectionTitle,
  HeroSection,
  HeroContent,
  ContentSection,
  Section,
  GenreTag,
  LoadingContainer,
  LoadingSpinner,
  EmptyGallery,
  ShowMoreLink,
} from './Styles/style';
import { fetchArtistInfo, fetchArtistGallery, ArtistInfo } from '../../repositories/artistRepository';

const PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

const PREVIEW_IMAGE_COUNT = 5;

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImageSrc, setMainImageSrc] = useState<string>('');

  // Fetch artist info and artist images from external sources
  useEffect(() => {
    const load = async () => {
      if (!artistId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArtistInfo(artistId);
        setArtistInfo(data);

        // Fetch real artist images from external sources (TheAudioDB, Deezer)
        try {
          const gallery = await fetchArtistGallery(data.artist_info.artist_name, 12);
          const filtered = gallery.filter(url => url && !url.includes(PLACEHOLDER_HASH));
          setGalleryImages(filtered);
          // Set main image from gallery
          if (filtered.length > 0) {
            setMainImageSrc(filtered[0]);
          }
        } catch (imgErr) {
          console.error('Failed to load external images', imgErr);
          setGalleryImages([]);
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

  // Navigate to full gallery page
  const goToGallery = () => {
    if (artistInfo) {
      navigate(`/artist/${artistId}/gallery`, { 
        state: { 
          artistName: artistInfo.artist_info.artist_name,
          images: galleryImages 
        } 
      });
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading artist...</p>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <LoadingContainer>
        <p style={{ color: '#ff6b6b' }}>{error}</p>
      </LoadingContainer>
    );
  }
  
  if (!artistInfo) {
    return (
      <LoadingContainer>
        <p>No artist information found.</p>
      </LoadingContainer>
    );
  }


  return (
    <ArtistDetailsContainer>
      {/* Hero Section with background image */}
      <HeroSection $bgImage={mainImageSrc || undefined}>
        <HeroContent>
          {mainImageSrc && (
            <ArtistImage
              src={mainImageSrc}
              alt={artistInfo.artist_info.artist_name}
              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          <ArtistMeta>
            <h1>{artistInfo.artist_info.artist_name}</h1>
            
            <div className="genres">
              {(artistInfo.artist_info.genres || []).slice(0, 5).map((genre, idx) => (
                <GenreTag key={idx}>{genre}</GenreTag>
              ))}
            </div>
            
            <div className="popularity">
              <FontAwesomeIcon icon={faFire} />
              {artistInfo.artist_info.popularity}% Popularity
            </div>

            {artistInfo.artist_info.description && (
              <DescriptionCard>
                {artistInfo.artist_info.description}
              </DescriptionCard>
            )}
          </ArtistMeta>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        {/* Gallery Section */}
        <Section>
          <SectionTitle>
            <FontAwesomeIcon icon={faImages} />
            Gallery
          </SectionTitle>
          
          {galleryImages.length > 0 ? (
            <>
              <ImageGallery>
                {galleryImages.slice(0, PREVIEW_IMAGE_COUNT).map((imageUrl, index) => (
                  <GalleryImageWrapper 
                    key={index}
                    onClick={goToGallery}
                  >
                    <GalleryImage
                      src={imageUrl}
                      alt={`${artistInfo.artist_info.artist_name} photo ${index + 1}`}
                      onError={(e: any) => { 
                        e.currentTarget.parentElement.style.display = 'none'; 
                      }}
                    />
                  </GalleryImageWrapper>
                ))}
              </ImageGallery>
              
              {galleryImages.length > PREVIEW_IMAGE_COUNT && (
                <ShowMoreLink onClick={goToGallery}>
                  View all {galleryImages.length} photos
                  <FontAwesomeIcon icon={faArrowRight} />
                </ShowMoreLink>
              )}
            </>
          ) : (
            <EmptyGallery>
              <FontAwesomeIcon icon={faImages} />
              <p>No images available for this artist</p>
            </EmptyGallery>
          )}
        </Section>

        {/* Top Tracks Section */}
        <Section>
          <SectionTitle>
            <FontAwesomeIcon icon={faMusic} />
            Top Tracks
          </SectionTitle>
          
          <TrackList>
            {artistInfo.top_tracks.map((track: any, index: number) => (
              <TrackItem key={track.external_url || index}>
                <span className="track-number">{index + 1}</span>
                <img 
                  className="track-thumb" 
                  src={track.album_image || "https://via.placeholder.com/56"} 
                  alt={track.album_name}
                  onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/56'; }}
                />
                <div className="track-info">
                  <div className="track-title">{track.track_name}</div>
                  <div className="track-album">{track.album_name}</div>
                </div>
              </TrackItem>
            ))}
          </TrackList>
        </Section>
      </ContentSection>
    </ArtistDetailsContainer>
  );
};

export default ArtistPage;
