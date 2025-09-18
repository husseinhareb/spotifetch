import React, { useEffect, useState } from "react";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faPlay,
  
  faEllipsisV,
  faTrophy,
  faFire,
  faSpinner,
  faChartLine,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { useUserId } from "../../services/store";
import { fetchTopTracks, TopTrack } from "../../repositories/historyRepository";

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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(29, 185, 84, 0.3); }
  50% { box-shadow: 0 0 40px rgba(29, 185, 84, 0.6); }
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

const TrackGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const TrackCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    border-color: rgba(29, 185, 84, 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1DB954, #1ed760);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const TrackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0, #808080)';
    if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32, #8B4513)';
    return 'linear-gradient(135deg, #666, #444)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
`;

const AlbumArt = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
`;

const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${TrackCard}:hover & {
    transform: scale(1.1);
  }
`;

const AlbumPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #333, #666);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.5rem;
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.p`
  font-size: 1rem;
  color: #b3b3b3;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TrackStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #666;
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

const TrackActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${TrackCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #1DB954;
    transform: scale(1.1);
  }
`;

const Songs: React.FC = () => {
  const userId = useUserId();
  const [songs, setSongs] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!userId) return;

    const loadTop = async () => {
      setLoading(true);
      try {
        const top = await fetchTopTracks(userId, 50); // Load more tracks
        setSongs(top);
        setError(null);
      } catch (err) {
        console.error('Error loading top tracks:', err);
        setError("Failed to fetch most-played songs");
      } finally {
        setLoading(false);
      }
    };

    loadTop();
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading your top songs...</p>
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

  if (songs.length === 0) {
    return (
      <Container>
        <EmptyState>
          <FontAwesomeIcon icon={faMusic} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No tracks played yet.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Start listening to music to see your top songs here!
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <SectionTitle>
          <FontAwesomeIcon icon={faTrophy} />
          Top Songs
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

      <TrackGrid>
        {songs.map((song, idx) => (
          <TrackCard 
            key={`${song.track_name}-${idx}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <TrackHeader>
              <RankBadge rank={idx + 1}>
                {idx + 1}
              </RankBadge>
              
              <AlbumArt>
                {song.album_image ? (
                  <AlbumImage
                    src={song.album_image}
                    alt={`${song.track_name} album cover`}
                  />
                ) : (
                  <AlbumPlaceholder>
                    <FontAwesomeIcon icon={faMusic} />
                  </AlbumPlaceholder>
                )}
              </AlbumArt>
              
              <TrackInfo>
                <TrackName>{song.track_name}</TrackName>
                <ArtistName>{song.artist_name}</ArtistName>
              </TrackInfo>
              
              <TrackActions>
                <ActionButton
                  title="Play"
                  onClick={() => {
                    if (!song.track_id) return;
                    const url = `https://open.spotify.com/track/${song.track_id}`;
                    const w = window.open(url, '_blank');
                    if (w) w.opener = null;
                  }}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </ActionButton>
                {/* favorite button removed */}
                <ActionButton title="More options">
                  <FontAwesomeIcon icon={faEllipsisV} />
                </ActionButton>
              </TrackActions>
            </TrackHeader>
            
            <TrackStats>
              <PlayCount>
                <FontAwesomeIcon icon={faFire} />
                {song.play_count} plays
              </PlayCount>
              <StatItem>
                <FontAwesomeIcon icon={faChartLine} />
                Rank #{idx + 1}
              </StatItem>
              {idx < 3 && (
                <StatItem>
                  <FontAwesomeIcon icon={faStar} />
                  Top Track
                </StatItem>
              )}
            </TrackStats>
          </TrackCard>
        ))}
      </TrackGrid>
    </Container>
  );
};

export default Songs;
