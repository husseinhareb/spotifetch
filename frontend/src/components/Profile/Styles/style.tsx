import styled from 'styled-components';

// Styled components for the profile layout
export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: ${({ theme }) => theme.colors.backgroundSolid};
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
  color: ${({ theme }) => theme.colors.text};
  margin: 5px 0;
`;

export const SettingsPanel = styled.div`
  margin-top: 20px;
  width: 100%;
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.backgroundSolid}, ${({ theme }) => theme.colors.background});
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const Label = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Control = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Select = styled.select`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
`;

export const Toggle = styled.button`
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.backgroundSolid};
  color: ${({ theme }) => theme.colors.text};
`;
