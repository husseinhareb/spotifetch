import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faClock,
  faCompactDisc,
  faUser,
  faHeadphones,
  faChartLine,
  faStar,
  faFire,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import RecentlyPlayed from "./RecentlyPlayed";
import Songs from "./Songs";
import Artists from "./Artists";
import Albums from "./Albums";
import { useUserId } from "../../services/store";
import { getMusicRatio, getListeningClock } from "../../repositories/reportsRepository";
import { fetchTopTracks, fetchTopArtists, fetchTopAlbums } from "../../repositories/historyRepository";

// Enhanced animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
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

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(29, 185, 84, 0.3); }
  50% { box-shadow: 0 0 40px rgba(29, 185, 84, 0.6); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Enhanced styled components
const LibraryContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 20px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 40px 0;
  background: radial-gradient(ellipse at center, rgba(29, 185, 84, 0.06) 0%, transparent 70%);
  border-radius: 24px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(29, 185, 84, 0.06), transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const LibraryIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 16px;
  animation: ${float} 3s ease-in-out infinite;
`;

const LibraryTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  /* keep the visual gradient but rely on accent for primary color */
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #1ed760, ${({ theme }) => theme.colors.backgroundSolid});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(29, 185, 84, 0.3);
  animation: ${slideIn} 1s ease-out;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const LibrarySubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
  animation: ${slideIn} 1s ease-out 0.2s both;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto 40px;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ $gradient?: string }>`
  background: ${({ $gradient }) => $gradient || 'transparent'};
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    animation: ${glow} 2s infinite;
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavigationSection = styled.div`
  background: ${({ theme }) => theme.colors.buttonBackground};
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  backdrop-filter: blur(10px);
`;

const NavTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NavCard = styled(Link)<{ active?: boolean }>`
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${props.theme.colors.accent}, #1ed760)` 
    : props.theme.colors.buttonBackground
  };
  border: 1px solid ${props => props.active 
    ? 'rgba(29, 185, 84, 0.5)' 
    : props.theme.colors.buttonBackground
  };
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  display: block;
  
  &:hover {
    transform: translateY(-4px);
    background: ${props => props.active 
      ? `linear-gradient(135deg, #1ed760, ${props.theme.colors.accent})` 
      : props.theme.colors.backgroundSolid
    };
    border-color: ${props => props.active 
      ? 'rgba(29, 185, 84, 0.8)' 
      : 'rgba(29, 185, 84, 0.2)'
    };
    box-shadow: 0 12px 40px rgba(29, 185, 84, 0.12);
  }
`;

const NavCardIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: inherit;
`;

const NavCardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: inherit;
`;

const NavCardDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.3;
`;

const ContentSection = styled.div`
  margin-top: 24px;
  background: transparent;
`;

/* ----- Component ----- */

const Library = () => {
  const location = useLocation();
  const userId = useUserId();
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    totalAlbums: 0,
    hoursListened: 0
  });

  useEffect(() => {
    if (!userId || userId === 'N/A') return;

    const loadStats = async () => {
      try {
        // Fetch the listening clock and the full top lists (request a large limit)
        // and derive totals from the returned array lengths. This is more reliable
        // than counting uniques from a paginated raw history fetch.
        const [clock, topTracks, topArtists, topAlbums] = await Promise.all([
          getListeningClock(userId),
          fetchTopTracks(userId, 100),
          fetchTopArtists(userId, 100),
          fetchTopAlbums(userId, 100),
        ]);

        // Derive totals from returned arrays. If the backend enforces a hard cap
        // on the limit, consider adding dedicated aggregated-count endpoints.
        const totalPlays = (clock || []).reduce((s, v) => s + v, 0);

        // Estimate hours listened by assuming an average track length (3.5 minutes)
        // hours = plays * avgMinutes / 60
        const avgMinutesPerPlay = 3.5;
        const hoursListened = Math.round((totalPlays * avgMinutesPerPlay) / 60);

        // If the top lists are empty (e.g. validation error upstream), fall back to
        // the aggregated ratio which computes unique counts server-side.
        if ((topTracks || []).length === 0 && (topArtists || []).length === 0 && (topAlbums || []).length === 0) {
          try {
            const ratio = await getMusicRatio(userId, 365);
            setStats({
              totalTracks: ratio.tracks || 0,
              totalArtists: ratio.artists || 0,
              totalAlbums: ratio.albums || 0,
              hoursListened
            });
            return;
          } catch (innerErr) {
            console.error('Fallback getMusicRatio failed', innerErr);
          }
        }

        setStats({
          totalTracks: (topTracks || []).length || 0,
          totalArtists: (topArtists || []).length || 0,
          totalAlbums: (topAlbums || []).length || 0,
          hoursListened
        });
      } catch (e) {
        // keep defaults on error
        console.error('Failed loading library stats', e);
      }
    };

    loadStats();
  }, [userId]);

  // Determine active section
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('songs')) return 'songs';
    if (path.includes('artists')) return 'artists';
    if (path.includes('albums')) return 'albums';
    return 'recently-played';
  };

  const activeSection = getActiveSection();

  const navigationItems = [
    {
      key: 'recently-played',
      path: 'recently-played',
      icon: faClock,
      title: 'Recently Played',
      description: 'See your latest listening activity and discover patterns in your music taste'
    },
    {
      key: 'songs',
      path: 'songs',
      icon: faMusic,
      title: 'Top Songs',
      description: 'Your most played tracks across all time with detailed play counts'
    },
    {
      key: 'artists',
      path: 'artists',
      icon: faUser,
      title: 'Top Artists',
      description: 'Discover your favorite artists and explore their music catalogs'
    },
    {
      key: 'albums',
      path: 'albums',
      icon: faCompactDisc,
      title: 'Top Albums',
      description: 'Browse through albums you\'ve listened to most frequently'
    }
  ];

  return (
    <LibraryContainer>
      {/* Hero Section */}
      <HeroSection>
        <LibraryIcon>
          <FontAwesomeIcon icon={faHeadphones} />
        </LibraryIcon>
        <LibraryTitle>Your Music Library</LibraryTitle>
        <LibrarySubtitle>
          Explore your musical journey with detailed insights and analytics
        </LibrarySubtitle>
        
        {/* Quick Stats */}
        <StatsGrid>
          <StatCard $gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <StatIcon><FontAwesomeIcon icon={faMusic} /></StatIcon>
            <StatValue>{stats.totalTracks.toLocaleString()}</StatValue>
            <StatLabel>Total Tracks</StatLabel>
          </StatCard>
          
          <StatCard $gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <StatIcon><FontAwesomeIcon icon={faUser} /></StatIcon>
            <StatValue>{stats.totalArtists}</StatValue>
            <StatLabel>Artists</StatLabel>
          </StatCard>
          
          <StatCard $gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <StatIcon><FontAwesomeIcon icon={faCompactDisc} /></StatIcon>
            <StatValue>{stats.totalAlbums}</StatValue>
            <StatLabel>Albums</StatLabel>
          </StatCard>
          
          <StatCard $gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <StatIcon><FontAwesomeIcon icon={faClock} /></StatIcon>
            <StatValue>{stats.hoursListened}h</StatValue>
            <StatLabel>Hours Listened</StatLabel>
          </StatCard>
        </StatsGrid>
      </HeroSection>

      {/* Navigation Section */}
      <NavigationSection>
        <NavTitle>
          <FontAwesomeIcon icon={faChartLine} />
          Browse Your Library
        </NavTitle>
        <NavGrid>
          {navigationItems.map((item) => (
            <NavCard
              key={item.key}
              active={activeSection === item.key}
              to={`/library/${item.path}`}
            >
              <NavCardIcon>
                <FontAwesomeIcon icon={item.icon} />
              </NavCardIcon>
              <NavCardTitle>{item.title}</NavCardTitle>
              <NavCardDescription>{item.description}</NavCardDescription>
            </NavCard>
          ))}
        </NavGrid>
      </NavigationSection>

      {/* Content Section */}
      <ContentSection>
        <Routes>
          <Route index element={<RecentlyPlayed />} />
          <Route path="recently-played" element={<RecentlyPlayed />} />
          <Route path="songs" element={<Songs />} />
          <Route path="artists" element={<Artists />} />
          <Route path="albums" element={<Albums />} />
        </Routes>
      </ContentSection>
    </LibraryContainer>
  );
};

export default Library;
