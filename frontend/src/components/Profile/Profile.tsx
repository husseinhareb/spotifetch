// frontend/src/pages/Profile.tsx
import React from 'react';
import { useCountry, useEmail, useProduct, useProfileImage } from '../../services/store';

const Profile: React.FC = () => {

  const email = useEmail();
  const profileImage = useProfileImage();
  const country = useCountry();
  const product = useProduct();
  return (<h1>
    {email && <p>Email: {email}</p>}
    {profileImage && <img src={profileImage} alt="Profile" />}
    {country && <p>Country: {country}</p>}
    {product && <p>Product: {product}</p>}</h1>
  );
};

export default Profile;
