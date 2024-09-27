import React from 'react';
import { useCountry, useEmail, useProduct, useProfileImage } from '../../services/store';
import styled from 'styled-components';

// Styled components for the profile layout
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  object-fit: cover;
`;

const ProfileInfo = styled.p`
  font-size: 18px;
  color: #333;
  margin: 5px 0;
`;

const Profile: React.FC = () => {
  const email = useEmail();
  const profileImage = useProfileImage();
  const country = useCountry();
  const product = useProduct();

  return (
    <ProfileContainer>
      <ProfileImage
        src={profileImage || 'https://via.placeholder.com/150'}
        alt="Profile"
      />
      {email && <ProfileInfo>Email: {email}</ProfileInfo>}
      {country && <ProfileInfo>Country: {country}</ProfileInfo>}
      {product && <ProfileInfo>Product: {product}</ProfileInfo>}
    </ProfileContainer>
  );
};

export default Profile;
