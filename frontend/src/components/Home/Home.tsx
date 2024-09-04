// frontend/src/components/Home.tsx
import React from 'react';
import { useUsername, useEmail, useProfileImage, useCountry, useProduct } from '../../services/store';

const Home: React.FC = () => {
  const username = useUsername();
  const email = useEmail();
  const profileImage = useProfileImage();
  const country = useCountry();
  const product = useProduct();

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome, {username}!</p>
      {email && <p>Email: {email}</p>}
      {profileImage && <img src={profileImage} alt="Profile" />}
      {country && <p>Country: {country}</p>}
      {product && <p>Product: {product}</p>}
    </div>
  );
};

export default Home;
