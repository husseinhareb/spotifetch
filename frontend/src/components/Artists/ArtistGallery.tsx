import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faImages, 
  faTimes, 
  faChevronLeft, 
  faChevronRight,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import { fetchArtistGallery } from '../../repositories/artistRepository';

const PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Components
const GalleryContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 0;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.background}ee;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 20px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.1);
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(29, 185, 84, 0.3);
    transform: scale(1.05);
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 4px 0;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.6)'};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 32px 40px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    padding: 16px;
  }
`;

const ImageCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  animation: ${scaleIn} 0.5s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.15s; }
  &:nth-child(4) { animation-delay: 0.2s; }
  &:nth-child(5) { animation-delay: 0.25s; }
  &:nth-child(6) { animation-delay: 0.3s; }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    img {
      transform: scale(1.1);
    }
    
    &::after {
      opacity: 1;
    }
    
    .expand-icon {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  .expand-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    z-index: 2;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(29, 185, 84, 0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
  }
`;

const Lightbox = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.97);
  animation: ${fadeIn} 0.3s ease;
  
  img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
`;

const LightboxClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
  }
`;

const LightboxNav = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => $direction === 'prev' ? 'left: 20px;' : 'right: 20px;'}
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(29,185,84,0.5);
    transform: translateY(-50%) scale(1.1);
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    ${({ $direction }) => $direction === 'prev' ? 'left: 10px;' : 'right: 10px;'}
  }
`;

const LightboxCounter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.6)'};
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(29,185,84,0.2);
  border-radius: 50%;
  border-top-color: #1DB954;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ArtistGallery: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [images, setImages] = useState<string[]>([]);
  const [artistName, setArtistName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Get data from navigation state or fetch fresh
  useEffect(() => {
    const loadGallery = async () => {
      const state = location.state as { artistName?: string; images?: string[] } | null;
      
      if (state?.images && state.images.length > 0) {
        setImages(state.images);
        setArtistName(state.artistName || 'Artist');
        setLoading(false);
      } else {
        // Fetch fresh data if no state passed
        try {
          // We need to get artist name from the API
          const gallery = await fetchArtistGallery('', 50); // This won't work without artist name
          setImages(gallery.filter(url => !url.includes(PLACEHOLDER_HASH)));
        } catch (err) {
          console.error('Failed to load gallery', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadGallery();
  }, [location.state]);
  
  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);
  
  const goBack = () => {
    navigate(`/artist/${artistId}`);
  };

  return (
    <GalleryContainer>
      <Header>
        <BackButton onClick={goBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </BackButton>
        <HeaderInfo>
          <h1>{artistName} Gallery</h1>
          <p>
            <FontAwesomeIcon icon={faImages} />
            {images.length} photos
          </p>
        </HeaderInfo>
      </Header>
      
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading gallery...</p>
        </LoadingContainer>
      ) : (
        <GalleryGrid>
          {images.map((imageUrl, index) => (
            <ImageCard key={index} onClick={() => openLightbox(index)}>
              <img 
                src={imageUrl} 
                alt={`${artistName} photo ${index + 1}`}
                onError={(e: any) => { e.currentTarget.parentElement.style.display = 'none'; }}
              />
              <div className="expand-icon">
                <FontAwesomeIcon icon={faExpand} />
              </div>
            </ImageCard>
          ))}
        </GalleryGrid>
      )}
      
      {/* Lightbox */}
      <Lightbox $isOpen={lightboxOpen} onClick={closeLightbox}>
        {images.length > 0 && (
          <>
            <LightboxClose onClick={(e) => { e.stopPropagation(); closeLightbox(); }}>
              <FontAwesomeIcon icon={faTimes} />
            </LightboxClose>
            
            {images.length > 1 && (
              <>
                <LightboxNav 
                  $direction="prev" 
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </LightboxNav>
                <LightboxNav 
                  $direction="next" 
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </LightboxNav>
              </>
            )}
            
            <img 
              src={images[lightboxIndex]} 
              alt={`${artistName} full size`}
              onClick={(e) => e.stopPropagation()}
            />
            
            <LightboxCounter>
              {lightboxIndex + 1} / {images.length}
            </LightboxCounter>
          </>
        )}
      </Lightbox>
    </GalleryContainer>
  );
};

export default ArtistGallery;
