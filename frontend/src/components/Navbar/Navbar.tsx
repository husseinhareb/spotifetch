import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSetUsername, useSetEmail, useSetProfileImage, useSetCountry, useSetProduct, useUsername, useProfileImage } from "../../services/store";
import { Nav, Title, NavList, NavItem, NavButton, ProfileThumbnail } from "./Styles/style";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const setUsername = useSetUsername();
  const setEmail = useSetEmail();
  const setProfileImage = useSetProfileImage();
  const setCountry = useSetCountry();
  const setProduct = useSetProduct();

  // Adding profile image and username selectors
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
        setUsername(userInfo.display_name);
        setEmail(userInfo.email);
        setProfileImage(userInfo.images && userInfo.images.length > 0 ? userInfo.images[1].url : null);
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
      setIsLoggedIn(false);
      resetUserDetails();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Nav>
      <Title>
        <NavButton onClick={() => window.location.href = "/"}>Spotifetch</NavButton>
      </Title>
      <NavList>
        <NavItem>
          <NavButton onClick={() => window.location.href = "/"}>Home</NavButton>
        </NavItem>
        <NavItem>
          <NavButton onClick={() => window.location.href = "/about"}>About</NavButton>
        </NavItem>
        {isLoggedIn ? (
          <>
            <NavItem>
              <NavButton onClick={() => window.location.href = "/profile"}>
                {profileImage && (
                  <ProfileThumbnail
                    src={profileImage}
                    alt="Profile Thumbnail"
                  />
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
