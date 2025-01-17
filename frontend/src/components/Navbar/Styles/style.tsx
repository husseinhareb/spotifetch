import styled from "styled-components";

// Navbar container
export const Nav = styled.nav`
  background-color: #1db954;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;
export const ContentWrapper = styled.div`
  margin-top: 50px;
`;
// Title container
export const Title = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

// Navigation list for desktop and mobile views
export const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
    flex-direction: column;
    background-color: #1db954;
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    padding: 20px;
  }

  &.active {
    display: flex;
  }
`;

// Each nav item (li) container
export const NavItem = styled.li`
  margin-left: 20px;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 15px;
  }
`;

// Button used for all navigation actions
export const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
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
`;

// Hamburger icon for mobile view
export const HamburgerIcon = styled.div`
  display: none;
  cursor: pointer;
  color: white;
  font-size: 24px;

  @media (max-width: 768px) {
    display: block;
  }
`;
