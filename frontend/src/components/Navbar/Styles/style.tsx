import styled from "styled-components";

// Styled components
export const Nav = styled.nav`
  background-color: #333;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.div`
  font-size: 1.5rem;
  color: white;
`;

export const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  margin-left: 1rem;
  display: flex; /* Ensure items inside align correctly */
  align-items: center; /* Center items vertically */
`;

// Modified NavLink styled component
export const NavLink = styled.a<{ as?: string }>`
  color: white;
  text-decoration: none;
  display: inline-flex; /* Changed to inline-flex for better alignment */
  align-items: center; /* Vertically centers text and icons */
  padding: 0.5rem 1rem; /* Uniform padding */
  line-height: 1; /* Consistent line-height */
  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  /* If used as a button, apply button-specific styles */
  ${({ as }) =>
    as === "button" &&
    `
    background-color: #444;
    border-radius: 5px;
    text-decoration: none; /* Ensure no underline for buttons */
    &:hover {
      background-color: #555;
    }
  `}
`;
