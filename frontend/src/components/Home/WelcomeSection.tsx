import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMusic, 
  faChartLine, 
  faUsers, 
  faStar,
  faPlay,
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
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

// Styled components
const WelcomeContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 24px;
  padding: 48px 32px;
  margin: 32px 0;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.06);
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

const WelcomeIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;
`;

const WelcomeTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #1ed760);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 48px;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.buttonBackground};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  transition: all 0.3s ease;
  animation: ${slideInLeft} 0.8s ease-out;
  
  &:nth-child(even) {
    animation: ${slideInRight} 0.8s ease-out;
  }
  
  &:hover {
    transform: translateY(-8px);
    background: ${({ theme }) => theme.colors.backgroundSolid};
    border-color: rgba(29, 185, 84, 0.16);
    animation: ${glow} 2s infinite;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const GetStartedButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #1ed760);
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  padding: 16px 32px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(29, 185, 84, 0.4);
    background: linear-gradient(135deg, #1ed760, #1DB954);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface WelcomeSectionProps {
  username?: string;
  onGetStarted?: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  username = "music lover", 
  onGetStarted 
}) => {
  const features = [
    {
      icon: faMusic,
      title: "Track Your Music",
      description: "See what you're currently playing and discover your listening patterns in real-time."
    },
    {
      icon: faChartLine,
      title: "Detailed Analytics",
      description: "Dive deep into your music statistics with beautiful charts and insights."
    },
    {
      icon: faUsers,
      title: "Discover Top Artists",
      description: "Explore your most played artists across different time periods."
    },
    {
      icon: faStar,
      title: "Personal Insights",
      description: "Get personalized recommendations based on your unique listening habits."
    }
  ];

  return (
    <WelcomeContainer>
      <WelcomeIcon>
        <FontAwesomeIcon icon={faMusic} />
      </WelcomeIcon>
      
      <WelcomeTitle>
        Welcome to Your Music Universe, {username}!
      </WelcomeTitle>
      
      <WelcomeSubtitle>
        Discover the story behind your music with powerful analytics, 
        real-time tracking, and personalized insights that reveal your unique musical journey.
      </WelcomeSubtitle>
      
      {onGetStarted && (
        <GetStartedButton onClick={onGetStarted}>
          <FontAwesomeIcon icon={faPlay} />
          Get Started
          <FontAwesomeIcon icon={faArrowRight} />
        </GetStartedButton>
      )}
      
      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index} style={{ animationDelay: `${index * 0.2}s` }}>
            <FeatureIcon>
              <FontAwesomeIcon icon={feature.icon} />
            </FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </WelcomeContainer>
  );
};

export default WelcomeSection;
