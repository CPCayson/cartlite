import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Dashboard = () => {
  const { isHostMode } = useContext(AppContext);

  return (
    <div className={`dashboard ${isHostMode ? 'host-mode' : 'guest-mode'}`}>
      {/* ... your dashboard content */}
    </div>
  );
};

export default Dashboard;
