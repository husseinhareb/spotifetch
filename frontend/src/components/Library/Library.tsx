import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Heading,
  Message,
  TrackList,
  TrackItem,
  AlbumImage,
  TrackDetails,
  TrackName,
  ArtistName,
  PlayedAt,
  NavList,
  NavItem,
  NavBar,NavLink
} from "./Styles/style";
import { formatPlayedTime } from '../../helpers/timeUtils';
 
// Define the TypeScript type for a song
interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
}

const YourData: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0); // Pagination skip value
  const [hasMore, setHasMore] = useState<boolean>(true); // Check if more data is available

  // Fetch recently played songs from the database
  const fetchRecentTracks = async () => {
    if (!hasMore) return;

    try {
      setLoading(true);
      const response = await axios.get<{ recent_tracks: Song[] }>(
        `http://localhost:8000/tracks/api/recently_played_db?skip=${skip}`
      );
      const fetchedTracks = response.data.recent_tracks;

      if (fetchedTracks.length > 0) {
        setRecentTracks((prev) => [...prev, ...fetchedTracks]);
        setSkip((prev) => prev + fetchedTracks.length);
      } else {
        setHasMore(false); // No more data to fetch
      }
    } catch (err) {
      setError("Failed to fetch recently played songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentTracks();
  }, []);

  // Infinite scroll handler
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      fetchRecentTracks();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore]);

  if (error) return <Message>{error}</Message>;

  const renderTracks = (tracks: Song[]) => (
    <TrackList>
      {tracks.map((track, index) => (
        <TrackItem key={index}>
          {track.album_image && (
            <AlbumImage
              src={track.album_image}
              alt={`${track.track_name} album cover`}
            />
          )}
          <TrackDetails>
            <TrackName>{track.track_name}</TrackName>
            <ArtistName>{track.artist_name}</ArtistName>
            <PlayedAt>
              {formatPlayedTime(track.played_at)}
            </PlayedAt>
          </TrackDetails>
        </TrackItem>
      ))}
    </TrackList>
  );

  return (
    <Container>
      <Heading>Library</Heading>
      <NavBar>
      <NavList>
        <NavItem>
          <NavLink>
            Recently Listened
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink>
            Songs
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink>
            Artists
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink>
            Albums
          </NavLink>
        </NavItem>
      </NavList>
    </NavBar>

      {renderTracks(recentTracks)}
      {loading && <Message>Loading...</Message>}
      {!hasMore && !loading && <Message>No more songs to load.</Message>}
    </Container>
  );
};

export default YourData;
