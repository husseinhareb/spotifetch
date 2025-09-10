// src/components/RecentlyPlayed/RecentlyPlayed.tsx
import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faHeart, 
  faMusic,
  faSpinner,
  faClock,
  faListUl
} from '@fortawesome/free-solid-svg-icons';
import { formatPlayedTime } from "../../helpers/timeUtils";
import { useUserId } from "../../services/store";
import { fetchUserHistory, HistorySong } from "../../repositories/historyRepository";

// Enhanced animations
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// Enhanced styled components
const Container = styled.div`
  background: linear-gradient(145deg, #1e1e1e, #0a0a0a);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 600px;
  overflow-y: auto;
  animation: ${slideUp} 0.8s ease-out;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #1DB954;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #1ed760;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0 12px;
  color: white;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(8px);
    border-color: rgba(29, 185, 84, 0.3);
  }
`;

const AlbumImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
  
  ${TrackItem}:hover & {
    transform: scale(1.05);
  }
`;

const AlbumPlaceholder = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(45deg, #333, #666);
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.5rem;
`;

const TrackDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const TrackName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.div`
  font-size: 0.9rem;
  color: #b3b3b3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlayedAt = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TrackActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${TrackItem}:hover & {
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(29, 185, 84, 0.3);
  border-radius: 50%;
  border-top-color: #1DB954;
  animation: spin 1s ease-in-out infinite;
  margin-right: 12px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 32px;
  color: #666;
  font-size: 1rem;
`;

const ErrorMessage = styled(Message)`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 107, 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  color: #1DB954;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(29, 185, 84, 0.2);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecentlyPlayed: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<HistorySong[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const username = useUserId();

  const loadMore = useCallback(async () => {
    if (!hasMore || username === "N/A") return;

    setLoading(true);
    try {
      const fetched = await fetchUserHistory(username, skip);
      if (fetched.length > 0) {
        setRecentTracks((prev) => [...prev, ...fetched]);
        setSkip((prev) => prev + fetched.length);
      } else {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching recent tracks:', err);
      setError("Failed to fetch recently played songs");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [hasMore, username, skip]);

  useEffect(() => {
    loadMore();
  }, [username, loadMore]);

  if (initialLoading) {
    return (
      <Container>
        <SectionHeader>
          <FontAwesomeIcon icon={faClock} style={{ color: '#1DB954', fontSize: '1.5rem' }} />
          <SectionTitle>Recent Activity</SectionTitle>
        </SectionHeader>
        <LoadingContainer>
          <LoadingSpinner />
          <span>Loading your recent tracks...</span>
        </LoadingContainer>
      </Container>
    );
  }

  if (error && recentTracks.length === 0) {
    return (
      <Container>
        <SectionHeader>
          <FontAwesomeIcon icon={faClock} style={{ color: '#1DB954', fontSize: '1.5rem' }} />
          <SectionTitle>Recent Activity</SectionTitle>
        </SectionHeader>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (recentTracks.length === 0) {
    return (
      <Container>
        <SectionHeader>
          <FontAwesomeIcon icon={faClock} style={{ color: '#1DB954', fontSize: '1.5rem' }} />
          <SectionTitle>Recent Activity</SectionTitle>
        </SectionHeader>
        <EmptyState>
          <FontAwesomeIcon icon={faListUl} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No recent activity found.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Start listening to music to see your history here!
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader>
        <FontAwesomeIcon icon={faClock} style={{ color: '#1DB954', fontSize: '1.5rem' }} />
        <SectionTitle>Recent Activity</SectionTitle>
      </SectionHeader>
      
      <TrackList>
        {recentTracks.map((track, idx) => (
          <TrackItem 
            key={`${track.track_id}-${idx}`}
            onMouseEnter={() => setHoveredTrack(idx)}
            onMouseLeave={() => setHoveredTrack(null)}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {track.album_image ? (
              <AlbumImage
                src={track.album_image}
                alt={`${track.track_name} album cover`}
              />
            ) : (
              <AlbumPlaceholder>
                <FontAwesomeIcon icon={faMusic} />
              </AlbumPlaceholder>
            )}
            
            <TrackDetails>
              <TrackName>{track.track_name}</TrackName>
              <ArtistName>{track.artist_name}</ArtistName>
              <PlayedAt>
                <FontAwesomeIcon icon={faClock} />
                {formatPlayedTime(track.played_at)}
              </PlayedAt>
            </TrackDetails>

            <TrackActions>
              <ActionButton
                title="Play"
                onClick={() => {
                  if (!track.track_id) return;
                  const url = `https://open.spotify.com/track/${track.track_id}`;
                  const w = window.open(url, '_blank');
                  if (w) w.opener = null;
                }}
              >
                <FontAwesomeIcon icon={faPlay} />
              </ActionButton>
              <ActionButton title="Add to favorites">
                <FontAwesomeIcon icon={faHeart} />
              </ActionButton>
            </TrackActions>
          </TrackItem>
        ))}
      </TrackList>

      {hasMore && (
        <LoadMoreButton 
          onClick={loadMore} 
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner style={{ width: '20px', height: '20px', margin: 0, marginRight: '8px' }} />
              Loading more tracks...
            </>
          ) : (
            'Load More'
          )}
        </LoadMoreButton>
      )}

      {!hasMore && !loading && recentTracks.length > 0 && (
        <Message>You've reached the end of your listening history!</Message>
      )}
    </Container>
  );
};

export default RecentlyPlayed;
