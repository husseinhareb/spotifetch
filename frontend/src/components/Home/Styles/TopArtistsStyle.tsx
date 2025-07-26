import styled, { keyframes, css } from 'styled-components';

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

// Container for the entire Top Artists component
export const TopArtistsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
`;

// Title for the component with responsive font-size
export const SecondTitle = styled.h1`
  text-align: center;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin-bottom: 1rem;
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

// Wrapper for images to control relative positioning
export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; 
  overflow: hidden;
`;

// Responsive Artist image with swap animation
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

// Overlay for the artist name with responsive font-size
export const ArtistNameOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  text-align: left;
  font-weight: bold;
  font-size: clamp(1.5rem, 5vw, 3rem);
  color: #fff;
  padding: 0.25em 0.5em;
  border-radius: 5px;
  pointer-events: none;
  z-index: 1;

  /* Thinner grey outline via text-shadow */
  text-shadow:
    1px 1px 0 rgba(128,128,128,0.7),
    -1px -1px 0 rgba(128,128,128,0.7),
    1px -1px 0 rgba(128,128,128,0.7),
    -1px 1px 0 rgba(128,128,128,0.7);

  div {
    opacity: 0;
    animation: ${slideInFromLeft} 0.5s ease forwards;
  }
`;

// Overlay for bios on hover, with responsive font-size
export const BioOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  padding: 1rem;
  text-align: center;
  transition: opacity 0.3s;
`;

// "More info" text overlay with blurred backdrop and responsive font
interface MoreInfoTextProps {
  src: string | null;
}

export const MoreInfoText = styled.div<MoreInfoTextProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: inline-block;
  max-width: 80%;       
  padding: 0.5rem;

  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.4;
  text-align: center;

  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;

  color: #fff;
  cursor: pointer;

  /* keep the blurred full-image backdrop */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
    background-size: cover;
    background-position: center;
    filter: blur(10px);
    z-index: -1;
  }

  /* dark overlay */
  background-color: rgba(0, 0, 0, 0.8);
`;
