import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Message,
  TrackList,
  TrackItem,
  AlbumImage,
  TrackDetails,
  TrackName,
  ArtistName,
  PlayedAt,
} from "./Styles/style";
import { formatPlayedTime } from "../../helpers/timeUtils";
import { useUsername } from "../../services/store";

// Define the TypeScript type for a song
interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
}

const RecentlyPlayed: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0); // Pagination skip value
  const [hasMore, setHasMore] = useState<boolean>(true); // Check if more data is available
  const username = useUsername();

  // Fetch recently played songs from the database
  const fetchRecentTracks = async (username: string) => {
    if (!hasMore) return;

    try {
      setLoading(true);
      const response = await axios.get<{ recent_tracks: Song[] }>(
        `http://localhost:8000/tracks/user/${username}/library/recently_played_db?skip=${skip}`
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
    if (username === "N/A") return; // Skip calling the API if username is not set
    fetchRecentTracks(username);
  }, [username]);
  
  // Infinite scroll handler
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      fetchRecentTracks(username);
    }
  };

  // Attach scroll listener
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
      {renderTracks(recentTracks)}
      {loading && <Message>Loading...</Message>}
      {!hasMore && !loading && <Message>No more songs to load.</Message>}
    </Container>
  );
};

export default RecentlyPlayed;
