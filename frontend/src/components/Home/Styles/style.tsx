import styled, { keyframes } from 'styled-components';

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


//------------------------

const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const ArtistImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease-in-out; /* Smooth transition */

  &.swap {
    animation: ${fadeInOut} 0.8s ease-in-out; /* Apply animation when class 'swap' is active */
  }
`;

export const TopArtistsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
`;

export const ArtistsWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
`;

export const TopArtist = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    text-align: center;
  }
`;

export const OtherArtists = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const ArtistCard = styled.div`
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    text-align: center;
  }
`;

export const SecondTitle = styled.h1`
  text-align: center;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Makes the wrapper a perfect square */
  overflow: hidden;

  &:hover {
    div {
      opacity: 1;
    }
  }
`;



// Artist Name overlay that appears on hover of the swapped image
export const ArtistName = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  font-size: 14px;
  pointer-events: none;

  /* Only show the artist name when the wrapper is hovered */
  ${ImageWrapper}:hover & {
    opacity: 1;
  }
`;

export const ArtistNameOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  transition: opacity 0.3s ease-in-out;
  font-size: 1rem;
  pointer-events: none;

  z-index: 1;
`;
//--------------------------------


// Section title for the recently played tracks
export const RecentlyPlayedTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
`;

// List container for recently played tracks
export const RecentlyPlayedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  width: 100%;
`;

// Each item in the recently played list
export const RecentlyPlayedItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);  // Slightly increase the scale on hover for better UX
  }
`;

// Album image for the recently played song
export const RecentlyPlayedImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
`;

// General information text for recently played tracks
export const RecentlyPlayedInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  p {
    margin: 0;
    font-size: 1rem;
    color: #444;
  }

  p strong {
    font-weight: bold;
    color: #333;
  }
`;

