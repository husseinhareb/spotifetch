import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { ContentWrapper } from './components/Navbar/Styles/style';

import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import ArtistPage from './components/Artists/ArtistPage';
import Library from './components/Library/Library';
import Reports from './components/Reports/Reports';

import { useIsLoggedIn, useAuthChecked } from './services/store';

const ProtectedRoute: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const authChecked = useAuthChecked();

  // wait until we've checked auth before rendering
  if (!authChecked) return null;

  // if not logged in, send them to home; otherwise render nested routes
  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};

const App: React.FC = () => (
  <Router>
    <Navbar />
    <ContentWrapper>
      <Routes>
        {/* public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/artist/:artistId" element={<ArtistPage />} />

        {/* protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/library/*" element={<Library />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* catch-all: redirect unknown URLs back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ContentWrapper>
  </Router>
);

export default App;
