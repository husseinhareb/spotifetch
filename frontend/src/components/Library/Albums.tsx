// src/components/Albums/Albums.tsx
import React, { useEffect, useState } from "react";
import { useUserId } from "../../services/store";
import { fetchTopAlbums, TopAlbum } from "../../repositories/historyRepository";
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

const Albums: React.FC = () => {
  const userId = useUserId();
  const [albums, setAlbums] = useState<TopAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadAlbums = async () => {
      setLoading(true);
      try {
        const data = await fetchTopAlbums(userId, 20);
        setAlbums(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load top albums");
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [userId]);

  if (error) return <Message>{error}</Message>;

  return (
    <Container>
      {loading ? (
        <Message>Loading...</Message>
      ) : albums.length === 0 ? (
        <Message>No albums played yet.</Message>
      ) : (
        <TrackList>
          {albums.map((album, idx) => (
            <TrackItem key={idx}>
              {album.album_image && (
                <AlbumImage
                  src={album.album_image}
                  alt={`${album.album_name} cover`}
                />
              )}
              <TrackDetails>
                <TrackName>{album.album_name}</TrackName>
                <ArtistName>{album.artist_name}</ArtistName>
                <PlayedAt>
                  Times Played: <strong>{album.play_count}</strong>
                </PlayedAt>
              </TrackDetails>
            </TrackItem>
          ))}
        </TrackList>
      )}
    </Container>
  );
};

export default Albums;
