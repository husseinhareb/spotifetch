import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useUsername } from '../../services/store';

// Styled components for enhanced design
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
  height: 100vh;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const WelcomeMessage = styled.p`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const SongDetails = styled.div`
  text-align: center;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const Info = styled.p`
  font-size: 1.2rem;
  margin: 10px 0;
`;

const AlbumImage = styled.img`
  width: 100%;
  max-width: 300px;
  border-radius: 10px;
  margin: 20px 0;
`;

const ProgressContainer = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 15px;
  position: relative;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => `${progress}%`};
  height: 100%;
  background-color: #4caf50;
  transition: width 0.5s ease;
`;

const ProgressTime = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin: 10px 0;
`;

const NoSongMessage = styled.p`
  font-size: 1.5rem;
  color: #888;
`;

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
    <Container>
      <WelcomeMessage>Welcome home, {username}!</WelcomeMessage>
      {isPlaying ? (
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
    </Container>
  );
};

export default Home;
