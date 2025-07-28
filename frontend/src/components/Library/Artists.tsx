// src/components/Artists/Artists.tsx
import React, { useEffect, useState } from "react";
import { useUserId } from "../../services/store";
import { fetchTopArtists, TopArtist } from "../../repositories/historyRepository";
import {
  Container,
  Message,
  TrackList,
  TrackItem,
  AlbumImage,
  TrackDetails,
  ArtistName,
  PlayedAt,
} from "./Styles/style";

const Artists: React.FC = () => {
  const userId = useUserId();
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadArtists = async () => {
      setLoading(true);
      try {
        const data = await fetchTopArtists(userId, 20);
        setArtists(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load top artists.");
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, [userId]);

  if (error) return <Message>{error}</Message>;

  return (
    <Container>
      {loading ? (
        <Message>Loading...</Message>
      ) : artists.length === 0 ? (
        <Message>No artists in your history yet.</Message>
      ) : (
        <TrackList>
          {artists.map((artist, idx) => (
            <TrackItem key={idx}>
              { /* if you have an artist_image, show it */ }
              {artist.artist_image && (
                <AlbumImage
                  src={artist.artist_image}
                  alt={`${artist.artist_name} artwork`}
                />
              )}
              <TrackDetails>
                <ArtistName>{artist.artist_name}</ArtistName>
                <PlayedAt>
                  Plays: <strong>{artist.play_count}</strong>
                </PlayedAt>
              </TrackDetails>
            </TrackItem>
          ))}
        </TrackList>
      )}
    </Container>
  );
};

export default Artists;
