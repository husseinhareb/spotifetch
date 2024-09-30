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
} from './Styles/style';

const TopArtists: React.FC = () => {
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
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
                  src={hoveredIndex !== null ? artistImages[hoveredIndex + 1] : artistImages[0]}
                  alt={artistNames[0]}
                />
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
                      src={hoveredIndex === index ? artistImages[0] : artistImages[index + 1]}
                      alt={name}
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
