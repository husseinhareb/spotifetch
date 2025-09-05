// src/components/Reports/Reports.tsx
import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import { startOfWeek, endOfWeek, subDays, addDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faChartLine, 
  faMusic, 
  faClock, 
  faFire,
  faArrowUp,
  faArrowDown,
  faFilter,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';

import { useUserId, useIsLoggedIn } from '../../services/store';
import {
  fetchReports,
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  getMusicRatio,
  getListeningFingerprint,
  getListeningClock,
  TopArtist,
  TopAlbum,
  TopTrack,
  Fingerprint,
} from '../../repositories/reportsRepository';

import RadialHourChart from './RadialHourChart';
import TopMusic from './TopMusic';
import MusicRatio from './MusicRatio';

import {
  Section,
  ChartBox,
  ChartTitle,
  Container,
  Label,
  Value,
} from './Styles/style';

// ────────────────────────────────────────────────────────────
// "Raw" shape coming back from your repo
// ────────────────────────────────────────────────────────────
interface RawMusicRatio {
  tracks: number;
  albums: number;
  artists: number;
  lastTracks: number;
  lastAlbums: number;
  lastArtists: number;
}

// ────────────────────────────────────────────────────────────
// Enhanced interfaces for new features
// ────────────────────────────────────────────────────────────
interface TimeRange {
  label: string;
  value: 'week' | 'month' | 'quarter' | 'year';
  days: number;
}

interface TrendData {
  date: string;
  tracks: number;
  albums: number;
  artists: number;
  totalPlays: number;
}

interface GenreData {
  name: string;
  value: number;
  color: string;
}

// ────────────────────────────────────────────────────────────
// Constants & Styled Components
// ────────────────────────────────────────────────────────────
const DONUT_COLORS = {
  tracks: '#60A5FA',
  albums: '#4ADE80',
  artists: '#C084FC',
  primary: '#1DB954',    // Spotify green
  secondary: '#191414',  // Spotify black
  accent: '#FF6B6B',     // Coral red
  warning: '#FFD93D',    // Yellow
  info: '#6BCF7F',       // Light green
};

const TIME_RANGES: TimeRange[] = [
  { label: 'Last Week', value: 'week', days: 7 },
  { label: 'Last Month', value: 'month', days: 30 },
  { label: 'Last 3 Months', value: 'quarter', days: 90 },
  { label: 'Last Year', value: 'year', days: 365 },
];

// Enhanced styled components
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #1DB954, #1ed760);
  border-radius: 12px;
  color: white;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 8px;
`;

const TimeRangeButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ gradient?: string }>`
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: ${props => props.positive ? '#4ADE80' : '#FF6B6B'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const EnhancedChartBox = styled(ChartBox)`
  background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
  border: 1px solid #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  font-size: 1.2rem;
`;

const ClockChartBox = styled(EnhancedChartBox)`
  position: relative;
  height: 400px;
`;


// ────────────────────────────────────────────────────────────
// Enhanced Charts Section with better visuals and tooltips
// ────────────────────────────────────────────────────────────
interface ChartsSectionProps {
  tracks: number;
  albums: number;
  artists: number;
  fingerprint: Fingerprint;
  globalAverage?: Fingerprint;
  trendData: TrendData[];
  genreData: GenreData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '12px',
        color: 'white'
      }}>
        <p style={{ margin: 0, marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: 0, color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartsSection: React.FC<ChartsSectionProps> = ({
  tracks,
  albums,
  artists,
  fingerprint,
  globalAverage,
  trendData,
  genreData,
}) => {
  const pieData = [
    { name: 'Tracks', value: tracks, color: DONUT_COLORS.tracks },
    { name: 'Albums', value: albums, color: DONUT_COLORS.albums },
    { name: 'Artists', value: artists, color: DONUT_COLORS.artists },
  ];

  const metrics: (keyof Fingerprint)[] = [
    'consistency',
    'discoveryRate',
    'variance',
    'concentration',
    'replayRate',
  ];

  const radarData = metrics.map((m) => ({
    metric: m.replace(/([A-Z])/g, ' $1').trim(),
    you: fingerprint[m],
    avg: globalAverage?.[m] ?? 0,
  }));

  return (
    <ChartsGrid>
      {/* Enhanced Music Ratio with animations */}
      <EnhancedChartBox>
        <ChartTitle>
          <FontAwesomeIcon icon={faMusic} style={{ marginRight: '8px' }} />
          Music Distribution
        </ChartTitle>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              animationBegin={0}
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={entry.color}
                  stroke="#333"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </EnhancedChartBox>

      {/* Enhanced Listening Fingerprint */}
      <EnhancedChartBox>
        <ChartTitle>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
          Listening Fingerprint
        </ChartTitle>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" stroke="#ccc" fontSize={12} />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Radar
              name="You"
              dataKey="you"
              stroke={DONUT_COLORS.primary}
              fill={DONUT_COLORS.primary}
              fillOpacity={0.3}
              strokeWidth={2}
              animationBegin={0}
              animationDuration={1500}
            />
            {globalAverage && (
              <Radar
                name="Average"
                dataKey="avg"
                stroke="#666"
                fill="#666"
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </EnhancedChartBox>

      {/* New Trend Analysis Chart */}
      <EnhancedChartBox style={{ gridColumn: '1 / -1' }}>
        <ChartTitle>
          <FontAwesomeIcon icon={faFire} style={{ marginRight: '8px' }} />
          Listening Trends Over Time
        </ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#ccc"
              fontSize={12}
            />
            <YAxis stroke="#ccc" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalPlays"
              fill={DONUT_COLORS.primary}
              fillOpacity={0.3}
              stroke={DONUT_COLORS.primary}
              strokeWidth={2}
              name="Total Plays"
              animationBegin={0}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="tracks"
              stroke={DONUT_COLORS.tracks}
              strokeWidth={2}
              name="Unique Tracks"
              animationBegin={500}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="albums"
              stroke={DONUT_COLORS.albums}
              strokeWidth={2}
              name="Unique Albums"
              animationBegin={1000}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="artists"
              stroke={DONUT_COLORS.artists}
              strokeWidth={2}
              name="Unique Artists"
              animationBegin={1500}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </EnhancedChartBox>

      {/* New Genre Distribution Chart */}
      {genreData.length > 0 && (
        <EnhancedChartBox>
          <ChartTitle>
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '8px' }} />
            Top Genres
          </ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={genreData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#ccc" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#ccc" 
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={DONUT_COLORS.accent}
                radius={[0, 4, 4, 0]}
                animationBegin={0}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </EnhancedChartBox>
      )}
    </ChartsGrid>
  );
};

// ────────────────────────────────────────────────────────────
// Enhanced Main Reports Component with advanced analytics
// ────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const userId = useUserId();
  const isLoggedIn = useIsLoggedIn();

  // Enhanced state management
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(TIME_RANGES[1]); // Default to month
  const [weekRange] = useState(() => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    };
  });

  // Core data
  const [weekData, setWeekData] = useState<{
    daily: number[];
    total: number;
    prevTotal: number;
  } | null>(null);
  const [musicRatio, setMusicRatio] = useState<RawMusicRatio | null>(null);
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);
  const [byHour, setByHour] = useState<number[] | null>(null);
  const [busiestHour, setBusiestHour] = useState(0);
  const [busiestCount, setBusiestCount] = useState(0);

  // Enhanced analytics data
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [totalListenTime, setTotalListenTime] = useState(0);
  const [avgSessionLength, setAvgSessionLength] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to generate mock trend data (replace with real API call)
  const generateTrendData = (reports: any[], days: number): TrendData[] => {
    const now = new Date();
    const data: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.played_at);
        return reportDate.toDateString() === date.toDateString();
      });
      
      const uniqueTracks = new Set(dayReports.map(r => r.track_id)).size;
      const uniqueAlbums = new Set(dayReports.map(r => r.album_id)).size;
      const uniqueArtists = new Set(dayReports.map(r => r.artist_id)).size;
      
      data.push({
        date: format(date, 'MMM dd'),
        tracks: uniqueTracks,
        albums: uniqueAlbums,
        artists: uniqueArtists,
        totalPlays: dayReports.length,
      });
    }
    
    return data;
  };

  // Helper function to extract genre data from top artists
  const generateGenreData = async (userId: string): Promise<GenreData[]> => {
    try {
      const topArtists = await getTopArtists(userId, 20);
      const genreCount: { [key: string]: number } = {};
      
      // This would ideally come from artist genre data
      // For now, we'll simulate with common genres
      const commonGenres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Indie', 'Jazz', 'Classical'];
      commonGenres.forEach((genre, index) => {
        genreCount[genre] = Math.max(1, topArtists.length - index * 2);
      });
      
      return Object.entries(genreCount)
        .map(([name, value]) => ({
          name,
          value,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    } catch {
      return [];
    }
  };

  const loadData = async (timeRange: TimeRange) => {
    if (!userId) return;
    
    try {
      setRefreshing(true);
      
      // 1. Fetch core data
      const [rawRatio, fp, clock, reports] = await Promise.all([
        getMusicRatio(userId, timeRange.days),
        getListeningFingerprint(userId),
        getListeningClock(userId),
        fetchReports(userId),
      ]);

      // 2. Set core data
      setMusicRatio({
        tracks: rawRatio.tracks,
        lastTracks: rawRatio.lastTracks,
        albums: rawRatio.albums,
        lastAlbums: rawRatio.lastAlbums,
        artists: rawRatio.artists,
        lastArtists: rawRatio.lastArtists,
      });
      setFingerprint(fp);
      setByHour(clock);

      const max = Math.max(...clock);
      setBusiestCount(max);
      setBusiestHour(clock.indexOf(max));

      // 3. Enhanced analytics
      const trends = generateTrendData(reports, Math.min(timeRange.days, 30));
      setTrendData(trends);

      const genres = await generateGenreData(userId);
      setGenreData(genres);

      // 4. Calculate advanced metrics
      const recentReports = reports.filter(r => {
        const reportDate = new Date(r.played_at);
        const cutoff = subDays(new Date(), timeRange.days);
        return reportDate >= cutoff;
      });

      // Simulate total listen time (3.5 minutes average per track)
      setTotalListenTime(recentReports.length * 3.5);
      
      // Calculate streak days
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const day = subDays(new Date(), i);
        const hasPlays = reports.some(r => 
          new Date(r.played_at).toDateString() === day.toDateString()
        );
        if (hasPlays) {
          streak++;
        } else {
          break;
        }
      }
      setStreakDays(streak);

      // 5. Weekly data for compatibility
      const { start, end } = weekRange;
      const lastStart = subDays(start, 7);
      const lastEnd = subDays(end, 7);
      const slice = (arr: typeof reports, s: Date, e: Date) =>
        arr.filter((h) => {
          const d = new Date(h.played_at);
          return d >= s && d <= e;
        });
      const thisW = slice(reports, start, end);
      const lastW = slice(reports, lastStart, lastEnd);
      const daily = Array.from({ length: 7 }, (_, i) => {
        const dayStr = addDays(start, i).toDateString();
        return thisW.filter((h) => new Date(h.played_at).toDateString() === dayStr).length;
      });
      setWeekData({ daily, total: thisW.length, prevTotal: lastW.length });

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedTimeRange);
  }, [userId, selectedTimeRange]);

  const handleRefresh = () => {
    loadData(selectedTimeRange);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  };

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, positive: true };
    const percent = ((current - previous) / previous) * 100;
    return { percent: Math.abs(percent), positive: percent >= 0 };
  };

  const tracksChange = musicRatio ? calculateChange(musicRatio.tracks, musicRatio.lastTracks) : { percent: 0, positive: true };
  const albumsChange = musicRatio ? calculateChange(musicRatio.albums, musicRatio.lastAlbums) : { percent: 0, positive: true };
  const artistsChange = musicRatio ? calculateChange(musicRatio.artists, musicRatio.lastArtists) : { percent: 0, positive: true };

  if (!isLoggedIn) return <Navigate to="/" replace />;
  
  if (loading || !weekData || !musicRatio || !fingerprint || !byHour) {
    return (
      <LoadingOverlay>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faRefresh} spin size="2x" style={{ marginBottom: '16px' }} />
          <div>Loading your music analytics...</div>
        </div>
      </LoadingOverlay>
    );
  }
  
  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px', color: '#ff6b6b' }}>
          <FontAwesomeIcon icon={faRefresh} size="3x" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            style={{
              background: DONUT_COLORS.primary,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Enhanced Header */}
      <HeaderSection>
        <PageTitle>
          <FontAwesomeIcon icon={faChartLine} />
          Music Analytics
        </PageTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TimeRangeSelector>
            {TIME_RANGES.map((range) => (
              <TimeRangeButton
                key={range.value}
                active={selectedTimeRange.value === range.value}
                onClick={() => handleTimeRangeChange(range)}
              >
                {range.label}
              </TimeRangeButton>
            ))}
          </TimeRangeSelector>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <FontAwesomeIcon icon={faRefresh} spin={refreshing} />
          </button>
        </div>
      </HeaderSection>

      {/* Enhanced Stats Cards */}
      <StatsGrid>
        <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon><FontAwesomeIcon icon={faMusic} /></StatIcon>
          <StatValue>{musicRatio.tracks.toLocaleString()}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Unique Tracks</div>
          <StatChange positive={tracksChange.positive}>
            <FontAwesomeIcon icon={tracksChange.positive ? faArrowUp : faArrowDown} />
            {tracksChange.percent.toFixed(1)}% vs previous period
          </StatChange>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <StatIcon><FontAwesomeIcon icon={faClock} /></StatIcon>
          <StatValue>{Math.round(totalListenTime / 60)}h</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Listen Time</div>
          <StatChange positive={true}>
            <FontAwesomeIcon icon={faArrowUp} />
            {Math.round(totalListenTime)} minutes total
          </StatChange>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <StatIcon><FontAwesomeIcon icon={faFire} /></StatIcon>
          <StatValue>{streakDays}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Day Streak</div>
          <StatChange positive={streakDays > 0}>
            <FontAwesomeIcon icon={streakDays > 0 ? faFire : faClock} />
            {streakDays > 0 ? 'Keep it up!' : 'Start listening!'}
          </StatChange>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
          <StatIcon><FontAwesomeIcon icon={faCalendarAlt} /></StatIcon>
          <StatValue>{`${busiestHour % 12 || 12}${busiestHour < 12 ? 'AM' : 'PM'}`}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Peak Hour</div>
          <StatChange positive={true}>
            <FontAwesomeIcon icon={faMusic} />
            {busiestCount} plays this hour
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Enhanced Charts Section */}
      <ChartsSection
        tracks={musicRatio.tracks}
        albums={musicRatio.albums}
        artists={musicRatio.artists}
        fingerprint={fingerprint}
        trendData={trendData}
        genreData={genreData}
      />

      {/* Enhanced Listening Clock */}
      <Section>
        <ClockChartBox>
          <ChartTitle>
            <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
            24-Hour Listening Pattern
          </ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <RadialHourChart data={byHour} width={350} height={350} />
          </ResponsiveContainer>
        </ClockChartBox>
        
        <EnhancedChartBox style={{ flex: 0.4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <StatIcon style={{ fontSize: '3rem', marginBottom: '16px' }}>
              <FontAwesomeIcon icon={faClock} />
            </StatIcon>
            <Label>Most Active Hour</Label>
            <Value style={{ fontSize: '2.5rem', margin: '8px 0' }}>
              {`${busiestHour % 12 || 12}:00${busiestHour < 12 ? ' AM' : ' PM'}`}
            </Value>
            <Label style={{ marginTop: '16px' }}>Plays This Hour</Label>
            <Value style={{ fontSize: '2rem', color: DONUT_COLORS.primary }}>
              {busiestCount.toLocaleString()}
            </Value>
          </div>
        </EnhancedChartBox>
      </Section>

      {/* Enhanced Top Music */}
      <TopMusic userId={userId} />

      {/* Enhanced Music Ratio Details */}
      <Section style={{ display: 'block' }}>
        <ChartTitle style={{ marginBottom: '24px' }}>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
          Detailed Music Analysis
        </ChartTitle>
        <MusicRatio
          currentTracks={musicRatio.tracks}
          lastTracks={musicRatio.lastTracks}
          currentAlbums={musicRatio.albums}
          lastAlbums={musicRatio.lastAlbums}
          currentArtists={musicRatio.artists}
          lastArtists={musicRatio.lastArtists}
        />
      </Section>
    </Container>
  );
};

export default Reports;
