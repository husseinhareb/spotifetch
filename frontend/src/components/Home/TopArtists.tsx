import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const TopArtistsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ArtistsWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
`;

const TopArtist = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
    max-height: 300px; /* Limits height */
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    text-align: center;
  }
`;

const OtherArtists = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px;
`;

const ArtistCard = styled.div`
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
    max-height: 150px; /* Limits height */
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    text-align: center;
  }
`;

const Title = styled.h1`
  margin-bottom: 20px;
  text-align: center;
`;

const TopArtists: React.FC = () => {
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const [artistPopularity, setArtistPopularity] = useState<number[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch("http://localhost:8000/top_artists", {
          credentials: "include",
        });
        if (response.ok) {
          const topArtists = await response.json();
          console.log(topArtists);
          const names = topArtists.top_artists.map((artist: any) => artist.artist_name);
          const popularities = topArtists.top_artists.map((artist: any) => artist.popularity);
          const images = topArtists.top_artists.map((artist: any) => artist.image_url);

          setArtistNames(names);
          setArtistPopularity(popularities);
          setArtistImages(images);
        }
      } catch (error) {
        console.error("Error fetching top artists", error);
      }
    };

    fetchTopArtists();
  }, []);

  return (
    <TopArtistsContainer>
      <Title>Top Artists</Title>
      <ArtistsWrapper>
        {artistNames.length > 0 && (
          <>
            <TopArtist>
              <img src={artistImages[0]} alt={artistNames[0]} />
              <p>{artistNames[0]}</p>
            </TopArtist>
            <OtherArtists>
              {artistNames.slice(1, 5).map((name, index) => (
                <ArtistCard key={index}>
                  <img src={artistImages[index + 1]} alt={name} />
                  <p>{name}</p>
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
