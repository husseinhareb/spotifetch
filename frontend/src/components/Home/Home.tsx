// frontend/src/components/Home.tsx
import React from 'react';
import { useUsername } from '../../services/store';

const Home: React.FC = () => {
  const username = useUsername(); 

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome, {username}!</p> 
    </div>
  );
};

export default Home;
