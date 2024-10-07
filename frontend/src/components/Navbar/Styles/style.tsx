import styled from "styled-components";

// Styled Nav container with consistent alignment
export const Nav = styled.nav`
  background-color: #1db954;
  display: flex;
  height: 41px;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px; /* Add padding to provide some space */
`;

// Title container with white text
export const Title = styled.div`
  color: white;
`;

// Navigation list with horizontal layout
export const NavList = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

// Each item in the navigation bar
export const NavItem = styled.li`
  display: flex;
  align-items: center;
  margin-left: 20px; /* Space between items */
`;

// Styled button for navigation interactions
export const NavButton = styled.button`
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  height: 100%; /* Ensure button fills the height of the navbar */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;

  &:hover {
    text-decoration: underline;
    background-color: rgba(255, 255, 255, 0.1); /* Subtle hover effect */
  }
`;

// Styled component for profile picture
export const ProfileThumbnail = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 0.5rem;
`;
