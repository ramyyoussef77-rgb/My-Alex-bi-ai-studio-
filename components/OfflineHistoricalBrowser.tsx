
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EnhancedOfflineDataManager } from '../services/offlineManager';
import { HistoricalContextResponse } from '../types';

// Utility functions
const formatCacheAge = (cachedAt: number | undefined) => {
  if (!cachedAt) return 'Unknown';
  const hours = Math.round((Date.now() - cachedAt) / (1000 * 60 * 60));
  if (hours < 1) return 'Just cached';
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Item Detail Modal Component
const HistoricalItemModal: React.FC<{ item: any; onClose: () => void; }> = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-sand-beige rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <header className="p-4 border-b border-light-blue bg-white/50 rounded-t-lg">
                <h3 className="text-xl font-bold font-serif text-sea-blue">{item.landmark_name || item.location_info?.name}</h3>
            </header>
            <main className="p-6 overflow-y-auto text-dark-accent" dangerouslySetInnerHTML={{ __html: item.historical_context.replace(/\n/g, '<br />') }}></main>
            <footer className="p-4 text-xs text-dark-accent/70 border-t border-light-blue">
                Cached {formatCacheAge(item.cachedAt)}
            </footer>
        </div>
    </div>
);


// List Item Component
const OfflineHistoricalListItem: React.FC<{ item: any; onSelect: () => void; }> = ({ item, onSelect }) => (
    <div className="bg-white/70 p-4 rounded-lg shadow-md cursor-pointer hover:bg-white transition-colors duration-200" onClick={onSelect}>
        <h4 className="font-bold text-sea-blue">{item.landmark_name || item.location_info?.name}</h4>
        <p className="text-sm text-dark-accent/80">{truncateText(item.historical_context, 100)}</p>
        <span className="text-xs text-dark-accent/60 mt-2 block">Period: {item.location_info?.historical_period}</span>
    </div>
);


// Main Browser Component
const OfflineHistoricalBrowser: React.FC<{ offlineManager: EnhancedOfflineDataManager; isOffline: boolean; }> = ({ offlineManager, isOffline }) => {
  const [cachedData, setCachedData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    setCachedData(offlineManager.getAllCachedHistoricalData());
  }, [offlineManager, isOffline]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return cachedData;
    return offlineManager.searchCachedHistoricalData(searchQuery);
  }, [cachedData, searchQuery, offlineManager]);

  return (
    <div className="w-full flex flex-col gap-8">
        <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-sea-blue">Offline Library</h2>
            <p className="text-dark-accent/80">Browse {cachedData.length} saved articles about Alexandria's history.</p>
        </div>
        <div className="sticky top-24 z-10">
            <input
                type="text"
                placeholder="Search your offline library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 border-2 border-light-blue rounded-lg shadow-md focus:ring-2 focus:ring-highlight focus:border-highlight transition duration-200 text-dark-accent"
            />
        </div>
        
        {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map((item, index) => (
                    <OfflineHistoricalListItem key={index} item={item} onSelect={() => setSelectedItem(item)} />
                ))}
            </div>
        ) : (
            <div className="text-center p-8 bg-white/60 rounded-lg">
                <p className="text-dark-accent">{searchQuery ? 'No results found in your library.' : 'Your offline library is empty.'}</p>
                <p className="text-sm text-dark-accent/70 mt-2">Explore landmarks online to save them for later.</p>
            </div>
        )}

        {selectedItem && <HistoricalItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

export default OfflineHistoricalBrowser;
