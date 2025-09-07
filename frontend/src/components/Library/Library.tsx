import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  color: white;
  padding: 20px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 40px 0;
  background: radial-gradient(ellipse at center, rgba(29, 185, 84, 0.1) 0%, transparent 70%);
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
    background: linear-gradient(90deg, transparent, rgba(29, 185, 84, 0.1), transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const LibraryIcon = styled.div`
  font-size: 4rem;
  color: #1DB954;
  margin-bottom: 16px;
  animation: ${float} 3s ease-in-out infinite;
`;

const LibraryTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1DB954, #1ed760, #ffffff);
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
  color: #b3b3b3;
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

const StatCard = styled.div<{ gradient: string }>`
  background: ${props => props.gradient};
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    animation: ${glow} 2s infinite;
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavigationSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const NavTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
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

const NavCard = styled.div<{ active?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #1DB954, #1ed760)' 
    : 'rgba(255, 255, 255, 0.03)'
  };
  border: 1px solid ${props => props.active 
    ? 'rgba(29, 185, 84, 0.5)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;
  display: block;
  
  &:hover {
    transform: translateY(-4px);
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #1ed760, #1DB954)' 
      : 'rgba(255, 255, 255, 0.08)'
    };
    border-color: ${props => props.active 
      ? 'rgba(29, 185, 84, 0.8)' 
      : 'rgba(29, 185, 84, 0.3)'
    };
    box-shadow: 0 12px 40px rgba(29, 185, 84, 0.2);
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
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
`;

const ContentSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 600px;
  backdrop-filter: blur(10px);
`;

const Library: React.FC = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalTracks: 1547,
    totalArtists: 234,
    totalAlbums: 189,
    hoursListened: 1250
  });

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
          <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <StatIcon><FontAwesomeIcon icon={faMusic} /></StatIcon>
            <StatValue>{stats.totalTracks.toLocaleString()}</StatValue>
            <StatLabel>Total Tracks</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <StatIcon><FontAwesomeIcon icon={faUser} /></StatIcon>
            <StatValue>{stats.totalArtists}</StatValue>
            <StatLabel>Artists</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <StatIcon><FontAwesomeIcon icon={faCompactDisc} /></StatIcon>
            <StatValue>{stats.totalAlbums}</StatValue>
            <StatLabel>Albums</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
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
              as="a"
              href={`#/library/${item.path}`}
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = `/library/${item.path}`;
              }}
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
