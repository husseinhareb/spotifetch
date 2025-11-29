// src/Styles/ArtistPageStyles.ts

import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Dark themed container
export const ArtistDetailsContainer = styled.div`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
  animation: ${fadeIn} 0.6s ease-out;
`;

// Hero section with large background
export const HeroSection = styled.div<{ $bgImage?: string }>`
  position: relative;
  width: 100%;
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  padding: 60px 40px 40px;
  background: ${({ $bgImage }) => 
    $bgImage 
      ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 50%, rgba(18,18,18,1) 100%), url(${$bgImage})`
      : 'linear-gradient(135deg, rgba(29,185,84,0.2) 0%, rgba(18,18,18,1) 100%)'
  };
  background-size: cover;
  background-position: center 20%;
  
  @media (max-width: 768px) {
    min-height: 400px;
    padding: 40px 20px 30px;
  }
`;

export const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
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
  gap: 12px;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;

  h1 {
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    color: #fff;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    letter-spacing: -1px;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .genres {
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .popularity {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.7);
    background: rgba(29,185,84,0.2);
    padding: 8px 16px;
    border-radius: 20px;
    width: fit-content;
    backdrop-filter: blur(10px);
    
    @media (max-width: 768px) {
      margin: 0 auto;
    }
  }
`;

export const GenreTag = styled.span`
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(29,185,84,0.3);
    border-color: rgba(29,185,84,0.5);
  }
`;

// Styling for the main artist image
export const ArtistImage = styled.img`
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.8s ease-out;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 25px 70px rgba(0,0,0,0.7);
  }
  
  @media (max-width: 768px) {
    width: 180px;
    height: 180px;
  }
`;

// Main content area
export const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

// Container for the track list
export const TrackList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Styling for each track item
export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.02);
  border: 1px solid transparent;

  &:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.08);
    transform: translateX(4px);
  }

  .track-thumb {
    flex: 0 0 56px;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }

  .track-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .track-title {
    font-weight: 600;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-album {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.6)'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-number {
    width: 24px;
    text-align: center;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.5)'};
    font-weight: 500;
  }
`;

// Gallery styles - Masonry-like layout
export const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
`;

export const GalleryImageWrapper = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  
  &:nth-child(1) {
    grid-column: span 2;
    grid-row: span 2;
    
    @media (max-width: 768px) {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 60%,
      rgba(0,0,0,0.4) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  &:hover img {
    transform: scale(1.08);
  }
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

export const DescriptionCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 24px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  line-height: 1.7;
  margin-top: 8px;
  backdrop-filter: blur(10px);
  max-width: 600px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.1), transparent);
  }
`;

export const Section = styled.section`
  margin-bottom: 48px;
`;

// Stats row
export const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    justify-content: center;
    gap: 24px;
  }
`;

export const StatItem = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

// Loading states
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.6)'};
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(29,185,84,0.2);
  border-radius: 50%;
  border-top-color: #1DB954;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Empty gallery state
export const EmptyGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,0.1);
  color: ${({ theme }) => theme.colors.textSecondary || 'rgba(255,255,255,0.5)'};
  
  svg {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

// Lightbox for full-screen image view
export const Lightbox = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.95);
  backdrop-filter: blur(20px);
  cursor: zoom-out;
  animation: ${fadeIn} 0.3s ease;
  
  img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
`;

export const LightboxClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
  }
`;

export const LightboxNav = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => $direction === 'prev' ? 'left: 20px;' : 'right: 20px;'}
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(29,185,84,0.4);
    transform: translateY(-50%) scale(1.1);
  }
`;
