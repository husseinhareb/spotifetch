import React, { useEffect, useState } from 'react';
import {
  ArtistCard,
  ArtistsWrapper,
  OtherArtists,
  SecondTitle,
  TopArtist,
  TopArtistsContainer,
  ImageWrapper,
  ArtistImage,
  ArtistNameOverlay, // New import for the artist name overlay style
} from './Styles/style';

const TopArtists: React.FC = () => {
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0); // New state for triggering animation

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch('http://localhost:8000/top_artists', {
          credentials: 'include',
        });
        if (response.ok) {
          const topArtists = await response.json();
          const names = topArtists.top_artists.map((artist: any) => artist.artist_name);
          const images = topArtists.top_artists.map((artist: any) => artist.image_url);

          setArtistNames(names);
          setArtistImages(images);
        }
      } catch (error) {
        console.error('Error fetching top artists', error);
      }
    };

    fetchTopArtists();
  }, []);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);

    // Force class removal and re-add to retrigger animation
    const element = document.querySelector(`.artist-image-${index}`) as HTMLElement;
    if (element) {
      element.classList.remove('swap');
      void element.offsetWidth; // Trigger a reflow (forces the browser to recalculate styles)
      element.classList.add('swap');
    }

    setAnimationKey(prevKey => prevKey + 1); // Update key to retrigger animation
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setAnimationKey(prevKey => prevKey + 1); // Update key to retrigger animation
  };

  return (
    <TopArtistsContainer>
      <SecondTitle>Top Artists</SecondTitle>
      <ArtistsWrapper>
        {artistNames.length > 0 && (
          <>
            <TopArtist>
              <ImageWrapper>
                <ArtistImage
                  key={`top-artist-${animationKey}`} // Use a more unique key for proper re-render
                  src={hoveredIndex !== null ? artistImages[hoveredIndex + 1] : artistImages[0]}
                  alt={hoveredIndex !== null ? artistNames[hoveredIndex + 1] : artistNames[0]}
                  className={hoveredIndex !== null ? 'swap' : ''}
                />
                <ArtistNameOverlay>
                  {hoveredIndex !== null ? artistNames[hoveredIndex + 1] : artistNames[0]}
                </ArtistNameOverlay>
              </ImageWrapper>
            </TopArtist>
            <OtherArtists>
              {artistNames.slice(1, 5).map((name, index) => (
                <ArtistCard
                  key={index}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ImageWrapper>
                    <ArtistImage
                      key={`other-artist-${animationKey + index + 1}`} // More unique key
                      src={hoveredIndex === index ? artistImages[0] : artistImages[index + 1]}
                      alt={name}
                      className={hoveredIndex === index ? 'swap' : ''}
                    />
                  </ImageWrapper>
                </ArtistCard>
              ))}
            </OtherArtists>
          </>
        )}
      </ArtistsWrapper>
    </TopArtistsContainer>
  );
};

export default TopArtists;
