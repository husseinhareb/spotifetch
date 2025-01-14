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
  AlbumName,
  PlayedAt,
} from "./Styles/style";

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

  // Fetch recently played songs from the database
  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await axios.get<{ recent_tracks: Song[] }>(
          "http://localhost:8000/api/recently_played_db"
        );
        setRecentTracks(response.data.recent_tracks);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch recently played songs");
        setLoading(false);
      }
    };

    fetchRecentTracks();
  }, []);

  if (loading) return <Message>Loading...</Message>;
  if (error) return <Message>{error}</Message>;

  const groupTracksByDate = () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    return {
      today: recentTracks.filter((track) => track.played_at.startsWith(today)),
      yesterday: recentTracks.filter((track) => track.played_at.startsWith(yesterday)),
      older: recentTracks.filter(
        (track) => !track.played_at.startsWith(today) && !track.played_at.startsWith(yesterday)
      ),
    };
  };

  const { today, yesterday, older } = groupTracksByDate();

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
            <TrackName>{track.track_name}</TrackName> by <ArtistName>{track.artist_name}</ArtistName>
            <br />
            <AlbumName>{track.album_name}</AlbumName>
            <br />
            <PlayedAt>Played at: {new Date(track.played_at).toLocaleTimeString()}</PlayedAt>
          </TrackDetails>
        </TrackItem>
      ))}
    </TrackList>
  );

  return (
    <Container>
      <Heading>Library</Heading>
      {today.length > 0 && (
        <div>
          <Heading>Today</Heading>
          {renderTracks(today)}
        </div>
      )}
      {yesterday.length > 0 && (
        <div>
          <Heading>Yesterday</Heading>
          {renderTracks(yesterday)}
        </div>
      )}
      {older.length > 0 && (
        <div>
          <Heading>Older</Heading>
          {renderTracks(older)}
        </div>
      )}
      {today.length === 0 && yesterday.length === 0 && older.length === 0 && (
        <Message>No recently played songs found.</Message>
      )}
    </Container>
  );
};

export default YourData;
