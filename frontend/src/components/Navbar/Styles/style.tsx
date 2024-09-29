// Navbar/Styles/style.ts
import styled from "styled-components";

// Styled components
export const Nav = styled.nav`
  background-color: #1db954; 
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
  align-items: center;
`;

export const NavItem = styled.li`
  margin-left: 1rem;
  display: flex;
  align-items: center;
`;

export const NavLink = styled.a`
  color: white;
  text-decoration: none;
  display: inline-flex; 
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  line-height: 1; 
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem; 
  line-height: 1;
  font-size: 1rem; 
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const ProfileThumbnail = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 0.5rem;
  `;
