import React from 'react';
import { useCountry, useEmail, useProduct, useProfileImage } from '../../services/store';
import { ProfileContainer, ProfileImage, ProfileInfo } from './Styles/style';


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
