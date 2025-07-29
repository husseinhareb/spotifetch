import React, { useState, useEffect } from "react";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
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
  useSetUserId,
  useSetEmail,
  useSetProfileImage,
  useSetCountry,
  useSetProduct,
  useSetIsLoggedIn,
  useIsLoggedIn,
  useAuthChecked,
  useSetAuthChecked,
  useUsername,
  useProfileImage,
} from "../../services/store";
import {
  checkLoginStatus as fetchLoginStatus,
  getLoginUrl,
  logout as performLogout,
  UserInfo
} from "../../repositories/authRepository";

const Navbar: React.FC = () => {
  const isLoggedIn     = useIsLoggedIn();
  const authChecked    = useAuthChecked();
  const username       = useUsername();
  const profileImage   = useProfileImage();

  const setUserId      = useSetUserId();
  const setUsername    = useSetUsername();
  const setEmail       = useSetEmail();
  const setProfileImage= useSetProfileImage();
  const setCountry     = useSetCountry();
  const setProduct     = useSetProduct();
  const setIsLoggedIn  = useSetIsLoggedIn();
  const setAuthChecked = useSetAuthChecked();

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get("username");
      const mail = params.get("email");
      const id   = params.get("id");

      if (name && id) {
        // OAuth callback
        setUserId(id);
        setUsername(name);
        setEmail(mail || "");
        setIsLoggedIn(true);
        window.history.replaceState({}, "", "/");
      } else {
        // check existing session
        try {
          const userInfo: UserInfo & { id: string } = await fetchLoginStatus();
          setUserId(userInfo.id);
          setUsername(userInfo.display_name);
          setEmail(userInfo.email);
          setProfileImage(userInfo.images?.[1]?.url || null);
          setCountry(userInfo.country);
          setProduct(userInfo.product);
          setIsLoggedIn(true);
        } catch {
          // not logged in
          setUserId("N/A");
          setUsername("N/A");
          setEmail("N/A");
          setProfileImage(null);
          setCountry("N/A");
          setProduct("N/A");
          setIsLoggedIn(false);
        }
      }

      setAuthChecked(true);
    })();
  }, [
    setUserId,
    setUsername,
    setEmail,
    setProfileImage,
    setCountry,
    setProduct,
    setIsLoggedIn,
    setAuthChecked,
  ]);

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
      setUserId("N/A");
      setUsername("N/A");
      setEmail("N/A");
      setProfileImage(null);
      setCountry("N/A");
      setProduct("N/A");
      setIsLoggedIn(false);
      // after logout, send back to home
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!authChecked) return null;

  return (
    <Nav>
      <Title>
        <RouterLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Spotifetch
        </RouterLink>
      </Title>

      <HamburgerIcon onClick={() => setMenuOpen(o => !o)}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </HamburgerIcon>

      <NavList className={menuOpen ? "active" : ""}>
        <NavItemRight>
          <RouterLink to="/">
            <NavButton>Home</NavButton>
          </RouterLink>
        </NavItemRight>

        {isLoggedIn && (
          <NavItem>
            <RouterLink to="/library">
              <NavButton>Library</NavButton>
            </RouterLink>
          </NavItem>
        )}

        {/* Reports button */}
        {isLoggedIn && (
          <NavItem>
            <RouterLink to="/reports">
              <NavButton>Reports</NavButton>
            </RouterLink>
          </NavItem>
        )}

        <NavItem>
          <RouterLink to="/about">
            <NavButton>About</NavButton>
          </RouterLink>
        </NavItem>

        {isLoggedIn ? (
          <>
            <NavItem>
              <RouterLink to="/profile">
                <NavButton>
                  {profileImage && <ProfileThumbnail src={profileImage} alt="Profile" />}
                  {username}
                </NavButton>
              </RouterLink>
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
