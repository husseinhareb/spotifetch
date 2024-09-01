import React, { useEffect, useState } from 'react';
import {
  Nav,
  Title,
  NavList,
  NavItem,
  NavLink
} from './Styles/style';

// Navbar component
const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in when component mounts
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/user_info', {
        credentials: 'include', // This ensures cookies are included
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included in the request
      });

      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

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
        {isLoggedIn ? (
          <NavItem>
            <NavLink as="button" onClick={handleLogout}>
              Logout
            </NavLink>
          </NavItem>
        ) : (
          <NavItem>
            <NavLink href="/">Login</NavLink>
          </NavItem>
        )}
      </NavList>
    </Nav>
  );
};

export default Navbar;
