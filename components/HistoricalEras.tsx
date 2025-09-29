
import React, { useState } from 'react';
import { HistoricalEraDetail } from '../types';
import TimeIcon from './icons/TimeIcon';

interface HistoricalErasProps {
  eras: HistoricalEraDetail[];
}

const HistoricalEras: React.FC<HistoricalErasProps> = ({ eras }) => {
  const [selectedEra, setSelectedEra] = useState<HistoricalEraDetail>(eras[0]);

  return (
    <div className="mt-8 border-t border-light-blue pt-6">
      <h3 className="text-lg font-bold text-sea-blue mb-4 flex items-center gap-2">
        <TimeIcon className="w-5 h-5" />
        Explore Through Time
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-4 border-b border-light-blue pb-4">
        {eras.map((eraDetail) => (
          <button
            key={eraDetail.era}
            onClick={() => setSelectedEra(eraDetail)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
              selectedEra.era === eraDetail.era
                ? 'bg-sea-blue text-white shadow-md'
                : 'bg-light-blue text-dark-accent hover:bg-highlight'
            }`}
          >
            {eraDetail.era}
          </button>
        ))}
      </div>

      <div className="bg-sand-beige/50 p-4 rounded-lg">
        <p className="text-dark-accent text-sm leading-relaxed">{selectedEra.summary}</p>
      </div>
    </div>
  );
};

export default HistoricalEras;
