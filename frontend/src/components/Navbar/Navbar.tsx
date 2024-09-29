// Navbar/Navbar.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useSetUsername,
  useSetEmail,
  useSetProfileImage,
  useSetCountry,
  useSetProduct,
  useUsername,
  useProfileImage
} from "../../services/store";
import {
  Nav,
  Title,
  NavList,
  NavItem,
  NavLink,
  LogoutButton,
  ProfileThumbnail
} from "./Styles/style";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate(); // Initialize useNavigate to redirect users

  // Redux or Zustand state setters
  const setUsername = useSetUsername();
  const setEmail = useSetEmail();
  const setProfileImage = useSetProfileImage();
  const setCountry = useSetCountry();
  const setProduct = useSetProduct();

  // User information selectors
  const username = useUsername();
  const profileImage = useProfileImage();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/user_info", {
        credentials: "include",
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUserDetails(userInfo);
        setIsLoggedIn(true);
      } else {
        handleLogoutState();
      }
    } catch (error) {
      console.error("Error checking login status", error);
      handleLogoutState();
    }
  };

  const setUserDetails = (userInfo: any) => {
    setUsername(userInfo.display_name);
    setEmail(userInfo.email);
    setProfileImage(userInfo.images && userInfo.images.length > 0 ? userInfo.images[0].url : null);
    setCountry(userInfo.country);
    setProduct(userInfo.product);
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
      handleLogoutState();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleLogoutState = () => {
    setIsLoggedIn(false);
    resetUserDetails();
    navigate("/"); // Redirect to home after logout
  };

  // Redirect to login if trying to access a restricted page
  const handleRestrictedNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(path);
    } else {
      handleLogin();
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
          <NavLink href="/about" onClick={(e) => handleRestrictedNavigation(e, "/about")}>
            About
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/profile" onClick={(e) => handleRestrictedNavigation(e, "/profile")}>
            Profile
          </NavLink>
        </NavItem>
        {isLoggedIn ? (
          <NavItem>
            <LogoutButton onClick={handleLogout}>
              {profileImage && (
                <ProfileThumbnail
                  src={profileImage}
                  alt="Profile Thumbnail"
                />
              )}
              {username} <FontAwesomeIcon icon={faRightFromBracket} />
            </LogoutButton>
          </NavItem>
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
