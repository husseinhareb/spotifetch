import React, { useEffect, useState } from 'react';
import {
  Container,
  Info,
  NoSongMessage,
  RecentlyPlayedTitle,
  RecentlyPlayedList,
  RecentlyPlayedItem,
  RecentlyPlayedImage
} from './Styles/style';

interface RecentTrack {
  track_name: string;
  artist_name: string;
  album_image: string | null;
  played_at: string;
}

const RecentlyPlayed: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentTrack[]>([]);

  useEffect(() => {

    const fetchRecentlyPlayed = async () => {
      try {
        const response = await fetch("http://localhost:8000/recently_played", {
          credentials: "include",
        });
        if (response.ok) {
          const recentTracksData = await response.json();
          setRecentlyPlayed(recentTracksData.recent_tracks);
        } else {
          console.error("Failed to fetch recently played tracks");
        }
      } catch (error) {
        console.error("Error fetching recently played tracks", error);
      }
    };

    fetchRecentlyPlayed();

  }, []);


  return (
    <Container>

      <RecentlyPlayedTitle>Recently Played Tracks</RecentlyPlayedTitle>
      <RecentlyPlayedList>
        {recentlyPlayed.length > 0 ? (
          recentlyPlayed.map((track, index) => (
            <RecentlyPlayedItem key={index}>
              {track.album_image && <RecentlyPlayedImage src={track.album_image} alt="Album cover" />}
              <Info><strong>Track:</strong> {track.track_name}</Info>
              <Info><strong>Artist:</strong> {track.artist_name}</Info>
              <Info><strong>Played at:</strong> {new Date(track.played_at).toLocaleString()}</Info>
            </RecentlyPlayedItem>
          ))
        ) : (
          <NoSongMessage>No recently played tracks available.</NoSongMessage>
        )}
      </RecentlyPlayedList>
    </Container>
  );
};

export default RecentlyPlayed;
