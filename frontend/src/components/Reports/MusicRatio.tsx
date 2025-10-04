import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import {
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowUp, 
  faArrowDown, 
  faMusic, 
  faCompactDisc, 
  faMicrophone,
  faChartLine,
  faChartSimple
} from '@fortawesome/free-solid-svg-icons';

interface MusicRatioProps {
  currentTracks: number;
  lastTracks: number;
  currentAlbums: number;
  lastAlbums: number;
  currentArtists: number;
  lastArtists: number;
}

// Enhanced animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  background: ${({ theme }) => theme.colors.backgroundSolid};
  border-radius: 16px;
  padding: 32px;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${slideIn} 0.8s ease-out;
`;

const MetricsSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${slideIn} 1s ease-out;
`;

const MetricCard = styled.div<{ color: string }>`
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}10);
  border: 1px solid ${props => props.color}40;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.color}20;
    animation: ${pulse} 2s infinite;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MetricTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary || '#ccc'};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
`;

const MetricComparison = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const ComparisonText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary || '#888'};
  font-size: 0.85rem;
`;

const ChangeIndicator = styled.div<{ positive: boolean; significant: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => props.positive ? (props.significant ? 'rgba(22,163,74,0.12)' : 'rgba(22,163,74,0.06)') : (props.significant ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)')};
  color: ${props => props.positive ? '#4ADE80' : '#FF6B6B'};
  font-size: 0.8rem;
  font-weight: bold;
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CustomTooltip = ({ active, payload }: any) => {
  const theme: any = useTheme();
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: theme.colors.backgroundSolid,
        border: `1px solid ${theme.colors.buttonBackground}`,
        borderRadius: '8px',
        padding: '12px',
        color: theme.colors.text,
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px', color: theme.colors.text }}>
          {payload[0].payload.name}
        </p>
        <p style={{ margin: 0, color: payload[0].color }}>
          Progress: {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const MusicRatio: React.FC<MusicRatioProps> = ({
  currentTracks,
  lastTracks,
  currentAlbums,
  lastAlbums,
  currentArtists,
  lastArtists,
}) => {
  // Enhanced calculation with better handling
  const safePercent = (curr: number, last: number) => {
    if (!Number.isFinite(curr) || !Number.isFinite(last) || curr < 0 || last < 0) return 0;
    const total = curr + last;
    if (total === 0) return 50; // Default to 50% if no data
    return (curr / total) * 100;
  };

  const calculateChange = (current: number, last: number) => {
    if (last === 0) return { percent: 0, positive: true, significant: false };
    const change = ((current - last) / last) * 100;
    return {
      percent: Math.abs(change),
      positive: change >= 0,
      significant: Math.abs(change) > 10
    };
  };

  const tracksChange = calculateChange(currentTracks, lastTracks);
  const albumsChange = calculateChange(currentAlbums, lastAlbums);
  const artistsChange = calculateChange(currentArtists, lastArtists);

  const theme: any = useTheme();

  const radialData = [
    { 
      name: 'Artists', 
      value: safePercent(currentArtists, lastArtists), 
      fill: theme?.colors?.accent || '#C084FC',
      current: currentArtists,
      last: lastArtists
    },
    { 
      name: 'Albums', 
      value: safePercent(currentAlbums, lastAlbums), 
      fill: theme?.colors?.accent || '#4ADE80',
      current: currentAlbums,
      last: lastAlbums
    },
    { 
      name: 'Tracks', 
      value: safePercent(currentTracks, lastTracks), 
      fill: theme?.colors?.accent || '#60A5FA',
      current: currentTracks,
      last: lastTracks
    },
  ];

  const comparisonData = [
    { name: 'Tracks', current: currentTracks, previous: lastTracks },
    { name: 'Albums', current: currentAlbums, previous: lastAlbums },
    { name: 'Artists', current: currentArtists, previous: lastArtists },
  ];

  return (
    <Container>
      {/* Enhanced Chart Section */}
      <ChartSection>
        <ChartTitle>
          <FontAwesomeIcon icon={faMusic} />
          Current vs Previous Period
        </ChartTitle>
        
        {/* Compact numeric summary replacing the ring visualization */}
        <div style={{ width: '100%', marginBottom: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {radialData.map((d) => (
            <div key={d.name} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: '0.8rem', color: theme?.colors?.textSecondary || '#bbb', marginBottom: 6 }}>{d.name}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: theme?.colors?.text || '#fff' }}>{Math.round(d.value)}%</div>
              <div style={{ fontSize: '0.8rem', color: theme?.colors?.textSecondary || '#9aa0a6' }}>{d.current}/{d.last}</div>
            </div>
          ))}
        </div>

        {/* Comparison Bar Chart */}
        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme?.colors?.buttonBackground || '#333'} />
              <XAxis dataKey="name" stroke={theme?.colors?.textSecondary || '#ccc'} fontSize={12} />
              <YAxis stroke={theme?.colors?.textSecondary || '#ccc'} fontSize={12} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.backgroundSolid,
                  border: `1px solid ${theme.colors.buttonBackground}`,
                  borderRadius: '8px',
                  color: theme.colors.text
                }}
              />
              <Bar dataKey="previous" fill={theme?.colors?.buttonBackground || '#666'} name="Previous Period" />
              <Bar dataKey="current" fill={theme?.colors?.accent || '#1DB954'} name="Current Period" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Enhanced Metrics Section */}
      <MetricsSection>
        <MetricCard color="#60A5FA">
          <MetricHeader>
            <MetricTitle>
              <FontAwesomeIcon icon={faMusic} />
              Unique Tracks
            </MetricTitle>
            <ChangeIndicator 
              positive={tracksChange.positive} 
              significant={tracksChange.significant}
            >
              <FontAwesomeIcon icon={tracksChange.positive ? faArrowUp : faArrowDown} />
              {tracksChange.percent.toFixed(1)}%
            </ChangeIndicator>
          </MetricHeader>
          <MetricValue>{currentTracks.toLocaleString()}</MetricValue>
          <MetricComparison>
            <ComparisonText>Previous: {lastTracks.toLocaleString()}</ComparisonText>
            <ComparisonText>
              {tracksChange.positive ? '+' : '-'}{Math.abs(currentTracks - lastTracks)} tracks
            </ComparisonText>
          </MetricComparison>
        </MetricCard>

        <MetricCard color="#4ADE80">
          <MetricHeader>
            <MetricTitle>
              <FontAwesomeIcon icon={faCompactDisc} />
              Unique Albums
            </MetricTitle>
            <ChangeIndicator 
              positive={albumsChange.positive} 
              significant={albumsChange.significant}
            >
              <FontAwesomeIcon icon={albumsChange.positive ? faArrowUp : faArrowDown} />
              {albumsChange.percent.toFixed(1)}%
            </ChangeIndicator>
          </MetricHeader>
          <MetricValue>{currentAlbums.toLocaleString()}</MetricValue>
          <MetricComparison>
            <ComparisonText>Previous: {lastAlbums.toLocaleString()}</ComparisonText>
            <ComparisonText>
              {albumsChange.positive ? '+' : '-'}{Math.abs(currentAlbums - lastAlbums)} albums
            </ComparisonText>
          </MetricComparison>
        </MetricCard>

        <MetricCard color="#C084FC">
          <MetricHeader>
            <MetricTitle>
              <FontAwesomeIcon icon={faMicrophone} />
              Unique Artists
            </MetricTitle>
            <ChangeIndicator 
              positive={artistsChange.positive} 
              significant={artistsChange.significant}
            >
              <FontAwesomeIcon icon={artistsChange.positive ? faArrowUp : faArrowDown} />
              {artistsChange.percent.toFixed(1)}%
            </ChangeIndicator>
          </MetricHeader>
          <MetricValue>{currentArtists.toLocaleString()}</MetricValue>
          <MetricComparison>
            <ComparisonText>Previous: {lastArtists.toLocaleString()}</ComparisonText>
            <ComparisonText>
              {artistsChange.positive ? '+' : '-'}{Math.abs(currentArtists - lastArtists)} artists
            </ComparisonText>
          </MetricComparison>
        </MetricCard>
      </MetricsSection>
    </Container>
  );
};

export default MusicRatio;
