// Navbar/Styles/style.ts
import styled from "styled-components";

// Styled components for consistent layout
export const Nav = styled.nav`
  background-color: #1db954; /* Updated to match Spotify's theme */
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.div`
  font-size: 1.5rem;
  color: white;
`;

export const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  align-items: center; /* Ensure all nav items align vertically */
`;

export const NavItem = styled.li`
  margin-left: 1rem;
  display: flex;
  align-items: center; /* Ensure items align vertically */
`;

// Unified NavButton for all navigation interactions
export const NavButton = styled.button`
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1;
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
  margin-right: 0.5rem; /* Adds spacing between image and username */
`;
