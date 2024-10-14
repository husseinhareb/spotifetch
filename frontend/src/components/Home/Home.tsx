import React from 'react';
import { useUsername } from '../../services/store';
import {
  Container,
  WelcomeMessage,
} from './Styles/style';

import TopArtists from './TopArtists';
import CurrentlyPlaying from './CurrentlyPlaying';
import RecentlyPlayed from './RecentlyPlayed';


const Home: React.FC = () => {
  const username = useUsername();


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
