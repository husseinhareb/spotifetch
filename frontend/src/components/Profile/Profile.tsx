import React from 'react';
import { useCountry, useEmail, useProduct, useProfileImage, useTheme, useLanguage, useSetTheme, useSetLanguage } from '../../services/store';
import { ProfileContainer, ProfileImage, ProfileInfo, SettingsPanel, SettingsRow, Label, Control, Select, Toggle } from './Styles/style';


const Profile: React.FC = () => {
  const email = useEmail();
  const profileImage = useProfileImage();
  const country = useCountry();
  const product = useProduct();
  const theme = useTheme();
  const language = useLanguage();
  const setTheme = useSetTheme();
  const setLanguage = useSetLanguage();

  return (
    <ProfileContainer>
      <ProfileImage
        src={profileImage || 'https://via.placeholder.com/150'}
        alt="Profile"
      />
      {email && <ProfileInfo>Email: {email}</ProfileInfo>}
      {country && <ProfileInfo>Country: {country}</ProfileInfo>}
      {product && <ProfileInfo>Product: {product}</ProfileInfo>}
      <SettingsPanel>
        <SettingsRow>
          <Label>Theme</Label>
          <Control>
            <Toggle onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Toggle>
          </Control>
        </SettingsRow>

        <SettingsRow>
          <Label>Language</Label>
          <Control>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </Select>
          </Control>
        </SettingsRow>
      </SettingsPanel>
    </ProfileContainer>
  );
};

export default Profile;
