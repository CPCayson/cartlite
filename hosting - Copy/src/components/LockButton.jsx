import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

const LockButton = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const toggleLock = () => {
    setIsUnlocked(!isUnlocked);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-black opacity-20 rounded-full blur-md transform translate-y-1"></div>
        <button
          onClick={toggleLock}
          className={`
            w-24 h-24 rounded-full focus:outline-none transition-all duration-300
            flex items-center justify-center relative
            ${isUnlocked ? 'bg-green-500' : 'bg-red-500'}
            border-4 border-white
            ${isUnlocked 
              ? 'shadow-[0_0_20px_rgba(0,255,0,0.5)]' 
              : 'shadow-[0_0_20px_rgba(255,0,0,0.5)]'}
          `}
        >
          {isUnlocked ? (
            <Unlock className="w-12 h-12 text-white" />
          ) : (
            <Lock className="w-12 h-12 text-white" />
          )}
        </button>
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-700">
        {isUnlocked ? 'Cart is unlocked' : 'Cart is locked'}
      </p>
    </div>
  );
};

export default LockButton;