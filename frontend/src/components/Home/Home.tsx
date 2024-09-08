import React, { useEffect, useState } from 'react';
import { useUsername } from '../../services/store';

const Home: React.FC = () => {
  const username = useUsername();

  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentArtist, setCurrentArtist] = useState<string | null>(null);
  const [albumImage, setAlbumImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressMs, setProgressMs] = useState<number | null>(0);
  const [durationMs, setDurationMs] = useState<number | null>(0);

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
          }
        } else {
          console.error("Failed to fetch current song");
        }
      } catch (error) {
        console.error("Error fetching current song", error);
      }
    };

    fetchCurrentSong();
  }, []);

  // Helper function to format time in mm:ss
  const formatTime = (ms: number | null) => {
    if (ms === null) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div>
      <p>Welcome home, {username}!</p>
      {isPlaying ? (
        <div>
          <h2>Currently Playing:</h2>
          <p><strong>Track:</strong> {currentTrack}</p>
          <p><strong>Artist:</strong> {currentArtist}</p>
          {albumImage && <img src={albumImage} alt="Album cover" />}
          <p><strong>Progress:</strong> {formatTime(progressMs)} / {formatTime(durationMs)}</p>
        </div>
      ) : (
        <p>No song is currently playing.</p>
      )}
    </div>
  );
};

export default Home;
