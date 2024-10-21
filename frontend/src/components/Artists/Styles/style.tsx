// src/Styles/ArtistPageStyles.ts

import styled from 'styled-components';

// Container for the entire artist details section
export const ArtistDetailsContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #333;
  }

  p {
    font-size: 1.2rem;
    margin: 5px 0;
    color: #666;
  }
`;

// Styling for the artist image
export const ArtistImage = styled.img`
  width: 100%;
  height: auto;
  max-width: 300px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Container for the track list
export const TrackList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 20px 0;
`;

// Styling for each track item
export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  p {
    margin: 0;
    color: #333;
    font-weight: bold;
  }

  img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    margin-left: 10px;
  }
`;
