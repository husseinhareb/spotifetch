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
  PlayingNowLabel, // New styled component for "Playing Now" label
} from './Styles/style';

interface RecentTrack {
  track_name: string;
  artist_name: string;
  album_image: string | null;
  played_at: string;
}

const RecentlyPlayed: React.FC = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentTrack[]>([]);
  
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentArtist, setCurrentArtist] = useState<string | null>(null);
  const [albumImage, setAlbumImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    // Fetch Recently Played Tracks
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

    // Fetch Currently Playing Song
    const fetchCurrentSong = async () => {
      try {
        const response = await fetch("http://localhost:8000/currently_playing", {
          credentials: "include",
        });
        if (response.ok) {
          const songInfo = await response.json();
          if (songInfo.track_name) {
            setCurrentTrack(songInfo.track_name);
            setCurrentArtist(songInfo.artist_name);
            setAlbumImage(songInfo.album_image);
            setIsPlaying(songInfo.is_playing);
          } else {
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error("Error fetching current song", error);
        setIsPlaying(false);
      }
    };

    fetchRecentlyPlayed();
    fetchCurrentSong();

    const interval = setInterval(() => {
      fetchCurrentSong(); // Refresh current song every second
    }, 1000);

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Utility function to format time played
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
      return playedDate.toLocaleString();
    }
  };

  return (
    <>
      <RecentlyPlayedTitle>Recent Tracks</RecentlyPlayedTitle>
      <RecentlyPlayedList>
        {/* Show Currently Playing song first if it exists */}
        {isPlaying && (
          <RecentlyPlayedItem>
            {albumImage && <RecentlyPlayedImage src={albumImage} alt="Album cover" />}
            <RecentlyPlayedInfo>
              <PlayingNowLabel>Playing Now</PlayingNowLabel>
              <Info><strong>{currentTrack}</strong></Info>
              <Info>{currentArtist}</Info>
            </RecentlyPlayedInfo>
          </RecentlyPlayedItem>
        )}

        {/* Display Recently Played Tracks */}
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
