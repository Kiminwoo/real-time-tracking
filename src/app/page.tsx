// pages/index.tsx
import React from 'react';
import RealTimeTracker from './components/RealTimeTracker';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Real-Time Tracker Demo</h1>
      <RealTimeTracker />
    </div>
  );
};

export default Home;