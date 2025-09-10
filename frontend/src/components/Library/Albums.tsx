import React, { useEffect, useState } from "react";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompactDisc,
  faPlay,
  faHeart,
  faEllipsisV,
  faGem,
  faFire,
  faSpinner,
  faRecordVinyl,
  faStar,
  faMusic,
  faArrowRight,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useUserId } from "../../services/store";
import { fetchTopAlbums, TopAlbum } from "../../repositories/historyRepository";

// Enhanced animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const albumSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Enhanced styled components
const Container = styled.div`
  background: transparent;
  border-radius: 0;
  padding: 0;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: white;
  background: linear-gradient(135deg, #1DB954, #1ed760);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.3)' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#1DB954' : '#b3b3b3'};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(29, 185, 84, 0.2);
    color: #1DB954;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #b3b3b3;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(29, 185, 84, 0.2);
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 20px;
  color: #ff6b6b;
  text-align: center;
  margin: 20px 0;
`;

const AlbumsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;

const AlbumCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(29, 185, 84, 0.4);
    box-shadow: 0 20px 60px rgba(29, 185, 84, 0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1DB954, #1ed760, #43e97b);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const AlbumCover = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.4s ease;
  
  ${AlbumCard}:hover & {
    transform: scale(1.05);
  }
`;

const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
  
  ${AlbumCard}:hover & {
    transform: scale(1.1) rotate(2deg);
  }
`;

const CoverPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1DB954, #1ed760);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 20%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0, #808080)';
    if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32, #8B4513)';
    return 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9))';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  z-index: 2;
  animation: ${float} 3s ease-in-out infinite;
  backdrop-filter: blur(10px);
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(29, 185, 84, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  ${AlbumCard}:hover & {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const AlbumInfo = styled.div`
  text-align: center;
`;

const AlbumName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.p`
  font-size: 1rem;
  color: #b3b3b3;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AlbumStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const PlayCount = styled.div`
  background: rgba(29, 185, 84, 0.2);
  color: #1DB954;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatBadge = styled.div<{ type: 'rank' | 'top' }>`
  background: ${props => props.type === 'top' 
    ? 'rgba(255, 215, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.type === 'top' ? '#FFD700' : '#b3b3b3'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AlbumActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${AlbumCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 25px;
  border: none;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #1DB954, #1ed760)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary 
      ? 'linear-gradient(135deg, #1ed760, #1DB954)' 
      : 'rgba(255, 255, 255, 0.2)'
    };
    box-shadow: 0 8px 25px ${props => props.primary 
      ? 'rgba(29, 185, 84, 0.4)' 
      : 'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const Albums: React.FC = () => {
  const userId = useUserId();
  const [albums, setAlbums] = useState<TopAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!userId) return;

    const loadAlbums = async () => {
      setLoading(true);
      try {
        const data = await fetchTopAlbums(userId, 40); // Load more albums
        setAlbums(data);
        setError(null);
      } catch (e) {
        console.error('Error loading top albums:', e);
        setError("Failed to load top albums");
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading your top albums...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (albums.length === 0) {
    return (
      <Container>
        <EmptyState>
          <FontAwesomeIcon icon={faRecordVinyl} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No albums played yet.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Start listening to music to see your top albums here!
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <SectionTitle>
          <FontAwesomeIcon icon={faGem} />
          Top Albums
        </SectionTitle>
        <ViewToggle>
          <ViewButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
          >
            Grid
          </ViewButton>
          <ViewButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            List
          </ViewButton>
        </ViewToggle>
      </Header>

      <AlbumsGrid>
        {albums.map((album, idx) => (
          <AlbumCard 
            key={`${album.album_name}-${idx}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <AlbumCover>
              <RankBadge rank={idx + 1}>
                {idx + 1}
              </RankBadge>
              
              {album.album_image ? (
                <AlbumImage
                  src={album.album_image}
                  alt={`${album.album_name} cover`}
                />
              ) : (
                <CoverPlaceholder>
                  <FontAwesomeIcon icon={faCompactDisc} />
                </CoverPlaceholder>
              )}
              
              <PlayButton
                onClick={() => {
                  const query = encodeURIComponent(`${album.album_name} ${album.artist_name}`);
                  const url = `https://open.spotify.com/search/${query}`;
                  const w = window.open(url, '_blank');
                  if (w) w.opener = null;
                }}
              >
                <FontAwesomeIcon icon={faPlay} />
              </PlayButton>
            </AlbumCover>
            
            <AlbumInfo>
              <AlbumName>{album.album_name}</AlbumName>
              <ArtistName>{album.artist_name}</ArtistName>
              
              <AlbumStats>
                <PlayCount>
                  <FontAwesomeIcon icon={faFire} />
                  {album.play_count} plays
                </PlayCount>
                {idx < 5 && (
                  <StatBadge type="top">
                    <FontAwesomeIcon icon={faStar} />
                    Top Album
                  </StatBadge>
                )}
              </AlbumStats>
              
              <AlbumActions>
                <ActionButton primary onClick={() => {
                  const query = encodeURIComponent(`${album.album_name} ${album.artist_name}`);
                  const url = `https://open.spotify.com/search/${query}`;
                  const w = window.open(url, '_blank');
                  if (w) w.opener = null;
                }}>
                  <FontAwesomeIcon icon={faPlay} />
                  Play
                </ActionButton>
                <ActionButton>
                  <FontAwesomeIcon icon={faHeart} />
                </ActionButton>
                <ActionButton>
                  <FontAwesomeIcon icon={faEllipsisV} />
                </ActionButton>
              </AlbumActions>
            </AlbumInfo>
          </AlbumCard>
        ))}
      </AlbumsGrid>
    </Container>
  );
};

export default Albums;
