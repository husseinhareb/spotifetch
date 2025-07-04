import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router for navigation
import { useStore } from "../../services/store"; // Zustand store
import {
  Container,
  WelcomeMessage,
} from "./Styles/style";

import TopArtists from "./TopArtists";
import CurrentlyPlaying from "./CurrentlyPlaying";
import RecentlyPlayed from "./RecentlyPlayed";

const Home: React.FC = () => {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const username = useStore((state) => state.username);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate("/login"); // Redirect if not logged in
  //   }
  // }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    // Optional: Show a loading or placeholder screen before redirecting
    return null;
  }

  return (
    <div>
      <WelcomeMessage>Welcome home, {username}!</WelcomeMessage>
      <CurrentlyPlaying />
      <TopArtists />
      <RecentlyPlayed />
    </div>
  );
};

export default Home;
