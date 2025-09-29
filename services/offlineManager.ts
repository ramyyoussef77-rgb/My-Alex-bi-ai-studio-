import { Settings } from '../types';
import { HistoricalContextService } from './historicalContextService';
import { HistoricalContextResponse } from '../types';

// Type for the enriched data stored in the cache
interface CachedHistoricalData extends HistoricalContextResponse {
  landmark_name?: string;
  coordinates: { lat: number; lng: number };
  cachedAt: number;
  offline_available: boolean;
  _fromCache?: boolean;
  _offlineMode?: boolean;
}

export class EnhancedOfflineDataManager {
  private historicalContextService: HistoricalContextService;
  private isOnline: boolean;
  private historicalCache: Map<string, CachedHistoricalData>;

  constructor(historicalContextService: HistoricalContextService) {
    this.historicalContextService = historicalContextService;
    this.isOnline = navigator.onLine;
    this.historicalCache = new Map();

    this.setupOfflineHandlers();
    this.initializeHistoricalCache();
  }

  private setupOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[Enhanced Offline] Connection restored');
      // Note: Preloading is now triggered from App.tsx on user auth.
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[Enhanced Offline] Connection lost - switching to cached mode');
    });
  }

  private async initializeHistoricalCache() {
    try {
      const cachedData = await this.getFromIndexedDB('historical_cache');
      if (cachedData) {
        cachedData.forEach((item: { key: string, data: CachedHistoricalData}) => {
          this.historicalCache.set(item.key, item.data);
        });
        console.log(`[Enhanced Offline] Loaded ${cachedData.length} cached historical entries`);
      }
    } catch (error) {
      console.error('[Enhanced Offline] Failed to initialize cache:', error);
    }
  }

  // ARCHITECTURAL FIX: Method now accepts the dynamic userId.
  async preloadNearbyHistoricalData(userId: string) {
    if (!this.isOnline) return;

    const landmarks = [
      { name: 'Bibliotheca Alexandrina', lat: 31.2089, lng: 29.9097 },
      { name: 'Citadel of Qaitbay', lat: 31.2139, lng: 29.8839 },
      { name: "Pompey's Pillar", lat: 31.1823, lng: 29.8999 },
      { name: 'Alexandria National Museum', lat: 31.2001, lng: 29.9187 },
    ];

    console.log('[Enhanced Offline] Pre-loading historical data for major landmarks...');
    let changed = false;
    for (const landmark of landmarks) {
      const cacheKey = this.generateCacheKey(landmark.lat, landmark.lng, 'en');
      if (this.historicalCache.has(cacheKey)) continue;

      try {
        // ARCHITECTURAL FIX: Use the provided dynamic userId instead of a hardcoded string.
        const context = await this.historicalContextService.getHistoricalContext(landmark.lat, landmark.lng, { language: 'en' } as Settings, userId);
        if (context.success) {
          changed = true;
          const enrichedData: CachedHistoricalData = {
            ...context,
            landmark_name: landmark.name,
            coordinates: { lat: landmark.lat, lng: landmark.lng },
            cachedAt: Date.now(),
            offline_available: true,
          };
          this.historicalCache.set(cacheKey, enrichedData);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
      } catch (error) {
        console.error(`[Enhanced Offline] Failed to cache ${landmark.name}:`, error);
      }
    }
    if (changed) {
        await this.saveHistoricalCache();
    }
  }

  private generateCacheKey(lat: number, lng: number, language: string = 'en') {
    return `hist_${lat.toFixed(4)}_${lng.toFixed(4)}_${language}`;
  }

  private async saveHistoricalCache() {
    try {
      const cacheArray = Array.from(this.historicalCache.entries()).map(([key, data]) => ({ key, data }));
      await this.saveToIndexedDB('historical_cache', cacheArray);
    } catch (error) {
      console.error('[Enhanced Offline] Failed to save historical cache:', error);
    }
  }

  async getHistoricalContextOffline(latitude: number, longitude: number, userId: string, options: { language?: string } = {}) {
    const cacheKey = this.generateCacheKey(latitude, longitude, options.language || 'en');
    
    if (this.isOnline) {
      try {
        const result = await this.historicalContextService.getHistoricalContext(latitude, longitude, options as Settings, userId);
        if (result.success) {
          const enrichedData: CachedHistoricalData = { ...result, coordinates: { lat: latitude, lng: longitude }, cachedAt: Date.now(), offline_available: true };
          this.historicalCache.set(cacheKey, enrichedData);
          await this.saveHistoricalCache();
          return enrichedData;
        }
      } catch (error) {
        console.warn('[Enhanced Offline] Online request failed, checking cache...');
      }
    }

    const cached = this.historicalCache.get(cacheKey);
    if (cached) {
      return { ...cached, _fromCache: true, _offlineMode: true };
    }

    return {
      success: false,
      error: 'No cached historical data available for this location',
      historical_context: 'Historical context not available offline. Please connect to the internet for fresh content.',
      location_info: { name: 'Unknown Location', historical_period: '', description: '' },
      metadata: { coordinates: { latitude, longitude }, user_language: options.language || 'en' },
      era_details: [],
      _offlineMode: true,
    };
  }
  
  getAllCachedHistoricalData(): CachedHistoricalData[] {
    return Array.from(this.historicalCache.values())
      .filter(data => data.success && data.historical_context)
      .sort((a, b) => b.cachedAt - a.cachedAt)
      .map(data => ({ ...data, _fromCache: true }));
  }

  searchCachedHistoricalData(query: string): CachedHistoricalData[] {
    if (!query || query.trim().length < 2) return this.getAllCachedHistoricalData();
    const searchTerm = query.toLowerCase().trim();
    return this.getAllCachedHistoricalData().filter(data => {
        const searchableText = [
            data.historical_context,
            data.location_info?.name,
            data.landmark_name,
            data.location_info?.historical_period
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchTerm);
    });
  }

  private async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    const db = await this.openIndexedDB('MyAlexOfflineEnhanced', 2);
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(data, 'cache_data');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async getFromIndexedDB(storeName: string): Promise<any> {
    const db = await this.openIndexedDB('MyAlexOfflineEnhanced', 2);
    return new Promise<any>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get('cache_data');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  private async openIndexedDB(name: string, version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('historical_cache')) {
          db.createObjectStore('historical_cache');
        }
      };
    });
  }
}