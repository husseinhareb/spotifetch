import React, { useEffect, useState } from 'react';

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
        <div>
            <h1>Top Artists</h1>
            <ul>
                {artistNames.map((name, index) => (
                    <p key={index}>
                        <img src={artistImages[index]} alt={name}  />
                    </p>
                ))}
            </ul>
            <div>

            </div>
        </div>
    );
};

export default TopArtists;
