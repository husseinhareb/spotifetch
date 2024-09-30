import styled from 'styled-components';

// Styled components for the profile layout
export const ProfileContainer = styled.div`
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

export const ProfileImage = styled.img`
  border-radius: 50%;
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  object-fit: cover;
`;

export const ProfileInfo = styled.p`
  font-size: 18px;
  color: #333;
  margin: 5px 0;
`;
