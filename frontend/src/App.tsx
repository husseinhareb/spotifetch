import React, { useEffect, useState } from 'react';

function App() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Fetch user details from your backend after successful login
        async function fetchUsername() {
            const response = await fetch('http://yourdomain.com/spotify/callback');
            const data = await response.json();
            setUsername(data.username);
        }

        fetchUsername();
    }, []);

    return (
        <div>
            {username ? (
                <p>Welcome, {username}!</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default App;
