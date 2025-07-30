import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Navigate } from 'react-router-dom';
import { useUserId, useIsLoggedIn } from '../../services/store';
import {
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  TopArtist,
  TopAlbum,
  TopTrack,
} from '../../repositories/reportsRepository';

const Container = styled.div`
  padding: 20px;
  background: #000;
  color: #fff;
`;

// Summary cards grid
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;

const SummaryCard = styled.div<{ bg: string }>`
  background: ${props => props.bg};
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
`;

const ChartIcon = styled(FontAwesomeIcon)`
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0.3;
  font-size: 2rem;
`;

// Detail cards grid
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
  background: url(${props => props.img || ''}) center/cover no-repeat;
  height: 200px;
  position: relative;
`;

const CardLabel = styled.span<{ bg: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => props.bg};
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

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
`;

const ListItem = styled.li`
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

// Mini cards grid
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

const SmallList = styled(List)`
  display: flex;
`;

const SmallItem = styled(ListItem)`
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

const Reports: React.FC = () => {
  const userId = useUserId();
  const isLoggedIn = useIsLoggedIn();

  const [summary, setSummary] = useState<{
    label: string;
    value: number;
    change: number;
    bg: string;
  }[]>([]);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<TopAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [allA, prevA, allAL, prevAL, allT, prevT] = await Promise.all([
          getTopArtists(userId),
          getTopArtists(userId),
          getTopAlbums(userId),
          getTopAlbums(userId),
          getTopTracks(userId),
          getTopTracks(userId),
        ]);

        const [detailA, detailAL, detailT] = await Promise.all([
          getTopArtists(userId, 5),
          getTopAlbums(userId, 5),
          getTopTracks(userId, 5),
        ]);

        const computeChange = (curr: number, prev: number) =>
          prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

        setSummary([
          { label: 'Artists', value: allA.length, change: computeChange(allA.length, prevA.length), bg: '#C084FC' },
          { label: 'Albums', value: allAL.length, change: computeChange(allAL.length, prevAL.length), bg: '#4ADE80' },
          { label: 'Tracks', value: allT.length, change: computeChange(allT.length, prevT.length), bg: '#60A5FA' },
        ]);

        setTopArtists(detailA);
        setTopAlbums(detailAL);
        setTopTracks(detailT);
      } catch (err) {
        console.error(err);
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (loading) return <Container><p>Loading reports...</p></Container>;
  if (error) return <Container><p>{error}</p></Container>;

  // For now reusing the top item for new stats preview
  const newStats = [
    { label: 'New Artists', value: '3%', items: [{ img: topArtists[0]?.artist_image || '', text: `#1 ${topArtists[0]?.artist_name}`, scrobbles: `${topArtists[0]?.play_count} scrobbles` }] },
    { label: 'New Albums', value: '4%', items: [{ img: topAlbums[0]?.album_image || '', text: `#1 ${topAlbums[0]?.album_name}`, scrobbles: `${topAlbums[0]?.play_count} scrobbles` }] },
    { label: 'New Tracks', value: '5%', items: [{ img: topTracks[0]?.album_image || '', text: `#1 ${topTracks[0]?.track_name}`, scrobbles: `${topTracks[0]?.play_count} scrobbles` }] },
  ];

  return (
    <Container>
      <SummaryGrid>
        {summary.map(s => (
          <SummaryCard key={s.label} bg={s.bg}>
            <Label>{s.label}</Label>
            <Value>{s.value}</Value>
            <Change><FontAwesomeIcon icon={faArrowUp}/> {s.change}%</Change>
            <ChartIcon icon={faChartBar}/>
          </SummaryCard>
        ))}
      </SummaryGrid>

      <DetailGrid>
        {topArtists.map((a, i) => (
          <Card key={a.artist_name}>
            <CardImage img={a.artist_image}>
              <CardLabel bg="#C084FC">Top Artist</CardLabel>
            </CardImage>
            <CardBody>
              <Title>#{i+1} {a.artist_name}</Title>
              <Scrobbles>{a.play_count} scrobbles</Scrobbles>
            </CardBody>
          </Card>
        ))}

        {topAlbums.map((al, i) => (
          <Card key={al.album_name}>
            <CardImage img={al.album_image}>
              <CardLabel bg="#4ADE80">Top Album</CardLabel>
            </CardImage>
            <CardBody>
              <Title>#{i+1} {al.album_name}</Title>
              <Subtitle>{al.artist_name}</Subtitle>
              <Scrobbles>{al.play_count} scrobbles</Scrobbles>
            </CardBody>
          </Card>
        ))}

        {topTracks.map((t, i) => (
          <Card key={t.track_id}>
            <CardImage img={t.album_image}>
              <CardLabel bg="#60A5FA">Top Track</CardLabel>
            </CardImage>
            <CardBody>
              <Title>#{i+1} {t.track_name}</Title>
              <Subtitle>{t.artist_name}</Subtitle>
              <Scrobbles>{t.play_count} scrobbles</Scrobbles>
            </CardBody>
          </Card>
        ))}
      </DetailGrid>

      <SmallGrid>
        {newStats.map(ns => (
          <SmallCard key={ns.label}>
            <Label>{ns.label}</Label>
            <SmallValue>{ns.value}</SmallValue>
            <SmallList>
              {ns.items.map(item => (
                <SmallItem key={item.text}>
                  <img src={item.img} alt={item.text}/>
                  <div>
                    <p style={{margin:0}}>{item.text}</p>
                    <p style={{margin:0, fontSize:'0.8rem', color:'#888'}}>{item.scrobbles}</p>
                  </div>
                </SmallItem>
              ))}
            </SmallList>
          </SmallCard>
        ))}
      </SmallGrid>
    </Container>
  );
};

export default Reports;