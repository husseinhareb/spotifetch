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
  useIsLoggedIn,
  useAuthChecked,
  useSetAuthChecked,
  useStore
} from "../../services/store";
import {
  checkLoginStatus as fetchLoginStatus,
  getLoginUrl,
  logout as performLogout,
  UserInfo
} from "../../repositories/authRepository";

const Navbar: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const authChecked = useAuthChecked();
  const [menuOpen, setMenuOpen] = useState(false);

  const setIsLoggedIn = useSetIsLoggedIn();
  const setAuthChecked = useSetAuthChecked();
  const setUsername = useSetUsername();
  const setEmail = useSetEmail();
  const setProfileImage = useSetProfileImage();
  const setCountry = useSetCountry();
  const setProduct = useSetProduct();

  const username = useUsername();
  const profileImage = useProfileImage();

  // Bootstrap authentication state once on mount
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get("username");
      const mail = params.get("email");

      if (name) {
        // Came back from Spotify OAuth redirect
        setUsername(name);
        setEmail(mail || "");
        setIsLoggedIn(true);
        window.history.replaceState({}, "", "/");
      } else {
        // No callback params → check existing session
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
          // reset user details on failure
          setUsername("N/A");
          setEmail("N/A");
          setProfileImage(null);
          setCountry("N/A");
          setProduct("N/A");
        }
      }

      // Mark that we've finished the auth check
      setAuthChecked(true);
    })();
  }, [setUsername, setEmail, setProfileImage, setCountry, setProduct, setIsLoggedIn, setAuthChecked]);

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
      // clear stored user details
      setUsername("N/A");
      setEmail("N/A");
      setProfileImage(null);
      setCountry("N/A");
      setProduct("N/A");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  // While auth check is pending, don't render the navbar to avoid flicker
  if (!authChecked) return null;

  return (
    <Nav>
      <Title>
        <NavButton onClick={() => (window.location.href = "/")}>
          Spotifetch
        </NavButton>
      </Title>

      <HamburgerIcon onClick={toggleMenu}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </HamburgerIcon>

      <NavList className={menuOpen ? "active" : ""}>
        <NavItemRight>
          <NavButton onClick={() => (window.location.href = "/")}>
            Home
          </NavButton>
        </NavItemRight>

        {isLoggedIn && (
          <NavItem>
            <NavButton onClick={() => (window.location.href = "/library")}>
              Library
            </NavButton>
          </NavItem>
        )}

        <NavItem>
          <NavButton onClick={() => (window.location.href = "/about")}>
            About
          </NavButton>
        </NavItem>

        {isLoggedIn ? (
          <>
            <NavItem>
              <NavButton onClick={() => (window.location.href = "/profile")}>
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
