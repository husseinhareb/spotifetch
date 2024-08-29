import React from 'react';
import Profile from './components/Profile';
import Recommendations from './components/Recommendations';

const App: React.FC = () => {
    return (
        <div className="App">
            <Profile />
            <Recommendations />
        </div>
    );
}

export default App;
