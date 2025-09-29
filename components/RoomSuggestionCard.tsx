import React from 'react';
import { RoomSuggestion } from '../types';
import UsersIcon from './icons/UsersIcon';

interface RoomSuggestionCardProps {
  suggestion: RoomSuggestion;
  onJoinRoom: (suggestion: RoomSuggestion) => void;
}

const RoomSuggestionCard: React.FC<RoomSuggestionCardProps> = ({ suggestion, onJoinRoom }) => {
    const isInterestBased = suggestion.type === 'interest_based';
    const cardColor = isInterestBased ? 'border-highlight' : 'border-green-500';

  return (
    <div className={`suggestion-card bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg border-l-4 ${cardColor} transition-shadow duration-300`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold font-serif text-sea-blue">{suggestion.suggested_room_name}</h3>
        <div 
          className="flex items-center text-xs font-bold text-dark-accent/80"
          title={`Compatibility Score: ${Math.round(suggestion.compatibility_score * 100)}%`}
        >
          <UsersIcon className="w-4 h-4 mr-1" />
          <span>{`${Math.round(suggestion.compatibility_score * 100)}% Match`}</span>
        </div>
      </div>
      
      <div className="text-sm font-semibold uppercase text-dark-accent/60 mb-3">
        {isInterestBased ? `Topic: ${suggestion.topic}` : `Neighborhood: ${suggestion.neighborhood}`}
      </div>

      <p className="text-dark-accent/90 text-sm mb-4">
        {suggestion.reason}
      </p>

      <button
        onClick={() => onJoinRoom(suggestion)}
        className="button-ripple w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-sea-blue transition-colors duration-300"
      >
        Join Room
      </button>
    </div>
  );
};

export default RoomSuggestionCard;