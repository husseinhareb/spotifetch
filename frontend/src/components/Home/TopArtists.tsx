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
  ArtistNameOverlay,
  MoreInfoText,
} from './Styles/style';

const TopArtists: React.FC = () => {
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);
  const [artistBio, setArtistBio] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  // State to track the selected time range
  const [timeRange, setTimeRange] = useState<string>('medium_term');

  // Fetching artists based on timeRange
  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const response = await fetch(`http://localhost:8000/top_artists?time_range=${timeRange}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const topArtists = await response.json();
          if (topArtists && topArtists.top_artists) {
            const names = topArtists.top_artists.map((artist: any) => artist.artist_name);
            const images = topArtists.top_artists.map((artist: any) => artist.image_url);
            const bios = topArtists.top_artists.map((artist: any) => artist.description);
            setArtistNames(names);
            setArtistImages(images);
            setArtistBio(bios);
          }
        } else {
          console.error('Failed to fetch top artists:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching top artists', error);
      }
    };

    fetchTopArtists();
  }, [timeRange]); // Refetch whenever timeRange changes

  const handleMouseEnter = (index: number) => {
    setIsSwapping(true);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(index);
    setHoveredImage(artistImages[index + 1]); // Set the hovered image URL here
  };

  const handleMouseLeave = () => {
    setIsSwapping(false);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(null);
    setHoveredImage(null); // Reset hovered image URL
  };

  const trimBioText = (text: string) => {
    const words = text.split(' ');
    const MAX_WORDS = 19;
    if (words.length > MAX_WORDS) {
      return `${words.slice(0, MAX_WORDS - 3).join(' ')}... Click to read more`;
    }
    return text;
  };

  return (
    <TopArtistsContainer>
      <SecondTitle>Top Artists</SecondTitle>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="time-range-select">Select Time Range: </label>
        <select
          id="time-range-select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="short_term">Last 4 Weeks</option>
          <option value="medium_term">Last 6 Months</option>
          <option value="long_term">All Time</option>
        </select>
      </div>

      <ArtistsWrapper>
        {artistNames.length > 0 && (
          <>
            {/* Main Top Artist Section */}
            <TopArtist>
              <ImageWrapper>
                <ArtistImage
                  src={
                    hoveredIndex !== null && hoveredIndex + 1 < artistImages.length
                      ? artistImages[hoveredIndex + 1]
                      : artistImages[0]
                  }
                  alt={
                    hoveredIndex !== null && hoveredIndex + 1 < artistNames.length
                      ? artistNames[hoveredIndex + 1]
                      : artistNames[0]
                  }
                  isSwapping={isSwapping}
                  key={hoveredIndex !== null ? `top-${hoveredIndex}` : 'top-default'}
                />
                <ArtistNameOverlay key={hoveredIndex !== null ? `artist-name-${hoveredIndex}` : 'artist-name-default'}>
                  {(hoveredIndex !== null && hoveredIndex + 1 < artistNames.length ? artistNames[hoveredIndex + 1] : artistNames[0])
                    .split(' ')
                    .map((word, index) => (
                      <div key={index} style={{ animationDelay: `${index * 0.3}s` }}>
                        {word}
                      </div>
                    ))}
                </ArtistNameOverlay>
              </ImageWrapper>
            </TopArtist>

            {/* Other Artists Section */}
            <OtherArtists>
              {artistNames.slice(1, 5).map((name, index) => (
                <ArtistCard
                  key={index}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  style={{ position: 'relative', height: '200px' }}
                >
                  <ImageWrapper>
                    {hoveredIndex === index ? (
                      <MoreInfoText src={hoveredImage}>
                        {trimBioText(artistBio[index + 1])}
                      </MoreInfoText>
                    ) : (
                      <ArtistImage
                        src={artistImages[index + 1]}
                        alt={name}
                        isSwapping={hoveredIndex === index || prevHoveredIndex === index}
                        key={hoveredIndex === index ? `hovered-${index}` : `other-${index}`}
                      />
                    )}
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
