import styled from "styled-components";

// Navbar container
export const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.navBackground};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

// Push page content below navbar
export const ContentWrapper = styled.div`
  margin-top: 50px;
`;

// Title container
export const Title = styled.div`
  color: ${({ theme }) => theme.colors.navText};
  font-size: 18px;
  font-weight: bold;
`;

// Navigation list for desktop and mobile views
export const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.navBackground};
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    padding: 20px;
  }

  &.active {
    display: flex;
  }
`;

// Each nav item (li) container
export const NavItem = styled.li`
  margin-left: 20px;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 15px;
  }
`;

// Special nav item that pushes itself (and subsequent items) to the far right
export const NavItemRight = styled(NavItem)`
  margin-left: auto;
`;

// Button used for all navigation actions
export const NavButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.buttonText};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonBackground};
  }
`;

// Styled profile thumbnail
export const ProfileThumbnail = styled.img`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 0.5rem;
`;

// Hamburger icon for mobile view
export const HamburgerIcon = styled.div`
  display: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.navText};
  font-size: 24px;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const ThemeToggle = styled.button`
  background: none;
  border: 1px solid rgba(255,255,255,0.08);
  color: ${({ theme }) => theme.colors.navText};
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 12px;
  margin-right: 12px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s, transform 0.08s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonBackground};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid rgba(88, 101, 242, 0.2);
    outline-offset: 2px;
  }
`;
