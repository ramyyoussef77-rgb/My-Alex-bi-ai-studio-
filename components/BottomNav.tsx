

import React from 'react';
import CompassIcon from './icons/CompassIcon';
import PulseIcon from './icons/PulseIcon';
import UsersIcon from './icons/UsersIcon';
import SettingsIcon from './icons/SettingsIcon';
import ShieldIcon from './icons/ShieldIcon';
import BookIcon from './icons/BookIcon';

type View = 'compass' | 'pulse' | 'community' | 'library' | 'safety' | 'settings';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-sea-blue';
  const inactiveClasses = 'text-dark-accent/60 hover:text-highlight';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-20 text-center transition-colors duration-200 ${
        isActive ? activeClasses : inactiveClasses
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] border-t border-white/40">
      <div className="container mx-auto h-full flex justify-around items-center">
        <NavButton
          label="Compass"
          icon={<CompassIcon className="w-6 h-6" />}
          isActive={currentView === 'compass'}
          onClick={() => setView('compass')}
        />
        <NavButton
          label="Local Pulse"
          icon={<PulseIcon className="w-6 h-6" />}
          isActive={currentView === 'pulse'}
          onClick={() => setView('pulse')}
        />
         <NavButton
          label="Community"
          icon={<UsersIcon className="w-6 h-6" />}
          isActive={currentView === 'community'}
          onClick={() => setView('community')}
        />
        <NavButton
          label="Library"
          icon={<BookIcon className="w-6 h-6" />}
          isActive={currentView === 'library'}
          onClick={() => setView('library')}
        />
        <NavButton
          label="Safety Net"
          icon={<ShieldIcon className="w-6 h-6" />}
          isActive={currentView === 'safety'}
          onClick={() => setView('safety')}
        />
        <NavButton
          label="Settings"
          icon={<SettingsIcon className="w-6 h-6" />}
          isActive={currentView === 'settings'}
          onClick={() => setView('settings')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;