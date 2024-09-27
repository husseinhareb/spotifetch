// Navbar/Navbar.tsx
import React from "react";
import useUserInfo from "../../hooks/useUserInfo";
import { Nav, Title, NavList, NavItem, NavLink } from "./Styles/style";

const Navbar: React.FC = () => {
  const { isLoggedIn, resetUserDetails } = useUserInfo();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "GET",
        credentials: "include",
      });
      const { auth_url } = await response.json();
      window.location.href = auth_url;
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout", {
        method: "GET",
        credentials: "include",
      });
      resetUserDetails();
    } catch (error) {
      console.error("Logout failed", error);
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
          <>
            <NavItem>
              <NavLink as="button" onClick={handleLogout}>
                Logout
              </NavLink>
            </NavItem>
          </>
        ) : (
          <NavItem>
            <NavLink as="button" onClick={handleLogin}>
              Login
            </NavLink>
          </NavItem>
        )}
      </NavList>
    </Nav>
  );
};

export default Navbar;
