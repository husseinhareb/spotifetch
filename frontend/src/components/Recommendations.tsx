import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recommendations: React.FC = () => {
    const [songs, setSongs] = useState<string[]>([]);

    useEffect(() => {
        axios.get<string[]>('http://localhost:8000/recommend')
            .then(response => {
                setSongs(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the recommendations!", error);
            });
    }, []);

    return (
        <div>
            <h2>Recommended Songs</h2>
            <ul>
                {songs.map((song, index) => (
                    <li key={index}>{song}</li>
                ))}
            </ul>
        </div>
    );
}

export default Recommendations;
