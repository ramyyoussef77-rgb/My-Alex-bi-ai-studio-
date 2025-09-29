
import React from 'react';
import CompassIcon from './icons/CompassIcon';

interface HeaderProps {
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOnline }) => {
  return (
    <header className="bg-sea-blue text-sand-beige p-6 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CompassIcon className="w-10 h-10 text-highlight" />
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold">Alexandria Cultural Compass</h1>
            <p className="text-light-blue text-xs md:text-sm">Your AI guide to the Pearl of the Mediterranean</p>
          </div>
        </div>
        <div 
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            isOnline ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'
          }`}
          title={isOnline ? 'You are connected to the internet' : 'You are offline. Some features may be limited.'}
        >
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;