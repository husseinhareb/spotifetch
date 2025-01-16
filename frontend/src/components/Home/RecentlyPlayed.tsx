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
  PlayingNowLabel,
  GifImage, // New styled component for the GIF
} from './Styles/style';
import { formatPlayedTime } from '../../helpers/timeUtils'
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
  const [adPlaying, setAdPlaying] = useState<boolean>(false);

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
            setAdPlaying(false); // Reset ad playing state
          } else {
            setIsPlaying(false);
            setAdPlaying(true); // Set ad playing if no track information
          }
        }
      } catch (error) {
        console.error("Error fetching current song", error);
        setIsPlaying(false);
        setAdPlaying(true);
      }
    };

    fetchRecentlyPlayed();
    fetchCurrentSong();

    const interval = setInterval(() => {
      fetchCurrentSong();
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  return (
    <>
      <RecentlyPlayedTitle>Recent Tracks</RecentlyPlayedTitle>
      <RecentlyPlayedList>
        {isPlaying && (
          <RecentlyPlayedItem>
            {albumImage && <RecentlyPlayedImage src={albumImage} alt="Album cover" />}
            <RecentlyPlayedInfo>
              <PlayingNowLabel>Playing Now</PlayingNowLabel>
              <Info><strong>{currentTrack}</strong></Info>
              <Info>{currentArtist}</Info>
            </RecentlyPlayedInfo>
            <GifImage src="/Equalizer.gif" alt="Playing animation" />
          </RecentlyPlayedItem>
        )}

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
