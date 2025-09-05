import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

// Base skeleton component
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 8px;
`;

// Specific skeleton components
const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const SkeletonHeader = styled(SkeletonBase)`
  height: 32px;
  width: 60%;
  margin-bottom: 16px;
`;

const SkeletonText = styled(SkeletonBase)<{ width?: string; height?: string }>`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
`;

const SkeletonCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${pulse} 2s infinite;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const SkeletonAvatar = styled(SkeletonBase)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;

const SkeletonAlbumArt = styled(SkeletonBase)`
  width: 80px;
  height: 80px;
  border-radius: 8px;
`;

const TrackSkeletonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 12px;
`;

const TrackSkeletonContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Loading skeleton for different components
export const HomeLoadingSkeleton: React.FC = () => (
  <SkeletonContainer>
    <SkeletonHeader />
    <SkeletonGrid>
      {[...Array(4)].map((_, index) => (
        <SkeletonCard key={index}>
          <SkeletonText height="24px" width="80%" />
          <div style={{ marginTop: '16px' }}>
            <SkeletonText height="16px" width="60%" />
            <div style={{ marginTop: '8px' }}>
              <SkeletonText height="14px" width="40%" />
            </div>
          </div>
        </SkeletonCard>
      ))}
    </SkeletonGrid>
  </SkeletonContainer>
);

export const CurrentlyPlayingLoadingSkeleton: React.FC = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <SkeletonAlbumArt />
      <div style={{ flex: 1 }}>
        <SkeletonText height="20px" width="70%" />
        <div style={{ marginTop: '8px' }}>
          <SkeletonText height="16px" width="50%" />
        </div>
        <div style={{ marginTop: '16px' }}>
          <SkeletonText height="6px" width="100%" />
        </div>
      </div>
    </div>
  </SkeletonCard>
);

export const TopArtistsLoadingSkeleton: React.FC = () => (
  <SkeletonCard>
    <SkeletonText height="24px" width="50%" />
    <SkeletonGrid style={{ marginTop: '24px' }}>
      {[...Array(6)].map((_, index) => (
        <div key={index} style={{ textAlign: 'center' }}>
          <SkeletonAvatar style={{ margin: '0 auto' }} />
          <div style={{ marginTop: '12px' }}>
            <SkeletonText height="16px" width="80%" />
          </div>
          <div style={{ marginTop: '6px' }}>
            <SkeletonText height="12px" width="60%" />
          </div>
        </div>
      ))}
    </SkeletonGrid>
  </SkeletonCard>
);

export const RecentlyPlayedLoadingSkeleton: React.FC = () => (
  <SkeletonCard>
    <SkeletonText height="24px" width="50%" />
    <div style={{ marginTop: '24px' }}>
      {[...Array(8)].map((_, index) => (
        <TrackSkeletonContainer key={index}>
          <SkeletonAlbumArt style={{ width: '48px', height: '48px' }} />
          <TrackSkeletonContent>
            <SkeletonText height="16px" width="70%" />
            <SkeletonText height="14px" width="50%" />
            <SkeletonText height="12px" width="30%" />
          </TrackSkeletonContent>
        </TrackSkeletonContainer>
      ))}
    </div>
  </SkeletonCard>
);

// Unified loading skeleton component
interface LoadingSkeletonProps {
  type: 'home' | 'currentlyPlaying' | 'topArtists' | 'recentlyPlayed';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  switch (type) {
    case 'home':
      return <HomeLoadingSkeleton />;
    case 'currentlyPlaying':
      return <CurrentlyPlayingLoadingSkeleton />;
    case 'topArtists':
      return <TopArtistsLoadingSkeleton />;
    case 'recentlyPlayed':
      return <RecentlyPlayedLoadingSkeleton />;
    default:
      return <HomeLoadingSkeleton />;
  }
};

export default LoadingSkeleton;
