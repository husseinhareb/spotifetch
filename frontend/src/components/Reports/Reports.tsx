// src/components/Reports/Reports.tsx
import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import { startOfWeek, endOfWeek, subDays, addDays } from 'date-fns';

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
// “Raw” shape coming back from your repo
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
// Constants & Styled Components
// ────────────────────────────────────────────────────────────
const DONUT_COLORS = {
  tracks: '#60A5FA',
  albums: '#4ADE80',
  artists: '#C084FC',
};

const ClockChartBox = styled(ChartBox)`
  position: relative;
  height: 400px;
`;

const CenterLabels = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  .label {
    position: absolute;
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
  }
  .top    { top:  5%; left: 50%; transform: translateX(-50%); }
  .right  { top: 50%; right: 5%; transform: translateY(-50%); }
  .bottom { bottom: 5%; left:50%; transform: translateX(-50%); }
  .left   { top: 50%; left: 5%; transform: translateY(-50%); }
`;

// ────────────────────────────────────────────────────────────
// ChartsSection (unchanged)
// ────────────────────────────────────────────────────────────
interface ChartsSectionProps {
  tracks: number;
  albums: number;
  artists: number;
  fingerprint: Fingerprint;
  globalAverage?: Fingerprint;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  tracks,
  albums,
  artists,
  fingerprint,
  globalAverage,
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
    <Section>
      <ChartBox>
        <ChartTitle>Music Ratio</ChartTitle>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={4}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartBox>

      <ChartBox>
        <ChartTitle>Listening Fingerprint</ChartTitle>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" stroke="#666" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="You"
              dataKey="you"
              stroke={DONUT_COLORS.tracks}
              fill={DONUT_COLORS.tracks}
              fillOpacity={0.4}
            />
            {globalAverage && (
              <Radar
                name="Global avg"
                dataKey="avg"
                stroke="#555"
                fill="#555"
                fillOpacity={0.2}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </ChartBox>
    </Section>
  );
};

// ────────────────────────────────────────────────────────────
// Main Reports Component (with mapping fix)
// ────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const userId = useUserId();
  const isLoggedIn = useIsLoggedIn();

  // Weekly listens
  const [weekRange] = useState(() => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    };
  });
  const [weekData, setWeekData] = useState<{
    daily: number[];
    total: number;
    prevTotal: number;
  } | null>(null);

  // Charts & summary
  const [musicRatio, setMusicRatio] = useState<RawMusicRatio | null>(null);
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);
  const [byHour, setByHour] = useState<number[] | null>(null);
  const [busiestHour, setBusiestHour] = useState(0);
  const [busiestCount, setBusiestCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // 1. Fetch raw ratio + fingerprint
        const [rawRatio, fp] = await Promise.all([
          getMusicRatio(userId),
          getListeningFingerprint(userId),
        ]);
        // 2. Map into our full shape
        setMusicRatio({
          tracks:      rawRatio.tracks,
          lastTracks:  rawRatio.lastTracks,
          albums:      rawRatio.albums,
          lastAlbums:  rawRatio.lastAlbums,
          artists:     rawRatio.artists,
          lastArtists: rawRatio.lastArtists,
        });
        setFingerprint(fp);

        // 3. Listening clock
        const clock = await getListeningClock(userId);
        setByHour(clock);
        const max = Math.max(...clock);
        setBusiestCount(max);
        setBusiestHour(clock.indexOf(max));

        // 4. Weekly listens
        const reports = await fetchReports(userId);
        const { start, end } = weekRange;
        const lastStart = subDays(start, 7);
        const lastEnd   = subDays(end,   7);
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

      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, weekRange]);

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (loading || !weekData || !musicRatio || !fingerprint || !byHour)
    return <Container><p>Loading reports…</p></Container>;
  if (error) 
    return <Container><p>{error}</p></Container>;

  return (
    <Container>
      {/* Top‐level donuts & radar */}
      <ChartsSection
        tracks={musicRatio.tracks}
        albums={musicRatio.albums}
        artists={musicRatio.artists}
        fingerprint={fingerprint}
      />

      {/* Listening clock + busiest‐hour */}
      <Section>
        <ClockChartBox>
          <ChartTitle>Listening Clock</ChartTitle>
          <ResponsiveContainer width="100%" height="100%">
            <RadialHourChart data={byHour} width={350} height={350} />
          </ResponsiveContainer>
          <CenterLabels>
            <div className="label top">00</div>
            <div className="label right">06</div>
            <div className="label bottom">12</div>
            <div className="label left">18</div>
          </CenterLabels>
        </ClockChartBox>
        <ChartBox style={{ flex: 0.4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Label>Busiest hour</Label>
          <Value>{`${busiestHour % 12 || 12}:00${busiestHour < 12 ? ' AM' : ' PM'}`}</Value>
          <Label style={{ marginTop: 16 }}>Listens this hour</Label>
          <Value>{busiestCount}</Value>
        </ChartBox>
      </Section>

      {/* Top‐N lists */}
      <TopMusic userId={userId} />

      {/* Detailed Music‐Ratio panel */}
      <Section>
        <ChartTitle>Music Ratio Details</ChartTitle>
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
