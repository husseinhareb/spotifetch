// Navbar/Styles/style.ts
import styled from "styled-components";

// Styled components for consistent layout
export const Nav = styled.nav`
  background-color: #1db954;
  display: flex;
  height:41px;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.div`
  color: white;
  background-color: red;
`;

export const NavList = styled.ul`
  list-style: none;
  display: flex;
  background-color: red;
  align-items: center;
`;

export const NavItem = styled.li`
  display: flex;
  align-items: center;
`;

// Unified NavButton for all navigation interactions
export const NavButton = styled.button`
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;

  &:hover {
    text-decoration: underline;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Styled component for the profile picture
export const ProfileThumbnail = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 0.5rem;
`;
