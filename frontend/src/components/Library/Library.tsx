import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecentlyPlayed from './RecentlyPlayed';
import Songs from './Songs';
import Artists from './Artists';
import Albums from './Albums';
import { 
  NavBar, NavList, NavItem, NavLink, Container, Heading 
} from './Styles/style'; // Import your styled components

const Library: React.FC = () => {
  return (
    <Container>
      <Heading>Library</Heading>

      {/* Styled Navigation Bar */}
      <NavBar>
        <NavList>
          <NavItem>
            <NavLink href="recently-played">Recently Played</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="songs">Songs</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="artists">Artists</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="albums">Albums</NavLink>
          </NavItem>
        </NavList>
      </NavBar>

      {/* Nested Routes */}
      <Routes>
        {/* Default route */}
        <Route index element={<RecentlyPlayed />} />

        {/* Define child routes */}
        <Route path="recently-played" element={<RecentlyPlayed />} />
        <Route path="songs" element={<Songs />} />
        <Route path="artists" element={<Artists />} />
        <Route path="albums" element={<Albums />} />
      </Routes>
    </Container>
  );
};

export default Library;
