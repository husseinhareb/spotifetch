import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { ContentWrapper } from './components/Navbar/Styles/style'; // Import the wrapper

// Import your other components/pages here
import Home from './components/Home/Home';
import About from './components/About/About';
import Profile from './components/Profile/Profile';
import ArtistPage from './components/Artists/ArtistPage'; // Import the ArtistPage component
import YourData from './components/Data/YourData';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/artist/:artistId" element={<ArtistPage />} />
            <Route path="/yourData" element={<YourData />} />
          </Routes>
        </ContentWrapper>
      </div>
    </Router>
  );
};

export default App;
