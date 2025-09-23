// src/Styles/ArtistPageStyles.ts

import styled from 'styled-components';

// Dark themed container to match Home
export const ArtistDetailsContainer = styled.div`
  padding: 28px 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: #e6eef0;
`;

// Header with image and meta side-by-side on larger screens
export const ArtistHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  margin-bottom: 28px;

  @media (min-width: 900px) {
    grid-template-columns: 360px 1fr;
    max-width: 1100px;
    margin: 0 auto 28px auto;
    text-align: left;
  }
`;

export const ArtistMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h1 {
    font-size: 2.25rem;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 6px 24px rgba(29,185,84,0.06);
  }

  .genres {
    color: #a7bdb4;
    font-size: 0.95rem;
  }

  .popularity {
    font-size: 0.95rem;
    color: #9aa9a0;
  }
`;

// Styling for the artist image
export const ArtistImage = styled.img`
  width: 100%;
  height: 360px;
  max-width: 360px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 0;
  box-shadow: 0 12px 40px rgba(2,6,23,0.6), inset 0 -6px 24px rgba(29,185,84,0.02);
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(2,6,23,0.8), inset 0 -8px 28px rgba(29,185,84,0.04);
  }
`;

// Container for the track list
export const TrackList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 18px 0;
`;

// Styling for each track item
export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  transition: background 160ms ease, transform 160ms ease;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));

  &:not(:last-child) {
    margin-bottom: 10px;
  }

  &:hover {
    transform: translateY(-4px);
    background: linear-gradient(90deg, rgba(29,185,84,0.06), rgba(255,255,255,0.02));
  }

  .track-thumb {
    flex: 0 0 56px;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 8px 28px rgba(2,6,23,0.6);
  }

  .track-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #e6eef0;
  }

  .track-title {
    font-weight: 700;
    font-size: 1rem;
  }

  .track-album {
    font-size: 0.9rem;
    color: #9aa9a0;
  }
`;

export const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin: 14px 0 28px 0;
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 12px 36px rgba(2,6,23,0.6);
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 28px 60px rgba(2,6,23,0.8);
  }
`;

export const DescriptionCard = styled.div`
  background: linear-gradient(180deg, rgba(29,185,84,0.03), rgba(255,255,255,0.01));
  border: 1px solid rgba(29,185,84,0.06);
  border-radius: 12px;
  padding: 14px 16px;
  color: #cfe9db;
  box-shadow: 0 8px 28px rgba(2,6,23,0.5);
  font-size: 1rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin: 18px 0 10px 0;
  color: #e8fff4;
`;
