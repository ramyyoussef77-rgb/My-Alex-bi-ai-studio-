
import React from 'react';

interface ToggleSwitchProps {
  id: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, isEnabled, onToggle }) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isEnabled}
      onClick={() => onToggle(!isEnabled)}
      className={`${
        isEnabled ? 'bg-sea-blue' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2`}
    >
      <span
        aria-hidden="true"
        className={`${
          isEnabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

export default ToggleSwitch;
