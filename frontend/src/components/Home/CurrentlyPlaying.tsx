import React, { useEffect, useState } from 'react';
import { 
  Title,
  Container,
  SongDetails,
  Info,
  ProgressTime,
  ProgressBar,
  ProgressContainer,
  AlbumImage,
  NoSongMessage,
} from './Styles/style';

interface RecentTrack {
  track_name: string;
  artist_name: string;
  album_image: string | null;
  played_at: string;
}

const CurrentlyPlaying: React.FC = () => {

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentArtist, setCurrentArtist] = useState<string | null>(null);
  const [albumImage, setAlbumImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressMs, setProgressMs] = useState<number | null>(0);
  const [durationMs, setDurationMs] = useState<number | null>(0);
  const [adPlaying, setAdPlaying] = useState<boolean>(false); // New state for ad playing

  useEffect(() => {
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
            setProgressMs(songInfo.progress_ms);
            setDurationMs(songInfo.duration_ms);
            setAdPlaying(false); // Reset ad playing state
          } else {
            setIsPlaying(false);
            setAdPlaying(true); // Set ad playing if no track information
          }
        } else {
          console.error("Failed to fetch current song");
          // Here we handle specific CORS issues
          const errorMessage = await response.text();
          if (errorMessage.includes("CORS header 'Access-Control-Allow-Origin' missing")) {
            setIsPlaying(false); // No song is playing
            setAdPlaying(true); // Set ad playing when CORS error occurs
          }
        }
      } catch (error) {
        console.error("Error fetching current song", error);
        // Handle case where the fetch fails
        setIsPlaying(false);
        setAdPlaying(true); // Assume ad is playing if there's a fetch error
      }
    };

    fetchCurrentSong();

    const interval = setInterval(() => {
      fetchCurrentSong();
    }, 1000); // Fetch the current song every second to update the progress

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  // Calculate progress as percentage
  const calculateProgress = () => {
    if (!progressMs || !durationMs) return 0;
    return (progressMs / durationMs) * 100;
  };

  // Helper function to format time in mm:ss
  const formatTime = (ms: number | null) => {
    if (ms === null) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {adPlaying ? ( 
        <NoSongMessage>An ad is currently playing.</NoSongMessage>
      ) : isPlaying ? (
        <SongDetails>
          <Title>Currently Playing</Title>
          <Info><strong>Track:</strong> {currentTrack}</Info>
          <Info><strong>Artist:</strong> {currentArtist}</Info>
          {albumImage && <AlbumImage src={albumImage} alt="Album cover" />}
          <ProgressTime>
            {formatTime(progressMs)} / {formatTime(durationMs)}
          </ProgressTime>
          <ProgressContainer>
            <ProgressBar progress={calculateProgress()} />
          </ProgressContainer>
        </SongDetails>
      ) : (
        <NoSongMessage>No song is currently playing.</NoSongMessage>
      )}
    </>
  );
};

export default CurrentlyPlaying;
