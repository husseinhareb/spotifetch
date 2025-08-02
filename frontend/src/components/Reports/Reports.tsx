// src/components/Reports/Reports.tsx
import styled from 'styled-components';

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faArrowUp,
  faShareAlt,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Navigate } from 'react-router-dom';
import { useUserId, useIsLoggedIn } from '../../services/store';
import {
  fetchReports,
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  getMusicRatio,
  getListeningFingerprint,
  TopArtist,
  TopAlbum,
  TopTrack,
  Fingerprint,
  getListeningClock,
} from '../../repositories/reportsRepository';
import { format, startOfWeek, endOfWeek, subDays, addDays } from 'date-fns';
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
  Label,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import {
  Card,
  CardBody,
  CardImage,
  CardLabel,
  Change,
  ChartBox,
  ChartIcon,
  ChartRow,
  ChartTitle,
  Container,
  DayBar,
  DetailGrid,
  ListenChange,
  ListenHeader,
  ListenLabel,
  Listens,
  ListenValue,
  NavButton,
  Section,
  SmallCard,
  SmallGrid,
  SmallItem,
  SmallList,
  SmallValue,
  Subtitle,
  SummaryCard,
  SummaryGrid,
  Title,
  Value,
  WeekNav,
  WeekTitle
} from './Styles/style';
import type { TickItemTextProps } from 'recharts/types/polar/PolarAngleAxis';
import RadialHourChart from './RadialHourChart';
// ────────────────────────────────────────────────────────────
// ChartsSection
// ────────────────────────────────────────────────────────────
const DONUT_COLORS = {
  tracks: '#60A5FA',
  albums: '#4ADE80',
  artists: '#C084FC',
};

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
        <ResponsiveContainer width="100%" height="80%">
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
        <ResponsiveContainer width="100%" height="80%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" stroke="#666" />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
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
const ClockChartBox = styled(ChartBox)`
  position: relative;
  /* ensure it’s square—adjust the height to your needs */
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
// Main Reports component
// ────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const userId = useUserId();
  const isLoggedIn = useIsLoggedIn();

  // Weekly
  const [weekRange, setWeekRange] = useState(() => {
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

  // Charts
  const [musicRatio, setMusicRatio] = useState<{
    tracks: number;
    albums: number;
    artists: number;
  } | null>(null);
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null);

  // Summary & details
  const [summary, setSummary] = useState<
    { label: string; value: number; change: number; bg: string }[]
  >([]);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<TopAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [byHour, setByHour] = useState<number[] | null>(null);
  const [busiestHour, setBusiestHour] = useState(0);
  const [busiestCount, setBusiestCount] = useState(0);

  // Fetch weekly
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { start, end } = weekRange;
        const lastStart = subDays(start, 7);
        const lastEnd = subDays(end, 7);
        const [thisWeek, lastWeek] = await Promise.all([
          fetchReports(userId),
          fetchReports(userId),
        ]);
        const filterRange = (
          data: typeof thisWeek,
          s: Date,
          e: Date
        ) =>
          data.filter((h) => {
            const d = new Date(h.played_at);
            return d >= s && d <= e;
          });
        const thisFiltered = filterRange(thisWeek, start, end);
        const lastFiltered = filterRange(lastWeek, lastStart, lastEnd);
        const daily = Array.from({ length: 7 }, (_, i) => {
          const dayStr = addDays(start, i).toDateString();
          return thisFiltered.filter(
            (h) => new Date(h.played_at).toDateString() === dayStr
          ).length;
        });
        setWeekData({
          daily,
          total: thisFiltered.length,
          prevTotal: lastFiltered.length,
        });
      } catch {
        setError('Failed to load weekly data.');
      }
    })();
  }, [userId, weekRange]);

  // Fetch charts data
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [ratio, fp] = await Promise.all([
          getMusicRatio(userId),
          getListeningFingerprint(userId),
        ]);
        setMusicRatio(ratio);
        setFingerprint(fp);
      } catch {
        setError('Failed to load charts.');
      }
    })();
  }, [userId]);

  // Fetch summary & top-N
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [allA, allAL, allT] = await Promise.all([
          getTopArtists(userId, 10),
          getTopAlbums(userId, 10),
          getTopTracks(userId, 10),
        ]);
        const [prevA, prevAL, prevT] = await Promise.all([
          getTopArtists(userId, 10),
          getTopAlbums(userId, 10),
          getTopTracks(userId, 10),
        ]);
        const [detailA, detailAL, detailT] = await Promise.all([
          getTopArtists(userId, 5),
          getTopAlbums(userId, 5),
          getTopTracks(userId, 5),
        ]);
        const pct = (c: number, p: number) =>
          p > 0 ? Math.round(((c - p) / p) * 100) : 0;
        setSummary([
          {
            label: 'Artists',
            value: allA.length,
            change: pct(allA.length, prevA.length),
            bg: DONUT_COLORS.artists,
          },
          {
            label: 'Albums',
            value: allAL.length,
            change: pct(allAL.length, prevAL.length),
            bg: DONUT_COLORS.albums,
          },
          {
            label: 'Tracks',
            value: allT.length,
            change: pct(allT.length, prevT.length),
            bg: DONUT_COLORS.tracks,
          },
        ]);
        setTopArtists(detailA);
        setTopAlbums(detailAL);
        setTopTracks(detailT);
      } catch {
        setError('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Render only at 0, 6, 12, 18 hours
  const renderClockTick = (props: TickItemTextProps): React.ReactElement<SVGTextElement> => {
    const { x, y, payload } = props;
    const labels: Record<number, string> = { 0: '00', 6: '06', 12: '12', 18: '18' };
    const label = labels[payload.value as number];
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: '#888', fontSize: 12 }}
      >
        {label ?? ''}
      </text>
    );
  };




  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await getListeningClock(userId);
        setByHour(data);
        // pick busiest
        const max = Math.max(...data);
        setBusiestCount(max);
        setBusiestHour(data.indexOf(max));
      } catch {
        setError('Failed to load listening-clock.');
      }
    })();
  }, [userId]);
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (loading || !weekData || !musicRatio || !fingerprint || byHour === null)
    return (
      <Container>
        <p>Loading reports...</p>
      </Container>
    );
  if (error)
    return (
      <Container>
        <p>{error}</p>
      </Container>
    );

  return (
    <Container>
      {/* Charts */}
      <ChartsSection
        tracks={musicRatio.tracks}
        albums={musicRatio.albums}
        artists={musicRatio.artists}
        fingerprint={fingerprint}
      />
      <Section>
  {/* Listening Clock */}
  <ClockChartBox>
    <ChartTitle>Listening Clock</ChartTitle>

    {/* only render once byHour is fetched */}
    {byHour && (
      <RadialHourChart
        data={byHour}
        width={350}
        height={350}
      />
    )}

    {/* Overlay center labels via styled-components */}
    <CenterLabels>
      <div className="label top">00</div>
      <div className="label right">06</div>
      <div className="label bottom">12</div>
      <div className="label left">18</div>
    </CenterLabels>
  </ClockChartBox>

  {/* Busiest‐hour summary box */}
  <ChartBox style={{ flex: 0.4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Label>Busiest hour</Label>
    <Value>
      {(() => {
        const suffix = busiestHour < 12 ? 'AM' : 'PM';
        const hour12 = busiestHour % 12 || 12;
        return `${hour12}:00${suffix}`;
      })()}
    </Value>
    <Label style={{ marginTop: 16 }}>Scrobbles in busiest hour</Label>
    <Value>{busiestCount}</Value>
  </ChartBox>
</Section>






      {/* Weekly summary */}
      <WeekNav>
        <NavButton
          onClick={() =>
            setWeekRange((w) => ({
              start: subDays(w.start, 7),
              end: subDays(w.end, 7),
            }))
          }
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </NavButton>
        <WeekTitle>
          {format(weekRange.start, 'd MMM yyyy').toUpperCase()} –{' '}
          {format(weekRange.end, 'd MMM yyyy').toUpperCase()}
        </WeekTitle>
        <NavButton
          onClick={() =>
            setWeekRange((w) => ({
              start: addDays(w.start, 7),
              end: addDays(w.end, 7),
            }))
          }
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </NavButton>
      </WeekNav>

      <ListenHeader>
        <ListenLabel>Listens</ListenLabel>
        <ListenValue>{weekData.total}</ListenValue>
        <ListenChange>
          <FontAwesomeIcon icon={faArrowUp} />
          {weekData.prevTotal > 0
            ? Math.round(
              ((weekData.total - weekData.prevTotal) /
                weekData.prevTotal) *
              100
            )
            : 0}
          % vs. last week
        </ListenChange>
      </ListenHeader>

      <ChartRow>
        {weekData.daily.map((count, i) => (
          <DayBar
            key={i}
            data-label={format(addDays(weekRange.start, i), 'EEE')}
            height={count * 6 + 10}
          />
        ))}
      </ChartRow>

      {/* Summary cards */}
      <SummaryGrid>
        {summary.map((s) => (
          <SummaryCard key={s.label} bg={s.bg}>
            <Label>{s.label}</Label>
            <Value>{s.value}</Value>
            <Change>
              <FontAwesomeIcon icon={faArrowUp} /> {s.change}%
            </Change>
            <ChartIcon icon={faChartBar} />
          </SummaryCard>
        ))}
      </SummaryGrid>

      {/* Top detail cards */}
      <DetailGrid>
        {topArtists.map((a, i) => (
          <Card key={a.artist_name}>
            <CardImage img={a.artist_image}>
              <CardLabel bg={DONUT_COLORS.artists}>Top Artist</CardLabel>
            </CardImage>
            <CardBody>
              <Title>
                #{i + 1} {a.artist_name}
              </Title>
              <Listens>{a.play_count} Listens</Listens>
            </CardBody>
          </Card>
        ))}
        {topAlbums.map((al, i) => (
          <Card key={al.album_name}>
            <CardImage img={al.album_image}>
              <CardLabel bg={DONUT_COLORS.albums}>Top Album</CardLabel>
            </CardImage>
            <CardBody>
              <Title>
                #{i + 1} {al.album_name}
              </Title>
              <Subtitle>{al.artist_name}</Subtitle>
              <Listens>{al.play_count} Listens</Listens>
            </CardBody>
          </Card>
        ))}
        {topTracks.map((t, i) => (
          <Card key={t.track_id}>
            <CardImage img={t.album_image}>
              <CardLabel bg={DONUT_COLORS.tracks}>Top Track</CardLabel>
            </CardImage>
            <CardBody>
              <Title>
                #{i + 1} {t.track_name}
              </Title>
              <Subtitle>{t.artist_name}</Subtitle>
              <Listens>{t.play_count} Listens</Listens>
            </CardBody>
          </Card>
        ))}
      </DetailGrid>

      {/* New items preview */}
      <SmallGrid>
        {[
          {
            label: 'New Artists',
            img: topArtists[0]?.artist_image,
            text: `#1 ${topArtists[0]?.artist_name}`,
            Listens: `${topArtists[0]?.play_count} Listens`,
          },
          {
            label: 'New Albums',
            img: topAlbums[0]?.album_image,
            text: `#1 ${topAlbums[0]?.album_name}`,
            Listens: `${topAlbums[0]?.play_count} Listens`,
          },
          {
            label: 'New Tracks',
            img: topTracks[0]?.album_image,
            text: `#1 ${topTracks[0]?.track_name}`,
            Listens: `${topTracks[0]?.play_count} Listens`,
          },
        ].map((ns) => (
          <SmallCard key={ns.label}>
            <Label>{ns.label}</Label>
            <SmallValue>{ns.text}</SmallValue>
            <SmallList>
              <SmallItem>
                <img src={ns.img} alt={ns.text} />
                <div>
                  <p style={{ margin: 0 }}>{ns.text}</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: '#888',
                    }}
                  >
                    {ns.Listens}
                  </p>
                </div>
              </SmallItem>
            </SmallList>
          </SmallCard>
        ))}
      </SmallGrid>
    </Container>
  );
};

export default Reports;
