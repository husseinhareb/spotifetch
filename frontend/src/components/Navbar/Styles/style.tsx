import styled from "styled-components";

// Navbar container
export const Nav = styled.nav`
  background-color: #1db954;
  display: flex;
  justify-content: space-between;
  align-items: center; /* Vertically centers everything inside */
  padding: 0 20px;
  height: 50px; /* Increased the height slightly for better vertical alignment */
`;

// Title container
export const Title = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

// Navigation list for horizontal items
export const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center; /* Vertically centers list items */
`;

// Each nav item (li) container
export const NavItem = styled.li`
  margin-left: 20px;
  display: flex;
  align-items: center; /* Ensure vertical alignment inside the item */
`;

// Button used for all navigation actions
export const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center; /* Center content vertically */
  justify-content: center;
  padding: 0;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    text-decoration: underline;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Styled profile thumbnail
export const ProfileThumbnail = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 0.5rem;
  display: inline-block; /* Ensures inline-block so it aligns with the text */
  vertical-align: middle; /* Vertically align with the surrounding text */
`;
