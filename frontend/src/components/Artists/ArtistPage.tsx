// src/ArtistPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArtistDetailsContainer, ArtistImage, TrackList, TrackItem } from './Styles/style';

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/artist_info/${artistId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setArtistInfo(data);
        } else {
          console.error('Failed to fetch artist info:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching artist info', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistInfo();
  }, [artistId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!artistInfo) {
    return <p>No artist information found.</p>;
  }

  return (
    <ArtistDetailsContainer>
      <h1>{artistInfo.artist_info.artist_name}</h1>
      <ArtistImage src={artistInfo.artist_info.image_url} alt={artistInfo.artist_info.artist_name} />
      <p>{artistInfo.artist_info.genres.join(', ')}</p>
      <p>{artistInfo.artist_info.popularity}</p>

      <h2>Top Tracks</h2>
      <TrackList>
        {artistInfo.top_tracks.map((track: any) => (
          <TrackItem key={track.external_url}>
            <p>{track.track_name} - {track.album_name}</p>
            <img src={track.album_image} alt={track.album_name} />
          </TrackItem>
        ))}
      </TrackList>
    </ArtistDetailsContainer>
  );
};

export default ArtistPage;
