// Library.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import RecentlyPlayed from "./RecentlyPlayed";
import Songs from "./Songs";
import Artists from "./Artists";
import Albums from "./Albums";
import {
  NavBar,
  NavList,
  NavItem,
  NavLink,
  Container,
  Heading,
} from "./Styles/style";

const Library: React.FC = () => {
  return (
    <Container>
      <Heading>Library</Heading>

      {/* Styled Navigation Bar */}
      <NavBar>
        <NavList>
          <NavItem>
            {/* Use "to" instead of "href" if you want client-side routing */}
            <NavLink to="recently-played">Recently Played</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="songs">Songs</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="artists">Artists</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="albums">Albums</NavLink>
          </NavItem>
        </NavList>
      </NavBar>

      {/* Nested Routes */}
      <Routes>
        {/* Index route => /library/ */}
        <Route index element={<RecentlyPlayed />} />

        {/* Child routes => /library/recently-played, /library/songs, etc. */}
        <Route path="recently-played" element={<RecentlyPlayed />} />
        <Route path="songs" element={<Songs />} />
        <Route path="artists" element={<Artists />} />
        <Route path="albums" element={<Albums />} />
      </Routes>
    </Container>
  );
};

export default Library;
