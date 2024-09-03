// Navbar/Navbar.tsx
import React, { useEffect, useState } from "react";
import { useSetUsername, useUsername } from "../../services/store"; // Import from Zustand store
import { Nav, Title, NavList, NavItem, NavLink } from "./Styles/style";

// Navbar component
const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const setUsername = useSetUsername(); // Zustand setter
  const username = useUsername(); // Zustand getter

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    // Get the username from the URL if it exists
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get("username");
    if (urlUsername) {
      setUsername(urlUsername); // Use Zustand to set the username
      setIsLoggedIn(true);
      // Clear the query params from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setUsername]);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/user_info", {
        credentials: "include", // Ensure cookies are included
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

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "GET",
        credentials: "include",
      });
      const { auth_url } = await response.json();
      window.location.href = auth_url; // Redirect to the login page
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout", {
        method: "GET",
        credentials: "include", // Ensure cookies are included in the request
      });

      setIsLoggedIn(false);
      setUsername("N/A"); // Reset the username
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
