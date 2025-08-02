// src/components/Reports/TopMusic.tsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import {
  Container,
  SummaryGrid,
  SummaryCard,
  Label,
  Value,
  Change,
  ChartIcon,
  DetailGrid,
  Card,
  CardImage,
  CardLabel,
  CardBody,
  Title,
  Subtitle,
  Listens,
} from './Styles/style';
import {
  getMusicRatio,
  getTopArtists,
  getTopAlbums,
  getTopTracks,
  TopArtist,
  TopAlbum,
  TopTrack,
} from '../../repositories/reportsRepository';

const DONUT_COLORS = {
  artists: '#C084FC',
  albums: '#4ADE80',
  tracks: '#60A5FA',
};

const TopMusic: React.FC<{ userId: string }> = ({ userId }) => {
  const [artistsRatio, setArtistsRatio] = useState<number>(0);
  const [albumsRatio, setAlbumsRatio] = useState<number>(0);
  const [tracksRatio, setTracksRatio] = useState<number>(0);

  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<TopAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [ratio, artists, albums, tracks] = await Promise.all([
        getMusicRatio(userId),
        getTopArtists(userId, 5),
        getTopAlbums(userId, 5),
        getTopTracks(userId, 5),
      ]);
      setArtistsRatio(ratio.artists);
      setAlbumsRatio(ratio.albums);
      setTracksRatio(ratio.tracks);

      setTopArtists(artists);
      setTopAlbums(albums);
      setTopTracks(tracks);
    }
    fetchData();
  }, [userId]);

  return (
    <Container>
      {/* Summary totals */}
      <SummaryGrid>
        <SummaryCard bg={DONUT_COLORS.artists}>
          <Label>Artists</Label>
          <Value>{artistsRatio}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />0%
          </Change>
          <ChartIcon icon={faChartBar} />
        </SummaryCard>
        <SummaryCard bg={DONUT_COLORS.albums}>
          <Label>Albums</Label>
          <Value>{albumsRatio}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />0%
          </Change>
          <ChartIcon icon={faChartBar} />
        </SummaryCard>
        <SummaryCard bg={DONUT_COLORS.tracks}>
          <Label>Tracks</Label>
          <Value>{tracksRatio}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />0%
          </Change>
          <ChartIcon icon={faChartBar} />
        </SummaryCard>
      </SummaryGrid>

      {/* Top detail cards */}
      <DetailGrid>
        {/* Top Artist */}
        <Card>
          <CardImage img={topArtists[0]?.artist_image}>
            <CardLabel bg={DONUT_COLORS.artists}>Top Artist</CardLabel>
          </CardImage>
          <CardBody>
            <Title>#1 {topArtists[0]?.artist_name}</Title>
            <Listens>{topArtists[0]?.play_count} listens</Listens>
            <ul style={{ padding: 0, margin: '12px 0', listStyle: 'none', color: '#fff' }}>
              {topArtists.slice(1, 5).map((artist, idx) => (
                <li key={artist.artist_name}>
                  #{idx + 2} {artist.artist_name} <span style={{ color: '#888' }}>({artist.play_count})</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Top Album */}
        <Card>
          <CardImage img={topAlbums[0]?.album_image}>
            <CardLabel bg={DONUT_COLORS.albums}>Top Album</CardLabel>
          </CardImage>
          <CardBody>
            <Title>#1 {topAlbums[0]?.album_name}</Title>
            <Subtitle>{topAlbums[0]?.artist_name}</Subtitle>
            <Listens>{topAlbums[0]?.play_count} listens</Listens>
            <ul style={{ padding: 0, margin: '12px 0', listStyle: 'none', color: '#fff' }}>
              {topAlbums.slice(1, 5).map((album, idx) => (
                <li key={album.album_name}>
                  #{idx + 2} {album.album_name} <span style={{ color: '#888' }}>({album.play_count})</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Top Track */}
        <Card>
          <CardImage img={topTracks[0]?.album_image}>
            <CardLabel bg={DONUT_COLORS.tracks}>Top Track</CardLabel>
          </CardImage>
          <CardBody>
            <Title>#1 {topTracks[0]?.track_name}</Title>
            <Subtitle>{topTracks[0]?.artist_name}</Subtitle>
            <Listens>{topTracks[0]?.play_count} listens</Listens>
            <ul style={{ padding: 0, margin: '12px 0', listStyle: 'none', color: '#fff' }}>
              {topTracks.slice(1, 5).map((track, idx) => (
                <li key={track.track_id}>
                  #{idx + 2} {track.track_name} <span style={{ color: '#888' }}>({track.play_count})</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </DetailGrid>
    </Container>
  );
};

export default TopMusic;
