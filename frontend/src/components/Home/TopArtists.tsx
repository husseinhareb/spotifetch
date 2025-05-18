// src/components/Home/TopArtists.tsx
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
  BioOverlay,
} from './Styles/TopArtistsStyle';
import { fetchTopArtists, Artist } from '../../repositories/artistRepository';
import { trimBioWithLink } from '../../helpers/bioUtils';

const timeRanges = [
  { value: 'short_term', label: 'Last 4 Weeks' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
];

const TopArtists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('medium_term');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTopArtists(timeRange)
      .then(setArtists)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const handleMouseEnterOther = (idx: number) => {
    setIsSwapping(true);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(idx);
  };

  const handleMouseLeaveOther = () => {
    setIsSwapping(false);
    setPrevHoveredIndex(hoveredIndex);
    setHoveredIndex(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <TopArtistsContainer>
      <SecondTitle>Top Artists</SecondTitle>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="time-range-select">Select Time Range: </label>
        <select
          id="time-range-select"
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
        >
          {timeRanges.map(tr => (
            <option key={tr.value} value={tr.value}>
              {tr.label}
            </option>
          ))}
        </select>
      </div>

      <ArtistsWrapper>
        {artists.length > 0 && (
          <>
            {/* Top artist */}
            <TopArtist
              onMouseEnter={() => setIsTopHovered(true)}
              onMouseLeave={() => setIsTopHovered(false)}
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
                />
                <ArtistNameOverlay>
                  {(
                    hoveredIndex !== null && hoveredIndex + 1 < artists.length
                      ? artists[hoveredIndex + 1].name
                      : artists[0].name
                  )
                    .split(' ')
                    .map((w, i) => (
                      <div key={i} style={{ animationDelay: `${i * 0.3}s` }}>
                        {w}
                      </div>
                    ))}
                </ArtistNameOverlay>
                {isTopHovered && (
                  <BioOverlay>
                    {trimBioWithLink(artists[0].bio, artists[0].id)}
                  </BioOverlay>
                )}
              </ImageWrapper>
            </TopArtist>

            {/* Next four artists */}
            <OtherArtists>
              {artists.slice(1, 5).map((artist, idx) => (
                <ArtistCard
                  key={artist.id}
                  onMouseEnter={() => handleMouseEnterOther(idx)}
                  onMouseLeave={handleMouseLeaveOther}
                >
                  <ImageWrapper>
                    {hoveredIndex === idx ? (
                      <BioOverlay>
                        {trimBioWithLink(artist.bio, artist.id)}
                      </BioOverlay>
                    ) : (
                      <ArtistImage
                        src={artist.image}
                        alt={artist.name}
                        isSwapping={
                          hoveredIndex === idx || prevHoveredIndex === idx
                        }
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
