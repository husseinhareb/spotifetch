import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Define the shape of user data based on the expected API response
interface User {
  display_name: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated
    axios.get<User>('http://localhost:8000/user_info', { withCredentials: true })
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/'; // This triggers the OAuth flow
  };

  const handleLogout = () => {
    // Log out by redirecting to the logout URL
    window.location.href = 'http://localhost:8000/logout';
  };

  return (
    <div className="App">
      <header className="App-header">
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div>
            <h1>Welcome, {user.display_name}</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <h1>Not Logged In</h1>
            <button onClick={handleLogin}>Login with Spotify</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
