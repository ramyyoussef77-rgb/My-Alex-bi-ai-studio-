import React from 'react';
import CompassIcon from './icons/CompassIcon';

const FloatingAssistantIcon: React.FC = () => {
  return (
    <div 
      className="fixed bottom-24 right-4 md:right-8 z-40 w-16 h-16 bg-sea-blue rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
      style={{ animation: 'float-bob 3s ease-in-out infinite' }}
      title="Alexandria Cultural Compass AI"
    >
      <CompassIcon className="w-8 h-8 text-white" />
    </div>
  );
};

export default FloatingAssistantIcon;
