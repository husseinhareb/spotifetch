import React, { useEffect, useState } from "react";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faPlay,
  
  faEllipsisV,
  faCrown,
  faFire,
  faSpinner,
  faUsers,
  faStar,
  faMusic,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useUserId } from "../../services/store";
import { fetchTopArtists, TopArtist } from "../../repositories/historyRepository";

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

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
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

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArtistCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
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

const ArtistHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const RankBadge = styled.div<{ rank: number }>`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
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
  font-size: 0.8rem;
  color: white;
  z-index: 2;
  animation: ${float} 3s ease-in-out infinite;
`;

const ArtistAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  position: relative;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.4s ease;
  
  ${ArtistCard}:hover & {
    transform: scale(1.1);
  }
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1DB954, #1ed760);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`;

const ArtistInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArtistName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlayCount = styled.div`
  background: rgba(29, 185, 84, 0.2);
  color: #1DB954;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
`;

const ArtistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
`;

const ArtistActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ArtistCard}:hover & {
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

const PopularityBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 12px;
`;

const PopularityFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #1DB954, #1ed760);
  border-radius: 2px;
  transition: width 0.8s ease;
`;

const Artists: React.FC = () => {
  const userId = useUserId();
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadArtists = async () => {
      setLoading(true);
      try {
        const data = await fetchTopArtists(userId, 30); // Load more artists
        setArtists(data);
        setError(null);
      } catch (e) {
        console.error('Error loading top artists:', e);
        setError("Failed to load top artists.");
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, [userId]);

  // Calculate popularity percentage based on max plays
  const maxPlays = Math.max(...artists.map(artist => artist.play_count), 1);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading your top artists...</p>
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

  if (artists.length === 0) {
    return (
      <Container>
        <EmptyState>
          <FontAwesomeIcon icon={faUsers} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No artists in your history yet.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Start listening to music to see your top artists here!
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <SectionTitle>
          <FontAwesomeIcon icon={faCrown} />
          Top Artists
        </SectionTitle>
      </Header>

      <ArtistsGrid>
        {artists.map((artist, idx) => (
          <ArtistCard 
            key={`${artist.artist_name}-${idx}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <ArtistHeader>
              <RankBadge rank={idx + 1}>
                {idx + 1}
              </RankBadge>
              
              <ArtistAvatar>
                {artist.artist_image ? (
                  <ArtistImage
                    src={artist.artist_image}
                    alt={`${artist.artist_name} artwork`}
                  />
                ) : (
                  <AvatarPlaceholder>
                    <FontAwesomeIcon icon={faUser} />
                  </AvatarPlaceholder>
                )}
              </ArtistAvatar>
              
              <ArtistInfo>
                <ArtistName>{artist.artist_name}</ArtistName>
                <ArtistStats>
                  <PlayCount>
                    <FontAwesomeIcon icon={faFire} />
                    {artist.play_count} plays
                  </PlayCount>
                </ArtistStats>
              </ArtistInfo>
            </ArtistHeader>

            <PopularityBar>
              <PopularityFill 
                percentage={(artist.play_count / maxPlays) * 100}
              />
            </PopularityBar>

            <ArtistMeta>
              <MetaItem>
                <FontAwesomeIcon icon={faStar} />
                Rank #{idx + 1}
              </MetaItem>
              {idx < 5 && (
                <MetaItem>
                  <FontAwesomeIcon icon={faCrown} />
                  Top Artist
                </MetaItem>
              )}
            </ArtistMeta>

            <ArtistActions>
              <ActionButton primary>
                <FontAwesomeIcon icon={faPlay} />
                Play
              </ActionButton>
              <ActionButton>
                <FontAwesomeIcon icon={faArrowRight} />
                View
              </ActionButton>
              {/* favorite button removed */}
            </ArtistActions>
          </ArtistCard>
        ))}
      </ArtistsGrid>
    </Container>
  );
};

export default Artists;
