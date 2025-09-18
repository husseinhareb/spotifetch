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

// Header with image and meta side-by-side on larger screens
export const ArtistHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;

  @media (min-width: 900px) {
    grid-template-columns: 320px 1fr;
    max-width: 1100px;
    margin: 0 auto 24px auto;
    text-align: left;
  }
`;

export const ArtistMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h1 {
    font-size: 2rem;
    margin: 0;
    color: #111;
  }

  .genres {
    color: #4b5563;
    font-size: 0.95rem;
  }

  .popularity {
    font-size: 0.9rem;
    color: #6b7280;
  }
`;

// Styling for the artist image
export const ArtistImage = styled.img`
  width: 100%;
  height: 300px;
  max-width: 320px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 0;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(16, 24, 40, 0.12);
  }
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
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background 150ms ease;

  &:not(:last-child) {
    margin-bottom: 10px;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.06);
  }

  .track-thumb {
    flex: 0 0 56px;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
  }

  .track-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #111827;
  }

  .track-title {
    font-weight: 600;
    font-size: 1rem;
  }

  .track-album {
    font-size: 0.9rem;
    color: #6b7280;
  }
`;

export const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin: 18px 0 28px 0;
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(2,6,23,0.08);
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 18px 40px rgba(2,6,23,0.12);
  }
`;

export const DescriptionCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 10px;
  padding: 12px 14px;
  color: #374151;
  box-shadow: 0 6px 18px rgba(16,24,40,0.04);
  font-size: 0.98rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin: 18px 0 10px 0;
  color: #111827;
`;
