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
  const [artistPopularity, setArtistPopularity] = useState<number[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch('http://localhost:8000/top_artists', {
          credentials: 'include',
        });
        if (response.ok) {
          const topArtists = await response.json();
          const names = topArtists.top_artists.map((artist: any) => artist.artist_name);
          const popularities = topArtists.top_artists.map((artist: any) => artist.popularity);
          const images = topArtists.top_artists.map((artist: any) => artist.image_url);

          setArtistNames(names);
          setArtistPopularity(popularities);
          setArtistImages(images);
        }
      } catch (error) {
        console.error('Error fetching top artists', error);
      }
    };

    fetchTopArtists();
  }, []);

  return (
    <TopArtistsContainer>
      <SecondTitle>Top Artists</SecondTitle>
      <ArtistsWrapper>
        {artistNames.length > 0 && (
          <>
            <TopArtist>
              <ImageWrapper>
                <ArtistImage src={artistImages[0]} alt={artistNames[0]} />
              </ImageWrapper>
              {/* <p>{artistNames[0]}</p> */}
            </TopArtist>
            <OtherArtists>
              {artistNames.slice(1, 5).map((name, index) => (
                <ArtistCard key={index}>
                  <ImageWrapper>
                    <ArtistImage src={artistImages[index + 1]} alt={name} />
                  </ImageWrapper>
                  {/* <p>{name}</p> */}
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
