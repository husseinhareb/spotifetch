import React, { useEffect, useState } from "react";
import axios from "axios";

// Define the TypeScript type for a song
interface Song {
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  played_at: string;
}

const YourData: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recently played songs from the database
  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await axios.get<{ recent_tracks: Song[] }>(
          "http://localhost:8000/api/recently_played_db"
        );
        setRecentTracks(response.data.recent_tracks);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch recently played songs");
        setLoading(false);
      }
    };

    fetchRecentTracks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Recently Played Songs</h2>
      {recentTracks.length === 0 ? (
        <p>No recently played songs found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recentTracks.map((track, index) => (
            <li key={index} style={{ display: "flex", marginBottom: "1rem" }}>
              {track.album_image && (
                <img
                  src={track.album_image}
                  alt={`${track.track_name} album cover`}
                  style={{ width: "50px", height: "50px", marginRight: "1rem" }}
                />
              )}
              <div>
                <strong>{track.track_name}</strong> by {track.artist_name}
                <br />
                <em>{track.album_name}</em>
                <br />
                <small>Played at: {new Date(track.played_at).toLocaleString()}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YourData;
