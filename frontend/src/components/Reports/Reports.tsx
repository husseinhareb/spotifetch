// src/components/Reports/Reports.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faArrowUp,
  faShareAlt,
  faChevronLeft,
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
} from 'recharts';

// ────────────────────────────────────────────────────────────
// ChartsSection
// ────────────────────────────────────────────────────────────
const Section = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
`;
const ChartBox = styled.div`
  flex: 1;
  height: 300px;
  background: #111;
  border-radius: 8px;
  padding: 20px;
  color: #fff;
`;
const ChartTitle = styled.h4`
  margin-bottom: 16px;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
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

// ────────────────────────────────────────────────────────────
// Styled components for Reports page
// ────────────────────────────────────────────────────────────
const Container = styled.div`
  padding: 20px;
  background: #000;
  color: #fff;
`;
const WeekNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffc0c0;
  padding: 12px 20px;
  margin-bottom: 16px;
`;
const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
`;
const WeekTitle = styled.div`
  font-weight: bold;
  font-size: 1rem;
`;
const ScrobbleHeader = styled.div`
  display: flex;
  align-items: baseline;
  padding: 0 20px;
  margin-bottom: 16px;
`;
const ScrobbleLabel = styled.p`
  margin: 0;
  font-size: 1rem;
  flex: 1;
`;
const ScrobbleValue = styled.h1`
  margin: 0 16px;
  font-size: 3rem;
`;
const ScrobbleChange = styled.span`
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  svg {
    margin-right: 4px;
  }
`;
const ChartRow = styled.div`
  display: flex;
  padding: 0 20px 40px;
  align-items: flex-end;
  gap: 12px;
`;
const DayBar = styled.div<{ height: number }>`
  width: 24px;
  height: ${(props) => props.height}px;
  background: #111;
  border-radius: 4px 4px 0 0;
  position: relative;
  &:after {
    content: attr(data-label);
    position: absolute;
    top: 100%;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #555;
  }
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;
const SummaryCard = styled.div<{ bg: string }>`
  background: ${(props) => props.bg};
  position: relative;
  border-radius: 8px;
  padding: 20px;
`;
const Label = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
`;
const Value = styled.h2`
  margin: 8px 0;
  font-size: 2.5rem;
`;
const Change = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.9;
  svg {
    margin-right: 4px;
  }
`;
const ChartIcon = styled(FontAwesomeIcon)`
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0.3;
  font-size: 2rem;
`;
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;
const Card = styled.div`
  background: #121212;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const CardImage = styled.div<{ img?: string }>`
  background: url(${(props) => props.img || ''}) center/cover no-repeat;
  height: 200px;
  position: relative;
`;
const CardLabel = styled.span<{ bg: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${(props) => props.bg};
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
`;
const CardBody = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.2rem;
`;
const Subtitle = styled.p`
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: #888;
`;
const Scrobbles = styled.p`
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: #888;
`;
const SmallGrid = styled(DetailGrid)`
  margin-bottom: 0;
`;
const SmallCard = styled(Card)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;
const SmallValue = styled.h2`
  margin: 0;
  font-size: 2rem;
  flex: 1;
`;
const SmallList = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
`;
const SmallItem = styled.li`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 8px;
  }
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

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (loading || !weekData || !musicRatio || !fingerprint)
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
        <NavButton>
          <FontAwesomeIcon icon={faShareAlt} />
        </NavButton>
      </WeekNav>

      <ScrobbleHeader>
        <ScrobbleLabel>Scrobbles</ScrobbleLabel>
        <ScrobbleValue>{weekData.total}</ScrobbleValue>
        <ScrobbleChange>
          <FontAwesomeIcon icon={faArrowUp} />
          {weekData.prevTotal > 0
            ? Math.round(
                ((weekData.total - weekData.prevTotal) /
                  weekData.prevTotal) *
                  100
              )
            : 0}
          % vs. last week
        </ScrobbleChange>
      </ScrobbleHeader>

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
              <Scrobbles>{a.play_count} scrobbles</Scrobbles>
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
              <Scrobbles>{al.play_count} scrobbles</Scrobbles>
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
              <Scrobbles>{t.play_count} scrobbles</Scrobbles>
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
            scrobbles: `${topArtists[0]?.play_count} scrobbles`,
          },
          {
            label: 'New Albums',
            img: topAlbums[0]?.album_image,
            text: `#1 ${topAlbums[0]?.album_name}`,
            scrobbles: `${topAlbums[0]?.play_count} scrobbles`,
          },
          {
            label: 'New Tracks',
            img: topTracks[0]?.album_image,
            text: `#1 ${topTracks[0]?.track_name}`,
            scrobbles: `${topTracks[0]?.play_count} scrobbles`,
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
                    {ns.scrobbles}
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
