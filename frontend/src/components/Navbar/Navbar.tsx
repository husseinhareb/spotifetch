import React from 'react';
import { Nav,
  Title,
  NavList,
  NavItem,
  NavLink

 } from './Styles/style';
// Navbar component
const Navbar: React.FC = () => {
  return (
    <Nav>
      <Title>
        <NavLink href="/">Spotifetch</NavLink>
      </Title>
      <NavList>
        <NavItem>
          <NavLink href="/">Home</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/about">About</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/profile">Profile</NavLink>
        </NavItem>
      </NavList>
    </Nav>
  );
};

export default Navbar;
