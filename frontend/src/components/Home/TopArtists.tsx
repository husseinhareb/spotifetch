import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
}

const TopArtists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cachedData, setCachedData] = useState<any>({});
  const [timeRange, setTimeRange] = useState<string>('medium_term');
  const [isTopArtistHovered, setIsTopArtistHovered] = useState<boolean>(false);

  // Fetch artists
  useEffect(() => {
    const fetchTopArtists = async () => {
      if (cachedData[timeRange]) {
        setArtists(cachedData[timeRange]);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8000/top_artists?time_range=${timeRange}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const topArtistsData = await response.json();
          if (topArtistsData && topArtistsData.top_artists) {
            const artists = topArtistsData.top_artists.map((artist: any) => ({
              id: artist.artist_id,
              name: artist.artist_name,
              image: artist.image_url,
              bio: artist.description,
            }));

            setCachedData((prevCache: any) => ({
              ...prevCache,
              [timeRange]: artists,
            }));
            setArtists(artists);
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
    setHoveredImage(artists[index + 1]?.image || null);
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

// Updated trimBioText function
const trimBioText = (text: string, artistId: string) => {
  const words = text.split(' ');
  const MAX_WORDS = 19;

  // Create a single HTML string with the "Click to read more" link embedded
  if (words.length > MAX_WORDS) {
    const shortenedText = `${words.slice(0, MAX_WORDS - 3).join(' ')}... `;
    const fullTextWithLink = `${shortenedText}<a href="/artist/${encodeURIComponent(artistId)}" style="color: #007bff; text-decoration: underline;">Click to read more</a>`;
    return <span dangerouslySetInnerHTML={{ __html: fullTextWithLink }} />;
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
          {artists.length > 0 && (
            <>
              <TopArtist 
                onMouseEnter={handleTopArtistMouseEnter} 
                onMouseLeave={handleTopArtistMouseLeave}
              >
                <ImageWrapper>
                  <ArtistImage
                    src={
                      hoveredIndex !== null && hoveredIndex + 1 < artists.length
                        ? artists[hoveredIndex + 1].image
                        : artists[0].image
                    }
                    alt={
                      hoveredIndex !== null && hoveredIndex + 1 < artists.length
                        ? artists[hoveredIndex + 1].name
                        : artists[0].name
                    }
                    isSwapping={isSwapping}
                    style={{
                      filter: isTopArtistHovered ? 'blur(10px)' : 'none',
                    }}
                    key={hoveredIndex !== null ? `top-${hoveredIndex}` : 'top-default'}
                  />
                  <ArtistNameOverlay key={hoveredIndex !== null ? `artist-name-${hoveredIndex}` : 'artist-name-default'}>
                    {(hoveredIndex !== null && hoveredIndex + 1 < artists.length ? artists[hoveredIndex + 1].name : artists[0].name)
                      .split(' ')
                      .map((word, index) => (
                        <div key={index} style={{ animationDelay: `${index * 0.3}s` }}>
                          {word}
                        </div>
                      ))}
                  </ArtistNameOverlay>
                  {isTopArtistHovered && (
                    <BioOverlay>
                      {trimBioText(artists[0].bio, artists[0].id)}
                    </BioOverlay>
                  )}
                </ImageWrapper>
              </TopArtist>

              <OtherArtists>
                {artists.slice(1, 5).map((artist, index) => (
                  <ArtistCard
                    key={index}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    style={{ position: 'relative', height: '200px' }}
                  >
                    <ImageWrapper>
                      {hoveredIndex === index ? (
                        <MoreInfoText src={hoveredImage}>
                          {trimBioText(artist.bio, artist.id)}
                        </MoreInfoText>
                      ) : (
                        <ArtistImage
                          src={artist.image}
                          alt={artist.name}
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
