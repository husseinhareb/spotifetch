// src/components/Home/TopArtists.tsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faPlay, 
  faHeart,
  faExternalLinkAlt,
  faSpinner,
  faChevronLeft,
  faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import { fetchTopArtists, Artist } from '../../repositories/artistRepository';
import { trimBioWithLink } from '../../helpers/bioUtils';

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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Enhanced styled components
const TopArtistsContainer = styled.div`
  background: linear-gradient(145deg, #1e1e1e, #0a0a0a);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideUp} 0.8s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeRangeSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
`;

const TimeRangeButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? '#1DB954' : 'transparent'};
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? '#1DB954' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const ArtistCard = styled.div<{ featured?: boolean }>`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #333, #666);
  animation: ${scaleIn} 0.6s ease-out;
  
  ${props => props.featured && `
    grid-column: span 2;
    aspect-ratio: 2/1;
    
    @media (max-width: 768px) {
      grid-column: span 2;
      aspect-ratio: 1;
    }
  `}
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
`;

const ArtistImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ArtistCard}:hover & {
    transform: scale(1.1);
  }
`;

const ArtistOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 24px 16px 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  
  ${ArtistCard}:hover & {
    transform: translateY(0);
  }
`;

const ArtistName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
`;

const ArtistRank = styled.div<{ rank: number }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => 
    props.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    props.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
    props.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #B8860B)' :
    'rgba(0, 0, 0, 0.7)'
  };
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const ArtistActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
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
  padding: 60px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(29, 185, 84, 0.3);
  border-radius: 50%;
  border-top-color: #1DB954;
  animation: spin 1s ease-in-out infinite;
  margin-right: 16px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const timeRanges = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];

const TopArtists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [timeRange, setTimeRange] = useState<string>('medium_term');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTopArtists(timeRange)
      .then(setArtists)
      .catch(err => console.error('Error fetching top artists:', err))
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) {
    return (
      <TopArtistsContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <span>Loading your top artists...</span>
        </LoadingContainer>
      </TopArtistsContainer>
    );
  }

  if (artists.length === 0) {
    return (
      <TopArtistsContainer>
        <SectionHeader>
          <SectionTitle>
            <FontAwesomeIcon icon={faStar} />
            Top Artists
          </SectionTitle>
        </SectionHeader>
        <EmptyState>
          <FontAwesomeIcon icon={faStar} size="3x" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No top artists found. Start listening to some music!</p>
        </EmptyState>
      </TopArtistsContainer>
    );
  }

  return (
    <TopArtistsContainer>
      <SectionHeader>
        <SectionTitle>
          <FontAwesomeIcon icon={faStar} />
          Top Artists
        </SectionTitle>
        <TimeRangeSelector>
          {timeRanges.map((range) => (
            <TimeRangeButton
              key={range.value}
              active={timeRange === range.value}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </TimeRangeButton>
          ))}
        </TimeRangeSelector>
      </SectionHeader>

      <ArtistsGrid>
        {artists.slice(0, 5).map((artist, index) => (
          <ArtistCard 
            key={artist.id} 
            featured={index === 0}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ArtistRank rank={index + 1}>
              {index + 1}
            </ArtistRank>
            
            {artist.image ? (
              <ArtistImage src={artist.image} alt={artist.name} />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(45deg, #333, #666)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#999'
              }}>
                <FontAwesomeIcon icon={faStar} />
              </div>
            )}
            
            <ArtistOverlay>
              <ArtistName>{artist.name}</ArtistName>
              {artist.bio && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#ccc', 
                  margin: '0 0 8px', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {artist.bio.substring(0, 50)}...
                </p>
              )}
              <ArtistActions>
                <ActionButton title="Play" onClick={() => {
                  const query = encodeURIComponent(artist.name);
                  const url = `https://open.spotify.com/search/${query}`;
                  const w = window.open(url, '_blank');
                  if (w) w.opener = null;
                }}>
                  <FontAwesomeIcon icon={faPlay} />
                </ActionButton>
                <ActionButton title="Add to favorites">
                  <FontAwesomeIcon icon={faHeart} />
                </ActionButton>
                <ActionButton title="View details">
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </ActionButton>
              </ArtistActions>
            </ArtistOverlay>
          </ArtistCard>
        ))}
      </ArtistsGrid>
    </TopArtistsContainer>
  );
};

export default TopArtists;
