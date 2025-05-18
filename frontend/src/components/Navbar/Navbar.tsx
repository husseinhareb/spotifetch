// src/components/Navbar/Navbar.tsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  Nav,
  Title,
  NavList,
  NavItem,
  NavItemRight,
  NavButton,
  ProfileThumbnail,
  HamburgerIcon
} from "./Styles/style";
import {
  useSetUsername,
  useSetEmail,
  useSetProfileImage,
  useSetCountry,
  useSetProduct,
  useUsername,
  useProfileImage,
  useSetIsLoggedIn,
  useStore
} from "../../services/store";
import {
  checkLoginStatus as fetchLoginStatus,
  getLoginUrl,
  logout as performLogout,
  UserInfo
} from "../../repositories/authRepository";

const Navbar: React.FC = () => {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const [menuOpen, setMenuOpen] = useState(false);

  const setIsLoggedIn = useSetIsLoggedIn();
  const setUsername = useSetUsername();
  const setEmail = useSetEmail();
  const setProfileImage = useSetProfileImage();
  const setCountry = useSetCountry();
  const setProduct = useSetProduct();
  const username = useUsername();
  const profileImage = useProfileImage();

  useEffect(() => {
    loadLoginStatus();
  }, []);

  const loadLoginStatus = async () => {
    try {
      const userInfo: UserInfo = await fetchLoginStatus();
      setUsername(userInfo.display_name);
      setEmail(userInfo.email);
      setProfileImage(userInfo.images?.[1]?.url || null);
      setCountry(userInfo.country);
      setProduct(userInfo.product);
      setIsLoggedIn(true);
    } catch {
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
      const { auth_url } = await getLoginUrl();
      window.location.href = auth_url;
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await performLogout();
      setIsLoggedIn(false);
      resetUserDetails();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const toggleMenu = () => setMenuOpen(open => !open);

  return (
    <Nav>
      <Title>
        <NavButton onClick={() => window.location.href = "/"}>
          Spotifetch
        </NavButton>
      </Title>

      <HamburgerIcon onClick={toggleMenu}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </HamburgerIcon>

      <NavList className={menuOpen ? "active" : ""}>
        {/* Right‐aligned Home button */}
        <NavItemRight>
          <NavButton onClick={() => window.location.href = "/"}>
            Home
          </NavButton>
        </NavItemRight>

        {isLoggedIn && (
          <NavItem>
            <NavButton onClick={() => window.location.href = "/library"}>
              Library
            </NavButton>
          </NavItem>
        )}

        <NavItem>
          <NavButton onClick={() => window.location.href = "/about"}>
            About
          </NavButton>
        </NavItem>

        {isLoggedIn ? (
          <>
            <NavItem>
              <NavButton onClick={() => window.location.href = "/profile"}>
                {profileImage && (
                  <ProfileThumbnail src={profileImage} alt="Profile" />
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
