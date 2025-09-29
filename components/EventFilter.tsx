import React from 'react';

export type ConfidenceFilter = 'all' | 'high' | 'medium';

interface EventFilterProps {
  currentFilter: ConfidenceFilter;
  setFilter: (filter: ConfidenceFilter) => void;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
        isActive
          ? 'bg-sea-blue text-white shadow-lg'
          : 'bg-light-blue text-dark-accent hover:bg-highlight'
      }`}
    >
      {label}
    </button>
  );
};

const EventFilter: React.FC<EventFilterProps> = ({ currentFilter, setFilter }) => {
  return (
    <div className="flex justify-center items-center gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-md border border-white/30">
        <span className="font-bold text-sea-blue mr-2">Show:</span>
        <FilterButton label="All Predictions" isActive={currentFilter === 'all'} onClick={() => setFilter('all')} />
        <FilterButton label="High Confidence" isActive={currentFilter === 'high'} onClick={() => setFilter('high')} />
        <FilterButton label="Medium Confidence" isActive={currentFilter === 'medium'} onClick={() => setFilter('medium')} />
    </div>
  );
};

export default EventFilter;
