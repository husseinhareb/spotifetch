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
  LabelList,
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
import { useTheme } from 'styled-components';

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

interface DecadeItem {
  label: string;
  count: number;
}

// ────────────────────────────────────────────────────────────
// Constants & Styled Components
// ────────────────────────────────────────────────────────────
// chart color mapping will be derived from the active theme inside the component

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
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.link})`};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.buttonText || theme.colors.text};
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
  background: ${({ theme }) => theme.colors.buttonBackground};
  padding: 4px;
  border-radius: 8px;
`;

const TimeRangeButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? props.theme.colors.accent : 'transparent'};
  color: ${({ theme }) => theme.colors.buttonText || theme.colors.text};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors.accent : props.theme.colors.buttonBackground};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ gradient?: string }>`
  background: ${props => props.gradient || `linear-gradient(135deg, ${props.theme.colors.accent} 0%, ${props.theme.colors.backgroundSolid} 100%)`};
  border-radius: 16px;
  padding: 24px;
  color: ${({ theme }) => theme.colors.buttonText || theme.colors.text};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.06) 0%, transparent 100%);
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
  color: ${props => props.positive ? (props.theme.colors.accent || '#4ADE80') : '#FF6B6B'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  align-items: stretch;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EnhancedChartBox = styled(ChartBox)`
  background: ${({ theme }) => theme.colors.backgroundSolid};
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  min-height: 320px;
  height: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    min-height: 280px;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => `${theme.colors.backgroundSolid}CC`} ;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: ${({ theme }) => theme.colors.text};
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
  byHour?: number[];
  busiestHour?: number;
  busiestCount?: number;
  decadeData?: DecadeItem[];
  prevTracks?: number;
  prevAlbums?: number;
  prevArtists?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme: any = useTheme();
  if (active && payload && payload.length) {
    // payload is an array of series at this point; for bar charts it's usually one item
    const friendly = (name: string) => {
      if (!name) return '';
      if (name === 'value') return 'Plays';
      if (name === 'totalPlays') return 'Total Plays';
      if (name === 'tracks') return 'Tracks';
      if (name === 'albums') return 'Albums';
      if (name === 'artists') return 'Artists';
      return name;
    };

    const bg = theme?.colors?.backgroundSolid || 'rgba(6,6,6,0.95)';
    const border = theme?.colors?.buttonBackground || 'rgba(255,255,255,0.06)';
    const text = theme?.colors?.text || (bg && bg.startsWith('rgba') ? '#fff' : '#111');

    return (
      <div style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '10px 14px',
        color: text,
        minWidth: 140,
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
      }}>
        <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 14 }}>{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, background: entry.color || theme?.colors?.buttonText || '#fff', borderRadius: 2 }} />
            <div style={{ fontSize: 13, color: theme?.colors?.textSecondary || '#9aa0a6' }}>{friendly(entry.name)}:</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginLeft: 'auto', color: text }}>{entry.value}</div>
          </div>
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
  byHour,
  busiestHour,
  busiestCount,
  decadeData,
  prevTracks,
  prevAlbums,
  prevArtists,
}) => {
  // use theme for primary accent color inside charts
  const theme: any = useTheme();
  const PRIMARY = theme?.colors?.accent || '#1DB954';
  // local palette keeps track/album/artist hues but uses primary for brand accents
  const LOCAL_COLORS = {
    tracks: '#60A5FA',
    albums: '#4ADE80',
    artists: '#C084FC',
    primary: PRIMARY,
    accent: '#FF6B6B',
    bgMuted: theme?.colors?.backgroundSolid || '#111',
  };

  const pieData = [
    { name: 'Tracks', value: tracks, prev: prevTracks, color: LOCAL_COLORS.tracks },
    { name: 'Albums', value: albums, prev: prevAlbums, color: LOCAL_COLORS.albums },
    { name: 'Artists', value: artists, prev: prevArtists, color: LOCAL_COLORS.artists },
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

  // compute max value for genre chart so axis domain fits data
  const genreMax = useMemo(() => Math.max(...genreData.map(g => g.value), 1), [genreData]);
  // compute nice tick marks for genre axis
  const genreTicks = useMemo(() => {
    const max = Math.max(genreMax, 1);
    const ticksCount = 5;
    const step = Math.ceil(max / (ticksCount - 1));
    const ticks = Array.from({ length: ticksCount }, (_, i) => i * step);
    // ensure last tick >= max
    if (ticks[ticks.length - 1] < max) ticks[ticks.length - 1] = max;
    return ticks;
  }, [genreMax]);

  return (
    <ChartsGrid>
      
      {/* Enhanced Music Ratio with animations */}
      <EnhancedChartBox>
        <ChartTitle>
          <FontAwesomeIcon icon={faMusic} style={{ marginRight: '8px' }} />
          Music Distribution
        </ChartTitle>
        <div style={{ flex: 1, position: 'relative' }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              {/* concentric rings: render one Pie per metric with a rest segment to show proportion */}
              {(() => {
                const maxVal = Math.max(...pieData.map((d) => d.value), 1);
                return pieData.map((entry, idx) => {
                  const outer = 75 - idx * 16; // percent
                  const inner = outer - 10;
                  const data = [
                    { name: entry.name, value: entry.value },
                    { name: 'rest', value: Math.max(0, maxVal - entry.value) },
                  ];

                  const bgData = [{ name: 'bg', value: maxVal }];
                  const coloredData = [
                    { name: entry.name, value: entry.value },
                    { name: 'rest', value: Math.max(0, maxVal - entry.value) },
                  ];

                  return (
                    <React.Fragment key={entry.name}>
                      {/* background full ring */}
                      <Pie
                        data={bgData}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={`${inner}%`}
                        outerRadius={`${outer}%`}
                        isAnimationActive={false}
                        nameKey="name"
                      >
                        <Cell key={`${entry.name}-bg`} fill={theme?.colors?.buttonBackground || LOCAL_COLORS.bgMuted} stroke={LOCAL_COLORS.bgMuted} />
                      </Pie>

                      {/* colored overlay showing completion */}
                      <Pie
                        data={coloredData}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={`${inner}%`}
                        outerRadius={`${outer}%`}
                        paddingAngle={2}
                        isAnimationActive={true}
                        animationBegin={idx * 120}
                        animationDuration={900}
                        nameKey="name"
                        cornerRadius={8}
                      >
                        <Cell key={`${entry.name}-value`} fill={entry.color} stroke={entry.color} />
                        <Cell key={`${entry.name}-rest`} fill="transparent" stroke="none" />
                      </Pie>
                    </React.Fragment>
                  );
                });
              })()}

              <Tooltip content={({ active, payload }: any) => {
                if (!active || !payload || payload.length === 0) return null;
                // find the first non-rest slice
                const slice = payload.find((p: any) => p && p.name && p.name !== 'rest');
                if (!slice) return null;
                const pct = Math.round((slice.value / Math.max(...pieData.map(d => d.value), 1)) * 1000) / 10;
                return (
                  <div style={{ background: theme?.colors?.backgroundSolid || 'rgba(0,0,0,0.85)', padding: '8px 12px', color: theme?.colors?.text || 'white', borderRadius: 6 }}>
                    <div style={{ fontWeight: 700 }}>{slice.name}</div>
                    <div style={{ fontSize: 12, color: theme?.colors?.textSecondary || '#9aa0a6' }}>Value: {slice.value}</div>
                    <div style={{ fontSize: 12, color: theme?.colors?.textSecondary || '#9aa0a6' }}>Proportion: {pct}%</div>
                  </div>
                );
              }} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Overlay numeric summary positioned better */}
          <div style={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            background: theme?.colors?.backgroundSolid || 'rgba(0,0,0,0.7)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 5 
          }}>
            {pieData.map((p, i) => {
              const maxVal = Math.max(...pieData.map((d) => d.value), 1);
              const pct = Math.round((p.value / maxVal) * 100);
              const prev = (p as any).prev;
              const change = prev && prev > 0 ? Math.round(((p.value - prev) / prev) * 100) : null;
              const changeColor = change == null ? theme?.colors?.textSecondary : (change >= 0 ? theme?.colors?.accent : '#FF6B6B');
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, background: p.color, borderRadius: 2 }} />
                  <span style={{ color: theme?.colors?.text || '#fff', minWidth: 50 }}>{p.name}</span>
                  <span style={{ color: theme?.colors?.textSecondary || '#9aa0a6' }}>{p.value}</span>
                  <span style={{ color: changeColor, marginLeft: 6 }}>{change != null ? `(${change >= 0 ? '+' : ''}${change}%)` : `(${pct}%)`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </EnhancedChartBox>

      {/* Enhanced Listening Fingerprint */}
      <EnhancedChartBox>
        <ChartTitle>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
          Listening Fingerprint
        </ChartTitle>
          <div style={{ width: '100%', height: '280px', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                <PolarGrid stroke={theme?.colors?.backgroundSolid ? '#333' : '#333'} />
                <PolarAngleAxis dataKey="metric" stroke={theme?.colors?.text || '#ccc'} fontSize={11} />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke={LOCAL_COLORS.primary}
                  fill={LOCAL_COLORS.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  animationBegin={0}
                  animationDuration={1500}
                />
                {globalAverage && (
                  <Radar
                    name="Average"
                    dataKey="avg"
                    stroke={theme?.colors?.backgroundSolid || '#666'}
                    fill={theme?.colors?.backgroundSolid || '#666'}
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                </RadarChart>
            </ResponsiveContainer>
          </div>
      </EnhancedChartBox>
      {/* 24-hour clock moved here so it appears next to the other small charts */}
      <ClockChartBox>
        <ChartTitle>
          <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
          24-Hour Listening Pattern
        </ChartTitle>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {byHour && (
            <RadialHourChart data={byHour} width={300} height={300} />
          )}
          {!byHour && <div style={{ color: theme?.colors?.textSecondary || '#777' }}>No listening data available</div>}
        </div>
      </ClockChartBox>

      <EnhancedChartBox style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <StatIcon style={{ fontSize: '3rem', marginBottom: '16px' }}>
            <FontAwesomeIcon icon={faClock} />
          </StatIcon>
          <Label>Most Active Hour</Label>
          <Value style={{ fontSize: '2.5rem', margin: '8px 0' }}>{`${(busiestHour ?? 0) % 12 || 12}:00${(busiestHour ?? 0) < 12 ? ' AM' : ' PM'}`}</Value>
          <Label style={{ marginTop: '16px' }}>Plays This Hour</Label>
          <Value style={{ fontSize: '2rem', color: theme?.colors?.accent || '#1DB954' }}>{(busiestCount ?? 0).toLocaleString()}</Value>
        </div>
      </EnhancedChartBox>

      {/* Listening trends: placed in its own box so title sits above the chart */}
      <EnhancedChartBox style={{ gridColumn: '1 / -1' }}>
        <ChartTitle>
          <FontAwesomeIcon icon={faFire} style={{ marginRight: '8px' }} />
          Listening Trends Over Time
        </ChartTitle>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme?.colors?.backgroundSolid || '#333'} />
              <XAxis 
                dataKey="date" 
                stroke={theme?.colors?.text || '#ccc'}
                fontSize={12}
              />
              <YAxis stroke={theme?.colors?.text || '#ccc'} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalPlays"
                fill={LOCAL_COLORS.primary}
                fillOpacity={0.18}
                stroke={LOCAL_COLORS.primary}
                strokeWidth={2}
                name="Total Plays"
                animationBegin={0}
                animationDuration={2000}
              />
              <Line
                type="monotone"
                dataKey="tracks"
                stroke={LOCAL_COLORS.tracks}
                strokeWidth={2}
                name="Unique Tracks"
                animationBegin={500}
                animationDuration={2000}
              />
              <Line
                type="monotone"
                dataKey="albums"
                stroke={LOCAL_COLORS.albums}
                strokeWidth={2}
                name="Unique Albums"
                animationBegin={1000}
                animationDuration={2000}
              />
              <Line
                type="monotone"
                dataKey="artists"
                stroke={LOCAL_COLORS.artists}
                strokeWidth={2}
                name="Unique Artists"
                animationBegin={1500}
                animationDuration={2000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </EnhancedChartBox>

      {/* New Genre Distribution Chart */}
      {genreData.length > 0 && (
        // make Top Genres span the full width of the charts grid
        <EnhancedChartBox style={{ overflow: 'visible', gridColumn: '1 / -1' }}>
          <ChartTitle>
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '8px' }} />
            Top Genres
          </ChartTitle>
          {/* Span whole row and give the chart more horizontal space */}
          <div style={{ width: '100%', height: '360px', minHeight: 320, overflow: 'visible', padding: '8px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              {/* Use vertical layout so categories are on Y-axis and values extend horizontally */}
              <BarChart data={genreData} layout="vertical" margin={{ top: 10, right: 100, left: 16, bottom: 12 }} barCategoryGap="30%" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme?.colors?.buttonBackground || '#222'} />
                  <XAxis type="number" stroke={theme?.colors?.textSecondary || '#bbb'} fontSize={12} tickLine={false} domain={[0, genreMax]} ticks={genreTicks} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke={theme?.colors?.text || '#ddd'} 
                    fontSize={13}
                    width={160}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={theme?.colors?.accent || LOCAL_COLORS.accent}
                    radius={[6, 6, 6, 6]}
                    animationBegin={0}
                    animationDuration={900}
                  >
                    {/* Color each bar using the data-provided color for stronger contrast */}
                    {genreData.map((g, i) => (
                      <Cell key={`genre-cell-${i}`} fill={g.color} />
                    ))}
                    {/* custom label renderer: place value inside bar when narrow, otherwise to the right */}
                    <LabelList dataKey="value" content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      const fill = theme?.colors?.text || '#111';
                      // if the bar is narrow, place label inside with white text for contrast
                      if (width != null && width < 48) {
                        const cx = x + width / 2;
                        const cy = y + height / 2 + 4; // adjust for vertical centering
                        return (
                          <text x={cx} y={cy} textAnchor="middle" fill={theme?.colors?.buttonText || '#fff'} fontSize={13} fontWeight={800}>
                            {value}
                          </text>
                        );
                      }
                      // otherwise place to the right
                      const tx = x + width + 10;
                      const ty = y + height / 2 + 4;
                      return (
                        <text x={tx} y={ty} textAnchor="start" fill={theme?.colors?.textSecondary || '#666'} fontSize={13} fontWeight={800}>
                          {value}
                        </text>
                      );
                    }} />
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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
  const theme: any = useTheme();

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
  const [decadeData, setDecadeData] = useState<DecadeItem[]>([]);
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
      const topArtists = await getTopArtists(userId, 40);
      const genreCount: { [key: string]: number } = {};

      // Aggregate true genres from artist metadata (if provided by backend)
      topArtists.forEach((artist: any) => {
        const genres: string[] = (artist.genres && Array.isArray(artist.genres)) ? artist.genres : [];
        genres.forEach((g) => {
          const name = g.trim();
          if (!name) return;
          genreCount[name] = (genreCount[name] || 0) + 1;
        });
      });

      // If no genres were available in the artist objects, return empty list
      const entries = Object.entries(genreCount);
      if (entries.length === 0) return [];

      return entries
        .map(([name, value]) => ({
          name,
          value,
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
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

      // 6. Decade distribution
      const decadeMap: Record<string, number> = {};
      const decadeLabels = ['Pre-1960','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
      reports.forEach((r) => {
        try {
          const y = new Date(r.played_at).getFullYear();
          let label = '';
          if (isNaN(y)) return;
          if (y < 1960) label = 'Pre-1960';
          else {
            const d = Math.floor(y / 10) * 10;
            label = `${d}s`;
          }
          if (!decadeMap[label]) decadeMap[label] = 0;
          decadeMap[label] += 1;
        } catch (e) {
          // ignore parse errors
        }
      });

      const decades: DecadeItem[] = decadeLabels.map((lbl) => ({ label: lbl, count: decadeMap[lbl] || 0 }));
      setDecadeData(decades);

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
  <div style={{ textAlign: 'center', padding: '60px', color: theme?.colors?.accent || '#ff6b6b' }}>
          <FontAwesomeIcon icon={faRefresh} size="3x" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            style={{
              background: theme?.colors?.accent || '#1DB954',
              color: theme?.colors?.buttonText || 'white',
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
  <StatCard gradient={`linear-gradient(135deg, ${theme?.colors?.accent || '#667eea'} 0%, ${theme?.colors?.buttonBackground || theme?.colors?.backgroundSolid} 100%)`}>
          <StatIcon><FontAwesomeIcon icon={faMusic} /></StatIcon>
          <StatValue>{musicRatio.tracks.toLocaleString()}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Unique Tracks</div>
          <StatChange positive={tracksChange.positive}>
            <FontAwesomeIcon icon={tracksChange.positive ? faArrowUp : faArrowDown} />
            {tracksChange.percent.toFixed(1)}% vs previous period
          </StatChange>
        </StatCard>

  <StatCard gradient={`linear-gradient(135deg, ${theme?.colors?.accent || '#f093fb'} 0%, ${theme?.colors?.link || '#f5576c'} 100%)`}>
          <StatIcon><FontAwesomeIcon icon={faClock} /></StatIcon>
          <StatValue>{Math.round(totalListenTime / 60)}h</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Listen Time</div>
          <StatChange positive={true}>
            <FontAwesomeIcon icon={faArrowUp} />
            {Math.round(totalListenTime)} minutes total
          </StatChange>
        </StatCard>

  <StatCard gradient={`linear-gradient(135deg, ${theme?.colors?.link || '#4facfe'} 0%, ${theme?.colors?.buttonBackground || '#00f2fe'} 100%)`}>
          <StatIcon><FontAwesomeIcon icon={faFire} /></StatIcon>
          <StatValue>{streakDays}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Day Streak</div>
          <StatChange positive={streakDays > 0}>
            <FontAwesomeIcon icon={streakDays > 0 ? faFire : faClock} />
            {streakDays > 0 ? 'Keep it up!' : 'Start listening!'}
          </StatChange>
        </StatCard>

  <StatCard gradient={`linear-gradient(135deg, ${theme?.colors?.link || '#fa709a'} 0%, ${theme?.colors?.accent || '#fee140'} 100%)`}>
          <StatIcon><FontAwesomeIcon icon={faCalendarAlt} /></StatIcon>
          <StatValue>{`${busiestHour % 12 || 12}${busiestHour < 12 ? 'AM' : 'PM'}`}</StatValue>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Peak Hour</div>
          <StatChange positive={true}>
            <FontAwesomeIcon icon={faMusic} />
            {busiestCount} plays this hour
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Decade distribution: placed above the charts so it sits on its own row */}
      <EnhancedChartBox style={{ marginBottom: 24, gridColumn: '1 / -1' }}>
        <ChartTitle>
          <FontAwesomeIcon icon={faMusic} style={{ marginRight: '8px' }} />
          Decade Distribution
        </ChartTitle>
        <div style={{ marginTop: 8, padding: '8px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
            {/* Highlight the decade with the maximum count (dynamic), not a hard-coded label */}
            {(() => {
              const topCount = Math.max(...decadeData.map(x => x.count), 0);
              const barMax = Math.max(topCount, 1);
              return decadeData.map((d) => {
              return (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '20px' }}>
                  <div style={{ width: '90px', color: theme?.colors?.textSecondary || '#ccc', fontSize: '0.85rem', flexShrink: 0 }}>{d.label}</div>
                  <div style={{ flex: 1, background: theme?.colors?.background || '#0f0f0f', borderRadius: '4px', height: '16px', overflow: 'hidden', minWidth: 0 }}>
                    <div style={{
                      width: `${d.count === 0 ? 0 : Math.max(2, (d.count / barMax) * 100)}%`,
                      height: '100%',
                      background: (d.count === topCount && topCount > 0)
                        ? (theme?.colors?.accent || '#1DB954')
                        : (theme?.colors?.buttonBackground || '#2b2b2b'),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', color: theme?.colors?.textSecondary || '#bbb', fontSize: '0.85rem', flexShrink: 0 }}>{d.count}</div>
                </div>
              );
            });})()}
          </div>
        </div>
      </EnhancedChartBox>

      {/* Enhanced Charts Section */}
      <ChartsSection
        tracks={musicRatio.tracks}
        albums={musicRatio.albums}
        artists={musicRatio.artists}
        fingerprint={fingerprint}
        trendData={trendData}
        genreData={genreData}
        byHour={byHour ?? undefined}
        busiestHour={busiestHour}
        busiestCount={busiestCount}
        prevTracks={musicRatio.lastTracks}
        prevAlbums={musicRatio.lastAlbums}
        prevArtists={musicRatio.lastArtists}
      />

      

      {/* Clock moved into charts section above */}

      {/* Enhanced Top Music */}
      <TopMusic userId={userId} />

      {/* Enhanced Music Ratio Details */}
      <Section style={{ display: 'block', overflow: 'hidden' }}>
        <ChartTitle style={{ marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
          Detailed Music Analysis
        </ChartTitle>
        <div style={{ overflow: 'auto' }}>
          <MusicRatio
            currentTracks={musicRatio.tracks}
            lastTracks={musicRatio.lastTracks}
            currentAlbums={musicRatio.albums}
            lastAlbums={musicRatio.lastAlbums}
            currentArtists={musicRatio.artists}
            lastArtists={musicRatio.lastArtists}
          />
        </div>
      </Section>
    </Container>
  );
};

export default Reports;
