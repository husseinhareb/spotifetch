import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  Nav, Title, NavList, NavItem, NavButton, ProfileThumbnail, HamburgerIcon
} from "./Styles/style"; // Styled components
import { 
  useSetUsername, useSetEmail, useSetProfileImage, useSetCountry, useSetProduct, 
  useUsername, useProfileImage 
} from "../../services/store";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const setUsername = useSetUsername();
  const setEmail = useSetEmail();
  const setProfileImage = useSetProfileImage();
  const setCountry = useSetCountry();
  const setProduct = useSetProduct();
  const username = useUsername();
  const profileImage = useProfileImage();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/user_info", { credentials: "include" });
      if (response.ok) {
        const userInfo = await response.json();
        setUsername(userInfo.display_name);
        setEmail(userInfo.email);
        setProfileImage(userInfo.images?.[1]?.url || null);
        setCountry(userInfo.country);
        setProduct(userInfo.product);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        resetUserDetails();
      }
    } catch (error) {
      console.error("Error checking login status", error);
      setIsLoggedIn(false);
      resetUserDetails();
    }
  };

  const resetUserDetails = () => {
    setUsername("N/A");
    setEmail("N/A");
    setProfileImage(null);
    setCountry("N/A");
    setProduct("N/A");
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/login", { method: "GET", credentials: "include" });
      const { auth_url } = await response.json();
      window.location.href = auth_url;
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/auth/logout", { method: "GET", credentials: "include" });
      setIsLoggedIn(false);
      resetUserDetails();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Nav>
      <Title>
        <NavButton onClick={() => window.location.href = "/"}>Spotifetch</NavButton>
      </Title>

      {/* Hamburger Icon for Mobile */}
      <HamburgerIcon onClick={toggleMenu}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </HamburgerIcon>

      {/* Navigation Menu */}
      <NavList className={menuOpen ? 'active' : ''}>
        <NavItem>
          <NavButton onClick={() => window.location.href = "/"}>Home</NavButton>
        </NavItem>
        {isLoggedIn && (
          <NavItem>
            <NavButton onClick={() => window.location.href = "/library"}>Library</NavButton>
          </NavItem>
        )}
        <NavItem>
          <NavButton onClick={() => window.location.href = "/about"}>About</NavButton>
        </NavItem>
        {isLoggedIn ? (
          <>
            <NavItem>
              <NavButton onClick={() => window.location.href = "/profile"}>
                {profileImage && (
                  <ProfileThumbnail src={profileImage} alt="Profile Thumbnail" />
                )}
                {username}
              </NavButton>
            </NavItem>
            <NavItem>
              <NavButton onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </NavButton>
            </NavItem>
          </>
        ) : (
          <NavItem>
            <NavButton onClick={handleLogin}>Login</NavButton>
          </NavItem>
        )}
      </NavList>
    </Nav>
  );
};

export default Navbar;
