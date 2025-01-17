import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArtistDetailsContainer,
  ArtistImage,
  TrackList,
  TrackItem,
  ImageGallery,
  GalleryImage,
} from './Styles/style';

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [lastFmImages, setLastFmImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch artist info and Last.fm images
  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/artist_info/${artistId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setArtistInfo(data);
          return data.artist_info.artist_name;  // Return artist name for Last.fm fetch
        } else {
          console.error('Failed to fetch artist info:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching artist info', error);
      }
    };

    const fetchLastFmImages = async (artistName: string) => {
      try {
        const response = await fetch(`http://localhost:8000/auth/artist_images/${artistName}`);
        if (response.ok) {
          const data = await response.json();
          setLastFmImages(data.images);
        } else {
          console.error('Failed to fetch Last.fm images:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching Last.fm images', error);
      } finally {
        setLoading(false);
      }
    };

    const loadArtistData = async () => {
      const artistName = await fetchArtistInfo();
      if (artistName) {
        fetchLastFmImages(artistName);
      }
    };

    loadArtistData();
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
      <ArtistImage src={artistInfo.artist_info.images[0] || "https://via.placeholder.com/150"} alt={artistInfo.artist_info.artist_name} />
      <p>{artistInfo.artist_info.genres.join(', ')}</p>
      <p>Popularity: {artistInfo.artist_info.popularity}</p>
      <p>Description: {artistInfo.artist_info.description}</p>

      {/* Gallery of images */}
      <h2>Gallery</h2>
      <ImageGallery>
        {(lastFmImages.length ? lastFmImages : ["https://via.placeholder.com/150"]).map((imageUrl, index) => (
          <GalleryImage key={index} src={imageUrl} alt={`Image of ${artistInfo.artist_info.artist_name} ${index + 1}`} />
        ))}
      </ImageGallery>

      {/* Display Top Tracks */}
      <h2>Top Tracks</h2>
      <TrackList>
        {artistInfo.top_tracks.map((track: any) => (
          <TrackItem key={track.external_url}>
            <p>{track.track_name} - {track.album_name}</p>
            <img src={track.album_image || "https://via.placeholder.com/150"} alt={track.album_name} />
          </TrackItem>
        ))}
      </TrackList>
    </ArtistDetailsContainer>
  );
};

export default ArtistPage;
