import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
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
  BioOverlay,
} from './Styles/style';

const TopArtists: React.FC = () => {
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const [artistImages, setArtistImages] = useState<string[]>([]);
  const [artistBio, setArtistBio] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cachedData, setCachedData] = useState<any>({});
  
  const [timeRange, setTimeRange] = useState<string>('medium_term');
  const [isTopArtistHovered, setIsTopArtistHovered] = useState<boolean>(false);

  useEffect(() => {
    const fetchTopArtists = async () => {
      if (cachedData[timeRange]) {
        const { names, images, bios } = cachedData[timeRange];
        setArtistNames(names);
        setArtistImages(images);
        setArtistBio(bios);
        return;
      }

      setLoading(true);

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

            setCachedData((prevCache: any) => ({
              ...prevCache,
              [timeRange]: { names, images, bios },
            }));

            setArtistNames(names);
            setArtistImages(images);
            setArtistBio(bios);
          }
        } else {
          console.error('Failed to fetch top artists:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching top artists', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, [timeRange, cachedData]);

  const handleMouseEnter = (index: number) => {
    setIsSwapping(true);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(index);
    setHoveredImage(artistImages[index + 1]);
  };

  const handleMouseLeave = () => {
    setIsSwapping(false);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(null);
    setHoveredImage(null);
  };

  const handleTopArtistMouseEnter = () => {
    setIsTopArtistHovered(true);
  };

  const handleTopArtistMouseLeave = () => {
    setIsTopArtistHovered(false);
  };

  // Trim text and include a clickable link for full artist bio
  const trimBioText = (text: string, artistName: string) => {
    const words = text.split(' ');
    const MAX_WORDS = 19;
    if (words.length > MAX_WORDS) {
      return (
        <>
          {`${words.slice(0, MAX_WORDS - 3).join(' ')}... `}
          <Link to={`/artist/${encodeURIComponent(artistName)}`} style={{ color: '#007bff', textDecoration: 'underline' }}>
            Click to read more
          </Link>
        </>
      );
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ArtistsWrapper>
          {artistNames.length > 0 && (
            <>
              {/* Main Top Artist Section */}
              <TopArtist 
                onMouseEnter={handleTopArtistMouseEnter} 
                onMouseLeave={handleTopArtistMouseLeave}
              >
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
                    style={{
                      filter: isTopArtistHovered ? 'blur(10px)' : 'none',
                    }}
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
                  {isTopArtistHovered && (
                    <BioOverlay>
                      {trimBioText(artistBio[0], artistNames[0])} {/* Pass the artist name to trimBioText */}
                    </BioOverlay>
                  )}
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
                          {trimBioText(artistBio[index + 1], name)} {/* Pass artist name to trimBioText */}
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
      )}
    </TopArtistsContainer>
  );
};

export default TopArtists;
