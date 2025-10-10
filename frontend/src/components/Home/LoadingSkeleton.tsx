// src/components/Home/LoadingSkeleton.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

/* ---------------- Animations ---------------- */
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
`;

/* ---------------- Base blocks ---------------- */
const SkeletonBlock = styled.div`
  background: ${({ theme }) =>
    theme.name === 'dark'
      ? 'linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.06) 75%)'
      : 'linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.09) 50%, rgba(0,0,0,.06) 75%)'};
  background-size: 200px 100%;
  animation: ${shimmer} 1.4s linear infinite;
  border-radius: 8px;
`;

const CardChrome = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSolid};
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  border-radius: 20px;             /* matches PlayerContainer & TopArtistsContainer */
  padding: 32px;                   /* matches real components */
  animation: ${pulse} 2s infinite;
`;

const Line = styled(SkeletonBlock)<{ w?: string; h?: string; r?: string }>`
  width: ${({ w }) => w ?? '100%'};
  height: ${({ h }) => h ?? '14px'};
  border-radius: ${({ r }) => r ?? '8px'};
`;

const Circle = styled(SkeletonBlock)<{ s?: string }>`
  width: ${({ s }) => s ?? '48px'};
  height: ${({ s }) => s ?? '48px'};
  border-radius: 50%;
`;

/* ---------------- Page-level wrapper ---------------- */
const Page = styled.div`
  padding: 20px;
`;

/* ---------------- Hero (greeting + stat cards) ---------------- */
const Hero = styled.div`
  text-align: center;
  padding: 60px 0;
`;
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;
const StatCard = styled.div`
  border-radius: 16px;             /* matches StatCard */
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
`;
const StatInner = styled.div`
  display: grid;
  place-items: center;
  gap: 12px;
`;

/* ---------------- Now Playing ---------------- */
const NowPlayingRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    text-align: center;
  }
`;
const AlbumArt = styled(SkeletonBlock)`
  width: 120px;                     /* matches AlbumArtContainer */
  height: 120px;
  border-radius: 12px;
  @media (max-width: 768px) { width: 160px; height: 160px; margin: 0 auto; }
`;
const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;                      /* matches ProgressContainer height */
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.buttonBackground};
  overflow: hidden;
`;
const ProgressFill = styled(SkeletonBlock)`
  height: 100%;
  width: 65%;
  border-radius: 3px;
`;

/* ---------------- Top Artists ---------------- */
const SectionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;
const Chips = styled.div`
  display: flex; gap: 8px;
`;
const Chip = styled(SkeletonBlock)`
  height: 28px; width: 78px; border-radius: 6px;
`;

const ArtistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); gap: 16px; }
`;
const ArtistTile = styled(SkeletonBlock)<{ featured?: boolean }>`
  border-radius: 16px; 
  aspect-ratio: 1;
  ${({ featured }) => featured && `
    grid-column: span 2;
    aspect-ratio: 2 / 1;
    @media (max-width: 768px) { grid-column: span 2; aspect-ratio: 1; }
  `}
  position: relative;
`;
const RankDot = styled(SkeletonBlock)`
  position: absolute; top: 12px; left: 12px;
  width: 32px; height: 32px; border-radius: 50%;
`;

/* ---------------- Recently Played ---------------- */
const TrackRow = styled.div`
  display: flex; align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)'};
`;
const Thumb = styled(SkeletonBlock)`
  width: 48px; height: 48px; border-radius: 8px;
`;

/* ===========================================================
   PUBLIC SKELETONS
   =========================================================== */

export const HomePageSkeleton: React.FC = () => (
  <Page>
    {/* Hero */}
    <Hero>
      <Circle s="56px" style={{ margin: '0 auto 16px' }} />
      <Line h="42px" w="420px" style={{ margin: '0 auto 12px' }} />
      <Line h="18px" w="320px" style={{ margin: '0 auto 32px' }} />
      <StatGrid>
        {[0,1,2,3].map(i => (
          <StatCard key={i}>
            <StatInner>
              <Circle s="40px" />
              <Line h="28px" w="90px" />
              <Line h="10px" w="120px" />
            </StatInner>
          </StatCard>
        ))}
      </StatGrid>
    </Hero>

    {/* Now Playing */}
    <CardChrome style={{ margin: '20px 0' }}>
      <NowPlayingRow>
        <AlbumArt />
        <div>
          <Line h="24px" w="60%" />
          <div style={{ marginTop: 8 }}><Line h="16px" w="40%" /></div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
              <Line h="12px" w="40px" r="4px" />
              <Line h="12px" w="40px" r="4px" />
            </div>
            <ProgressTrack><ProgressFill /></ProgressTrack>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <Circle s="48px" />
          <Circle s="48px" />
        </div>
      </NowPlayingRow>
    </CardChrome>

    {/* Content grid: Top Artists (left) + Recent Activity (right) */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:40, marginTop:40 }}>
      {/* Top Artists */}
      <CardChrome>
        <SectionBar>
          <Line h="24px" w="140px" />
          <Chips>
            <Chip /><Chip /><Chip />
          </Chips>
        </SectionBar>
        <ArtistsGrid>
          {[0,1,2,3,4].map((i) => (
            <ArtistTile key={i} featured={i===0}>
              <RankDot />
            </ArtistTile>
          ))}
        </ArtistsGrid>
      </CardChrome>

      {/* Recently Played */}
      <CardChrome>
        <SectionBar>
          <Line h="24px" w="160px" />
        </SectionBar>
        <div style={{ display:'grid', gap:12 }}>
          {[...Array(8)].map((_, i) => (
            <TrackRow key={i}>
              <Thumb />
              <div style={{ flex:1 }}>
                <Line h="16px" w="70%" />
                <div style={{ marginTop:6 }}><Line h="14px" w="50%" /></div>
                <div style={{ marginTop:6 }}><Line h="12px" w="30%" /></div>
              </div>
            </TrackRow>
          ))}
        </div>
      </CardChrome>
    </div>
  </Page>
);

/* Smaller, section-only skeletons you can use inline */
export const NowPlayingSkeleton = () => (
  <CardChrome style={{ margin: '20px 0' }}>
    <NowPlayingRow>
      <AlbumArt />
      <div>
        <Line h="24px" w="60%" />
        <div style={{ marginTop: 8 }}><Line h="16px" w="40%" /></div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
            <Line h="12px" w="40px" r="4px" />
            <Line h="12px" w="40px" r="4px" />
          </div>
          <ProgressTrack><ProgressFill /></ProgressTrack>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <Circle s="48px" />
        <Circle s="48px" />
      </div>
    </NowPlayingRow>
  </CardChrome>
);

export const TopArtistsSkeleton = () => (
  <CardChrome>
    <SectionBar>
      <Line h="24px" w="140px" />
      <Chips><Chip /><Chip /><Chip /></Chips>
    </SectionBar>
    <ArtistsGrid>
      {[0,1,2,3,4].map((i) => (
        <ArtistTile key={i} featured={i===0}>
          <RankDot />
        </ArtistTile>
      ))}
    </ArtistsGrid>
  </CardChrome>
);

export const RecentlyPlayedSkeleton = () => (
  <CardChrome>
    <SectionBar>
      <Line h="24px" w="160px" />
    </SectionBar>
    <div style={{ display:'grid', gap:12 }}>
      {[...Array(8)].map((_, i) => (
        <TrackRow key={i}>
          <Thumb />
          <div style={{ flex:1 }}>
            <Line h="16px" w="70%" />
            <div style={{ marginTop:6 }}><Line h="14px" w="50%" /></div>
            <div style={{ marginTop:6 }}><Line h="12px" w="30%" /></div>
          </div>
        </TrackRow>
      ))}
    </div>
  </CardChrome>
);

/* Unified switch */
interface LoadingSkeletonProps {
  type: 'home' | 'currentlyPlaying' | 'topArtists' | 'recentlyPlayed';
}
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  switch (type) {
    case 'home': return <HomePageSkeleton />;
    case 'currentlyPlaying': return <NowPlayingSkeleton />;
    case 'topArtists': return <TopArtistsSkeleton />;
    case 'recentlyPlayed': return <RecentlyPlayedSkeleton />;
    default: return <HomePageSkeleton />;
  }
};
export default LoadingSkeleton;
