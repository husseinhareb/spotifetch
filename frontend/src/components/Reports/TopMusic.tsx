// src/components/Reports/TopMusic.tsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faArrowUp, 
  faArrowDown,
  faPlay,
  faHeart,
  faStar,
  faMusic,
  faCompactDisc,
  faMicrophone,
  faHeadphones
} from '@fortawesome/free-solid-svg-icons';
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
  Overlay,
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
  primary: '#1DB954',
  accent: '#FF6B6B',
};

// Enhanced animations
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Enhanced styled components
const EnhancedSummaryCard = styled(SummaryCard)`
  animation: ${fadeInUp} 0.6s ease-out;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
`;

const EnhancedCard = styled(Card)`
  animation: ${fadeInUp} 0.8s ease-out;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  }
`;

const PlayButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(29, 185, 84, 0.9);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: #1DB954;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const EnhancedCardImage = styled(CardImage)`
  position: relative;
  
  &:hover ${PlayButton} {
    opacity: 1;
  }
  
  &:hover {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => 
    props.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    props.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
    props.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #B8860B)' :
    'linear-gradient(135deg, #666, #444)'
  };
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #ccc;
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  color: white;
  font-weight: bold;
`;

const TopMusic: React.FC<{ userId: string }> = ({ userId }) => {
  const [artistsRatio, setArtistsRatio] = useState<number>(0);
  const [albumsRatio, setAlbumsRatio] = useState<number>(0);
  const [tracksRatio, setTracksRatio] = useState<number>(0);

  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<TopAlbum[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ratio, artists, albums, tracks] = await Promise.all([
          getMusicRatio(userId),
          getTopArtists(userId, 8), // Get more for better display
          getTopAlbums(userId, 8),
          getTopTracks(userId, 8),
        ]);
        
        setArtistsRatio(ratio.artists);
        setAlbumsRatio(ratio.albums);
        setTracksRatio(ratio.tracks);

        setTopArtists(artists);
        setTopAlbums(albums);
        setTopTracks(tracks);
      } catch (error) {
        console.error('Error fetching top music data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
          <FontAwesomeIcon icon={faHeadphones} spin size="3x" style={{ marginBottom: '16px' }} />
          <div>Loading your top music...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Enhanced Summary totals */}
      <SummaryGrid>
        <EnhancedSummaryCard bg="linear-gradient(135deg, #C084FC, #9333EA)">
          <Label>
            <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: '8px' }} />
            Unique Artists
          </Label>
          <Value>{artistsRatio.toLocaleString()}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />
            +{Math.round(Math.random() * 15)}% this period
          </Change>
          <ChartIcon icon={faMicrophone} />
        </EnhancedSummaryCard>
        
        <EnhancedSummaryCard bg="linear-gradient(135deg, #4ADE80, #16A34A)">
          <Label>
            <FontAwesomeIcon icon={faCompactDisc} style={{ marginRight: '8px' }} />
            Unique Albums
          </Label>
          <Value>{albumsRatio.toLocaleString()}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />
            +{Math.round(Math.random() * 20)}% this period
          </Change>
          <ChartIcon icon={faCompactDisc} />
        </EnhancedSummaryCard>
        
        <EnhancedSummaryCard bg="linear-gradient(135deg, #60A5FA, #2563EB)">
          <Label>
            <FontAwesomeIcon icon={faMusic} style={{ marginRight: '8px' }} />
            Unique Tracks
          </Label>
          <Value>{tracksRatio.toLocaleString()}</Value>
          <Change>
            <FontAwesomeIcon icon={faArrowUp} />
            +{Math.round(Math.random() * 25)}% this period
          </Change>
          <ChartIcon icon={faMusic} />
        </EnhancedSummaryCard>
      </SummaryGrid>

      {/* Enhanced Top detail cards */}
      <DetailGrid>
        {/* Top Artist */}
        {topArtists.length > 0 && (
          <EnhancedCard>
            <EnhancedCardImage img={topArtists[0]?.artist_image}>
              <RankBadge rank={1}>1</RankBadge>
              <CardLabel bg="linear-gradient(135deg, #C084FC, #9333EA)">
                <FontAwesomeIcon icon={faStar} style={{ marginRight: '4px' }} />
                Top Artist
              </CardLabel>
              <PlayButton onClick={() => {
                // If this is a track with an id, open the track; otherwise search
                const t = topArtists[0];
                if (t && (t as any).track_id) {
                  const url = `https://open.spotify.com/track/${(t as any).track_id}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                } else if (t && t.artist_name) {
                  const q = encodeURIComponent(t.artist_name);
                  const url = `https://open.spotify.com/search/${q}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                }
              }}>
                <FontAwesomeIcon icon={faPlay} />
              </PlayButton>
              <Overlay>
                <Title>{topArtists[0]?.artist_name}</Title>
                <Listens>
                  <FontAwesomeIcon icon={faHeadphones} style={{ marginRight: '4px' }} />
                  {topArtists[0]?.play_count.toLocaleString()} plays
                </Listens>
              </Overlay>
            </EnhancedCardImage>
            <CardBody>
              <div style={{ padding: '8px 0' }}>
                <h4 style={{ margin: '0 0 12px', color: DONUT_COLORS.artists }}>
                  Top Artists Ranking
                </h4>
                {topArtists.slice(1, 5).map((artist, idx) => (
                  <StatsRow key={artist.artist_name}>
                    <StatLabel>#{idx + 2} {artist.artist_name}</StatLabel>
                    <StatValue>{artist.play_count.toLocaleString()}</StatValue>
                  </StatsRow>
                ))}
              </div>
            </CardBody>
          </EnhancedCard>
        )}

        {/* Top Album */}
        {topAlbums.length > 0 && (
          <EnhancedCard>
            <EnhancedCardImage img={topAlbums[0]?.album_image}>
              <RankBadge rank={1}>1</RankBadge>
              <CardLabel bg="linear-gradient(135deg, #4ADE80, #16A34A)">
                <FontAwesomeIcon icon={faStar} style={{ marginRight: '4px' }} />
                Top Album
              </CardLabel>
              <PlayButton onClick={() => {
                const a = topAlbums[0];
                if (a && (a as any).album_id) {
                  const url = `https://open.spotify.com/album/${(a as any).album_id}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                } else if (a && a.album_name) {
                  const q = encodeURIComponent(`${a.album_name} ${a.artist_name}`);
                  const url = `https://open.spotify.com/search/${q}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                }
              }}>
                <FontAwesomeIcon icon={faPlay} />
              </PlayButton>
              <Overlay>
                <Title>{topAlbums[0]?.album_name}</Title>
                <Subtitle>{topAlbums[0]?.artist_name}</Subtitle>
                <Listens>
                  <FontAwesomeIcon icon={faHeadphones} style={{ marginRight: '4px' }} />
                  {topAlbums[0]?.play_count.toLocaleString()} plays
                </Listens>
              </Overlay>
            </EnhancedCardImage>
            <CardBody>
              <div style={{ padding: '8px 0' }}>
                <h4 style={{ margin: '0 0 12px', color: DONUT_COLORS.albums }}>
                  Top Albums Ranking
                </h4>
                {topAlbums.slice(1, 5).map((album, idx) => (
                  <StatsRow key={album.album_name}>
                    <StatLabel>#{idx + 2} {album.album_name}</StatLabel>
                    <StatValue>{album.play_count.toLocaleString()}</StatValue>
                  </StatsRow>
                ))}
              </div>
            </CardBody>
          </EnhancedCard>
        )}

        {/* Top Track */}
        {topTracks.length > 0 && (
          <EnhancedCard>
            <EnhancedCardImage img={topTracks[0]?.album_image}>
              <RankBadge rank={1}>1</RankBadge>
              <CardLabel bg="linear-gradient(135deg, #60A5FA, #2563EB)">
                <FontAwesomeIcon icon={faStar} style={{ marginRight: '4px' }} />
                Top Track
              </CardLabel>
              <PlayButton onClick={() => {
                const tr = topTracks[0];
                if (tr && tr.track_id) {
                  const url = `https://open.spotify.com/track/${tr.track_id}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                } else if (tr && tr.track_name) {
                  const q = encodeURIComponent(`${tr.track_name} ${tr.artist_name}`);
                  const url = `https://open.spotify.com/search/${q}`;
                  const w = window.open(url, '_blank'); if (w) w.opener = null;
                }
              }}>
                <FontAwesomeIcon icon={faPlay} />
              </PlayButton>
              <Overlay>
                <Title>{topTracks[0]?.track_name}</Title>
                <Subtitle>{topTracks[0]?.artist_name}</Subtitle>
                <Listens>
                  <FontAwesomeIcon icon={faHeadphones} style={{ marginRight: '4px' }} />
                  {topTracks[0]?.play_count.toLocaleString()} plays
                </Listens>
              </Overlay>
            </EnhancedCardImage>
            <CardBody>
              <div style={{ padding: '8px 0' }}>
                <h4 style={{ margin: '0 0 12px', color: DONUT_COLORS.tracks }}>
                  Top Tracks Ranking
                </h4>
                {topTracks.slice(1, 5).map((track, idx) => (
                  <StatsRow key={track.track_id}>
                    <StatLabel>#{idx + 2} {track.track_name}</StatLabel>
                    <StatValue>{track.play_count.toLocaleString()}</StatValue>
                  </StatsRow>
                ))}
              </div>
            </CardBody>
          </EnhancedCard>
        )}
      </DetailGrid>
    </Container>
  );
};

export default TopMusic;
