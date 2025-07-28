// src/components/Songs/Songs.tsx
import React, { useEffect, useState } from "react";
import { useUserId } from "../../services/store";
import { fetchTopTracks, TopTrack } from "../../repositories/historyRepository";
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

const Songs: React.FC = () => {
  const userId = useUserId();
  const [songs, setSongs] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadTop = async () => {
      setLoading(true);
      try {
        const top = await fetchTopTracks(userId, 20);
        setSongs(top);
      } catch {
        setError("Failed to fetch most-played songs");
      } finally {
        setLoading(false);
      }
    };

    loadTop();
  }, [userId]);

  if (error) return <Message>{error}</Message>;

  return (
    <Container>
      {loading ? (
        <Message>Loading...</Message>
      ) : songs.length === 0 ? (
        <Message>No tracks played yet.</Message>
      ) : (
        <TrackList>
          {songs.map((song, idx) => (
            <TrackItem key={idx}>
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
                  Times Played: <strong>{song.play_count}</strong>
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
