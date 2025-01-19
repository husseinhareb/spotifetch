import React, { useEffect, useState } from "react";
import axios from "axios";
// Reuse your styled-components:
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

// Define the TypeScript type for a song
interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
  play_count?: number; // <-- Add a property for how many times the track was played
}

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the songs sorted by how many times they've been played
  const fetchMostPlayedSongs = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ songs: Song[] }>(
        "http://localhost:8000/tracks/songs_most_played"
      );
      // If your backend is already returning them in sorted order, you can skip sorting here.
      // Otherwise, you can sort in the frontend:
      const sortedSongs = response.data.songs.sort(
        (a, b) => (b.play_count || 0) - (a.play_count || 0)
      );

      setSongs(sortedSongs);
    } catch (err) {
      setError("Failed to fetch most played songs");
    } finally {
      setLoading(false);
    }
  };

  // Load songs on mount
  useEffect(() => {
    fetchMostPlayedSongs();
  }, []);

  if (error) return <Message>{error}</Message>;

  return (
    <Container>
      {loading ? (
        <Message>Loading...</Message>
      ) : (
        <TrackList>
          {songs.map((song, index) => (
            <TrackItem key={index}>
              {song.album_image && (
                <AlbumImage
                  src={song.album_image}
                  alt={`${song.track_name} album cover`}
                />
              )}
              <TrackDetails>
                <TrackName>{song.track_name}</TrackName>
                <ArtistName>{song.artist_name}</ArtistName>
                <PlayedAt>
                  Times Played: <strong>{song.play_count ?? 0}</strong>
                </PlayedAt>
              </TrackDetails>
            </TrackItem>
          ))}
        </TrackList>
      )}
    </Container>
  );
};

export default Songs;
