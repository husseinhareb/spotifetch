import React, { useEffect, useState } from 'react';

const TopArtists: React.FC = () => {
    const [artistNames, setArtistNames] = useState<string[]>([]); // Changed to an array
    const [artistPopularity, setArtistPopularity] = useState<number[]>([]); // To store popularity as an array
    const [artistImages, setArtistImages] = useState<string[]>([]); // To store images as an array

    useEffect(() => {
        const fetchTopArtists = async () => {
            try {
                const response = await fetch("http://localhost:8000/top_artists", {
                    credentials: "include",
                });
                if (response.ok) {
                    const topArtists = await response.json();
                    const names = topArtists.top_artists.map((artist: any) => artist.artist_name);
                    const popularities = topArtists.top_artists.map((artist: any) => artist.popularity);
                    const images = topArtists.top_artists.map((artist: any) => artist.image);

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
                    <li key={index}>
                        <img src={artistImages[index]} alt={name} width={50} />
                        {name} - Popularity: {artistPopularity[index]}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopArtists;
