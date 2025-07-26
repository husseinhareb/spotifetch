import styled from 'styled-components';

// Container that wraps the entire content on the home page
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f7f7;
  min-height: 100vh;  
  padding: 20px;
  font-family: 'Arial', sans-serif;

`;

// Welcome message displayed at the top of the home page
export const WelcomeMessage = styled.p`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

// Wrapper for song details
export const SongDetails = styled.div`
  text-align: center;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  margin-bottom: 30px;
`;

// Title for the currently playing section
export const Title = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
`;

// Info related to the song, such as track name, artist, etc.
export const Info = styled.p`
  font-size: 1.2rem;
  margin: 10px 0;
  color: #444;
`;

// Album image for the currently playing song
export const AlbumImage = styled.img`
  width: 100%;
  max-width: 150px;
  border-radius: 10px;
  margin: 20px auto;
  height: 150px;
  object-fit: cover;
`;

// Container for the progress bar showing the song progress
export const ProgressContainer = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 15px;
  position: relative;
`;

// Progress bar indicating the current song position
export const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => `${progress}%`};
  height: 100%;
  background-color: #4caf50;
  transition: width 0.5s ease;
`;

// Display time related to song progress
export const ProgressTime = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin: 10px 0;
`;

// Message displayed when no song is currently playing
export const NoSongMessage = styled.p`
  font-size: 1.5rem;
  color: #888;
  text-align: center;
`;



//Recently played--------------------------------
// Section title for the recently played tracks
export const RecentlyPlayedTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

// List container for recently played tracks
export const RecentlyPlayedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
`;

// Each item in the recently played list
export const RecentlyPlayedItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`;

// Album image for the recently played song
export const RecentlyPlayedImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  margin-right: 15px;
  flex-shrink: 0; 
`;

// General information text for recently played tracks
export const RecentlyPlayedInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start; 
  flex: 1; 
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #444;
    text-align: left;
  }

  p strong {
    font-weight: bold;
    color: #333;
  }
`;

// Example styles (add these to your existing styles)
export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

export const Button = styled.button`
  padding: 10px 15px;
  font-size: 16px;
  color: #fff;
  background-color: #1db954; 
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1ed760;
  }
`;

export const PlayingNowLabel = styled.p`
  font-size: 0.7rem;
  color: #1db954;
  margin-bottom: 5px;
`;

export const GifImage = styled.img`
  width: 60px;
  height: 60px;
  margin-left: 15px;
  object-fit: cover;
`;



