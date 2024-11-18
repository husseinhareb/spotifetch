import styled, { keyframes,css } from 'styled-components';

//TopArtists------------------------


// Animation keyframe for fading in/out
export const fadeInOut = keyframes`
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

// Styles for the artist image with animation applied if the `isSwapping` prop is true
export const ArtistImage = styled.img<{ isSwapping?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  ${({ isSwapping }) =>
    isSwapping &&
    css`
      animation: ${fadeInOut} 0.5s ease-in-out;
    `}
`;

// Container for the entire Top Artists component
export const TopArtistsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
`;

// Wrapper for all artists
export const ArtistsWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
`;

// Container for the top artist
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
`;

// Container for other artist cards
export const OtherArtists = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

// Styles for individual artist cards
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
`;

// Title for the component
export const SecondTitle = styled.h1`
  text-align: center;
`;

// Wrapper for images to control relative positioning
export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; 
  overflow: hidden;
`;

// Animation keyframes for sliding in from the left
export const slideInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Updated ArtistNameOverlay with aligned text, word animation, and thinner grey outline
export const ArtistNameOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  text-align: left;
  font-weight: bold;
  font-size: 40px;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  pointer-events: none;
  z-index: 1;

  // Adding text shadow to create a thinner grey outline effect
  text-shadow: 1px 1px 0px rgba(128, 128, 128, 0.7),   
               -1px -1px 0px rgba(128, 128, 128, 0.7),
               1px -1px 0px rgba(128, 128, 128, 0.7),
               -1px 1px 0px rgba(128, 128, 128, 0.7);

  div {
    opacity: 0;
    animation: ${slideInFromLeft} 0.5s ease forwards;
  }
`;


interface MoreInfoTextProps {
  src: string | null;
}

export const MoreInfoText = styled.div<MoreInfoTextProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
  white-space: normal;
  padding: 10px;
  text-overflow: ellipsis;

  // Create a blurred background image using ::before
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
    background-size: cover;
    background-position: center;
    filter: blur(10px); 
    z-index: -1;  
  }

  background-color: rgba(0, 0, 0, 0.8); 
`;


export const BioOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); // Semi-transparent background
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  padding: 10px;
  text-align: center;
  transition: opacity 0.3s;
`;

