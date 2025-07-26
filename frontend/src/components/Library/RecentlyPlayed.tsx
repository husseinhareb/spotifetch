// src/components/RecentlyPlayed/RecentlyPlayed.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import { fetchUserHistory, Song } from "../../repositories/historyRepository";

const RecentlyPlayed: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const username = useUsername();

  const loadMore = useCallback(async () => {
    if (!hasMore || username === "N/A") return;

    setLoading(true);
    try {
      const fetched = await fetchUserHistory(username, skip);
      if (fetched.length > 0) {
        setRecentTracks((prev) => [...prev, ...fetched]);
        setSkip((prev) => prev + fetched.length);
      } else {
        setHasMore(false);
      }
    } catch {
      setError("Failed to fetch recently played songs");
    } finally {
      setLoading(false);
    }
  }, [hasMore, username, skip]);

  useEffect(() => {
    loadMore();
  }, [username, loadMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !loading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadMore]);

  if (error) return <Message>{error}</Message>;

  return (
    <Container>
      <TrackList>
        {recentTracks.map((track, idx) => (
          <TrackItem key={idx}>
            {track.album_image && (
              <AlbumImage
                src={track.album_image}
                alt={`${track.track_name} album cover`}
              />
            )}
            <TrackDetails>
              <TrackName>{track.track_name}</TrackName>
              <ArtistName>{track.artist_name}</ArtistName>
              <PlayedAt>{formatPlayedTime(track.played_at)}</PlayedAt>
            </TrackDetails>
          </TrackItem>
        ))}
      </TrackList>
      {loading && <Message>Loading...</Message>}
      {!hasMore && !loading && <Message>No more songs to load.</Message>}
    </Container>
  );
};

export default RecentlyPlayed;
