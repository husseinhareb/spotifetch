import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../services/store";
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic, 
  faChartLine, 
  faHistory, 
  faFire, 
  faClock,
  faPlay,
  faUser,
  faMicrophone,
  faCompactDisc,
  faSun,
  faMoon,
  faCloudSun
} from '@fortawesome/free-solid-svg-icons';

import TopArtists from "./TopArtists";
import CurrentlyPlaying from "./CurrentlyPlaying";
// WelcomeSection removed to show Home immediately
import LoadingSkeleton from "./LoadingSkeleton";
import RecentlyPlayed from "../Library/RecentlyPlayed";

// Animations
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

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(29, 185, 84, 0.3); }
  50% { box-shadow: 0 0 40px rgba(29, 185, 84, 0.6); }
`;

// Styled components
const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  color: white;
  padding: 20px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 0;
  background: radial-gradient(ellipse at center, rgba(29, 185, 84, 0.1) 0%, transparent 70%);
`;

const GreetingIcon = styled.div`
  font-size: 3rem;
  color: #1DB954;
  margin-bottom: 16px;
  animation: ${float} 3s ease-in-out infinite;
`;

const WelcomeMessage = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1DB954, #1ed760, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(29, 185, 84, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #b3b3b3;
  margin-bottom: 40px;
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto 40px;
  
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
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  background: linear-gradient(135deg, #1DB954, #1ed760);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionIcon = styled.div`
  font-size: 1.5rem;
  color: #1DB954;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  margin-top: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const MainPanel = styled.div`
  min-height: 600px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'secondary' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'linear-gradient(135deg, #1DB954, #1ed760)'
  };
  color: white;
  border: ${props => 
    props.variant === 'secondary' 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : 'none'
  };
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => 
      props.variant === 'secondary' 
        ? '0 8px 25px rgba(255, 255, 255, 0.1)' 
        : '0 8px 25px rgba(29, 185, 84, 0.4)'
    };
    background: ${props => 
      props.variant === 'secondary' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'linear-gradient(135deg, #1ed760, #1DB954)'
    };
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, username } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPlays: 1247,
    favoriteArtists: 42,
    hoursListened: 234,
    newDiscoveries: 18
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Assume user has data and show Home immediately when logged in
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = [
      { range: [5, 12], text: "Good Morning", icon: faSun },
      { range: [12, 17], text: "Good Afternoon", icon: faCloudSun },
      { range: [17, 22], text: "Good Evening", icon: faMoon },
      { range: [22, 5], text: "Good Night", icon: faMoon }
    ];
    
    return greetings.find(g => 
      g.range[0] <= g.range[1] ? 
      (hour >= g.range[0] && hour < g.range[1]) :
      (hour >= g.range[0] || hour < g.range[1])
    ) || greetings[0];
  };

  const greeting = getGreeting();

  // Show loading skeletons if explicitly loading (rare)
  if (isLoading) {
    return (
      <HomeContainer>
        <LoadingSkeleton type="home" />
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <GreetingIcon>
          <FontAwesomeIcon icon={greeting.icon} />
        </GreetingIcon>
        <WelcomeMessage>
          {greeting.text}, {username}!
        </WelcomeMessage>
        <Subtitle>
          Ready to dive into your musical world? 🎵
        </Subtitle>
        
        {/* Quick Stats */}
        <QuickStatsGrid>
          <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <StatIcon><FontAwesomeIcon icon={faPlay} /></StatIcon>
            <StatValue>{stats.totalPlays.toLocaleString()}</StatValue>
            <StatLabel>Total Plays</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <StatIcon><FontAwesomeIcon icon={faMicrophone} /></StatIcon>
            <StatValue>{stats.favoriteArtists}</StatValue>
            <StatLabel>Favorite Artists</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <StatIcon><FontAwesomeIcon icon={faClock} /></StatIcon>
            <StatValue>{stats.hoursListened}h</StatValue>
            <StatLabel>Hours Listened</StatLabel>
          </StatCard>
          
          <StatCard gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <StatIcon><FontAwesomeIcon icon={faFire} /></StatIcon>
            <StatValue>{stats.newDiscoveries}</StatValue>
            <StatLabel>New Discoveries</StatLabel>
          </StatCard>
        </QuickStatsGrid>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <ActionButton variant="primary" onClick={() => navigate('/reports')}>
            <FontAwesomeIcon icon={faChartLine} />
            View Analytics
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => navigate('/library')}>
            <FontAwesomeIcon icon={faCompactDisc} />
            Browse Library
          </ActionButton>
        </div>
      </HeroSection>

      {/* Main Content */}
      <MainContent>
        {/* Currently Playing Section */}
        <SectionHeader>
          <SectionIcon><FontAwesomeIcon icon={faMusic} /></SectionIcon>
          <SectionTitle>Now Playing</SectionTitle>
        </SectionHeader>
        <CurrentlyPlaying />

        {/* Content Grid */}
        <ContentGrid>
          <SidePanel>
            {/* Top Artists Section */}
            <div>
              <SectionHeader>
                <SectionIcon><FontAwesomeIcon icon={faUser} /></SectionIcon>
                <SectionTitle>Your Top Artists</SectionTitle>
              </SectionHeader>
              <TopArtists />
            </div>
          </SidePanel>

          <MainPanel>
            {/* Recent Activity Section */}
            <SectionHeader>
              <SectionIcon><FontAwesomeIcon icon={faHistory} /></SectionIcon>
              <SectionTitle>Recent Activity</SectionTitle>
            </SectionHeader>
            <RecentlyPlayed />
          </MainPanel>
        </ContentGrid>
      </MainContent>
    </HomeContainer>
  );
};

export default Home;
