import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faMusic, 
  faVolumeUp,
  faExternalLinkAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../../repositories/apiConfig';

// Enhanced animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const progressGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(29, 185, 84, 0.5); }
  50% { box-shadow: 0 0 20px rgba(29, 185, 84, 0.8); }
`;

// Enhanced styled components
const PlayerContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSolid};
  border-radius: 20px;
  padding: 32px;
  margin: 20px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, #1ed760);
  }
`;

const PlayerContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 16px;
  }
`;

const AlbumArtContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    animation: ${pulse} 2s infinite;
  }
  
  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
    margin: 0 auto;
  }
`;

const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

const PlayingIndicator = styled.div<{ isPlaying: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.buttonText || '#fff'};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  animation: ${props => props.isPlaying ? spin : 'none'} 2s linear infinite;
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text || '#b3b3b3'};
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressSection = styled.div`
  margin-top: 16px;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #b3b3b3;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.buttonBackground};
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div<{ progress: number; isPlaying: boolean }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, #1ed760);
  border-radius: 3px;
  transition: width 0.5s ease;
  animation: ${props => props.isPlaying ? progressGlow : 'none'} 2s infinite;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.buttonText || '#fff'};
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    opacity: ${props => props.isPlaying ? 1 : 0.7};
  }
`;

const PlayerControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${props => props.primary ? 
    `linear-gradient(135deg, ${props.theme.colors.accent}, #1ed760)` : 
    props.theme.colors.buttonBackground
  };
  color: ${({ theme }) => theme.colors.buttonText || '#fff'};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.primary ? 
      `linear-gradient(135deg, #1ed760, ${props.theme.colors.accent})` : 
      props.theme.name === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
    };
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const NoPlayingCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSolid};
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  border: 2px dashed rgba(0,0,0,0.06);
  color: ${({ theme }) => theme.colors.text || '#666'};
  animation: ${slideIn} 0.8s ease-out;
`;

const NoPlayingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const NoPlayingText = styled.p`
  font-size: 1.2rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text || '#999'};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0,0,0,0.08);
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.accent};
  animation: ${spin} 1s ease-in-out infinite;
`;

const CurrentlyPlaying: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentArtist, setCurrentArtist] = useState<string | null>(null);
  const [albumImage, setAlbumImage] = useState<string | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressMs, setProgressMs] = useState<number | null>(0);
  const [durationMs, setDurationMs] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSong = async () => {
      try {
        setError(null);
        const resp = await api.get('/tracks/currently_playing');
        const songInfo = resp.data;
        
        if (songInfo && songInfo.track_name) {
          setCurrentTrack(songInfo.track_name);
          setCurrentArtist(songInfo.artist_name);
          setAlbumImage(songInfo.album_image);
          setCurrentTrackId(songInfo.track_id || null);
          setIsPlaying(songInfo.is_playing);
          setProgressMs(songInfo.progress_ms);
          setDurationMs(songInfo.duration_ms);
        } else {
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 204) {
          setIsPlaying(false);
          setCurrentTrack(null);
        } else {
          console.error('Error fetching current song', error);
          setError('Failed to load currently playing track');
          setIsPlaying(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSong();
    const interval = setInterval(fetchCurrentSong, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate progress as percentage
  const calculateProgress = () => {
    if (!progressMs || !durationMs) return 0;
    return Math.min((progressMs / durationMs) * 100, 100);
  };

  // Helper function to format time in mm:ss
  const formatTime = (ms: number | null) => {
    if (ms === null) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <PlayerContainer>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '16px', color: '#666' }}>Loading current track...</p>
        </div>
      </PlayerContainer>
    );
  }

  if (error) {
    return (
      <NoPlayingCard>
        <NoPlayingIcon>
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </NoPlayingIcon>
        <NoPlayingText>{error}</NoPlayingText>
      </NoPlayingCard>
    );
  }

  if (!isPlaying || !currentTrack) {
    return (
      <NoPlayingCard>
        <NoPlayingIcon>
          <FontAwesomeIcon icon={faMusic} />
        </NoPlayingIcon>
        <NoPlayingText>
          No music is currently playing on Spotify
        </NoPlayingText>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
          Start playing something on Spotify to see it here!
        </p>
      </NoPlayingCard>
    );
  }

  return (
    <PlayerContainer>
      <PlayerContent>
        {/* Album Art */}
        <AlbumArtContainer>
          {albumImage ? (
            <AlbumImage src={albumImage} alt="Album cover" />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: 'linear-gradient(45deg, #333, #666)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#999'
            }}>
              <FontAwesomeIcon icon={faMusic} />
            </div>
          )}
          <PlayingIndicator isPlaying={isPlaying}>
            <FontAwesomeIcon icon={isPlaying ? faPlay : faPause} />
          </PlayingIndicator>
        </AlbumArtContainer>

        {/* Track Info */}
        <TrackInfo>
          <TrackName>{currentTrack}</TrackName>
          <ArtistName>{currentArtist}</ArtistName>
          
          <ProgressSection>
            <TimeDisplay>
              <span>{formatTime(progressMs)}</span>
              <span>{formatTime(durationMs)}</span>
            </TimeDisplay>
            <ProgressContainer>
              <ProgressBar 
                progress={calculateProgress()} 
                isPlaying={isPlaying}
              />
            </ProgressContainer>
          </ProgressSection>
        </TrackInfo>

        {/* Controls */}
        <PlayerControls>
          <ActionButton primary title="Open in Spotify" onClick={() => {
            if (!currentTrackId) return;
            const url = `https://open.spotify.com/track/${currentTrackId}`;
            const w = window.open(url, '_blank'); if (w) w.opener = null;
          }}>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </ActionButton>
          {/* favorite button removed */}
          <ActionButton title="Volume">
            <FontAwesomeIcon icon={faVolumeUp} />
          </ActionButton>
        </PlayerControls>
      </PlayerContent>
    </PlayerContainer>
  );
};

export default CurrentlyPlaying;
