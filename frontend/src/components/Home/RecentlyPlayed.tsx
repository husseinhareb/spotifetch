import React, { useEffect, useState } from 'react';
import {
  Container,
  Info,
  NoSongMessage,
  RecentlyPlayedTitle,
  RecentlyPlayedList,
  RecentlyPlayedItem,
  RecentlyPlayedImage,
  RecentlyPlayedInfo,
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

  // Utility function to format the time played
  const formatPlayedTime = (playedAt: string) => {
    const playedDate = new Date(playedAt);
    const now = new Date();
    const timeDifference = now.getTime() - playedDate.getTime();
    const minutesDiff = Math.floor(timeDifference / (1000 * 60));
    const hoursDiff = Math.floor(timeDifference / (1000 * 60 * 60));

    if (minutesDiff < 60) {
      return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
    } else {
      return playedDate.toLocaleString(); // Default format for older dates
    }
  };

  return (
    <>
      <RecentlyPlayedTitle>Recent Tracks</RecentlyPlayedTitle>
      <RecentlyPlayedList>
        {recentlyPlayed.length > 0 ? (
          recentlyPlayed.map((track, index) => (
            <RecentlyPlayedItem key={index}>
              {track.album_image && <RecentlyPlayedImage src={track.album_image} alt="Album cover" />}
              <RecentlyPlayedInfo>
                <Info><strong>{track.track_name}</strong></Info>
                <Info>{track.artist_name}</Info>
                <Info>{formatPlayedTime(track.played_at)}</Info>
              </RecentlyPlayedInfo>
            </RecentlyPlayedItem>
          ))
        ) : (
          <NoSongMessage>No recently played tracks available.</NoSongMessage>
        )}
      </RecentlyPlayedList>
    </>
  );
};

export default RecentlyPlayed;