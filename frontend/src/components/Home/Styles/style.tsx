import styled, { keyframes } from 'styled-components';

// Styled components for enhanced design
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
  height: 500px;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

export const WelcomeMessage = styled.p`
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
`;

export const SongDetails = styled.div`
  text-align: center;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

export const Title = styled.h2`
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
`;

export const Info = styled.p`
  font-size: 1.2rem;
  margin: 10px 0;
`;

export const AlbumImage = styled.img`
  width: 100%;
  max-width: 300px;
  border-radius: 10px;
  margin: 20px 0;
  height: 100px;
  width: 100px;
`;

export const ProgressContainer = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 15px;
  position: relative;
`;

export const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => `${progress}%`};
  height: 100%;
  background-color: #4caf50;
  transition: width 0.5s ease;
`;

export const ProgressTime = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin: 10px 0;
`;

export const NoSongMessage = styled.p`
  font-size: 1.5rem;
  color: #888;
`;
