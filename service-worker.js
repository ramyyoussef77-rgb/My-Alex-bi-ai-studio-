
const CACHE_NAME = 'alexandria-compass-cache-v4'; // Incremented cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/vite.svg',
  '/types.ts',
  '/App.tsx',
  '/styles.css',
  // Hooks
  '/hooks/useSettings.ts',
  '/hooks/useTextToSpeech.ts', // New TTS hook
  // New Services
  '/services/apiService.ts',
  '/services/authService.ts', // New Auth service
  '/services/geminiService.ts',
  '/services/historicalContextService.ts',
  '/services/eventService.ts',
  '/services/feedbackService.ts',
  '/services/socialGraphService.ts',
  '/services/trendingTopicsService.ts',
  '/services/safetyNetService.ts',
  '/services/offlineManager.ts',
  '/services/chatManager.ts',
  // Components
  '/components/BottomNav.tsx',
  '/components/CompassView.tsx',
  '/components/CommunityChatView.tsx',
  '/components/OfflineHistoricalBrowser.tsx',
  '/components/DiscussionStarterCard.tsx',
  '/components/EventCard.tsx',
  '/components/EventFilter.tsx',
  '/components/EventsView.tsx',
  '/components/Footer.tsx',
  '/components/Header.tsx',
  '/components/HistoricalEras.tsx',
  '/components/InsightsCarousel.tsx',
  '/components/QueryForm.tsx',
  '/components/ResponseCard.tsx',
  '/components/RoomSuggestionCard.tsx',
  '/components/SafetyNetView.tsx',
  '/components/SettingsView.tsx',
  '/components/ToggleSwitch.tsx',
  '/components/LoginView.tsx', // New Login view
  '/components/FloatingAssistantIcon.tsx', // New Floating Icon
  // Icons
  '/components/icons/BackIcon.tsx',
  '/components/icons/BellIcon.tsx',
  '/components/icons/BookIcon.tsx',
  '/components/icons/CalendarIcon.tsx',
  '/components/icons/CameraIcon.tsx',
  '/components/icons/CompassIcon.tsx',
  '/components/icons/InsightIcon.tsx',
  '/components/icons/LocationIcon.tsx',
  '/components/icons/PulseIcon.tsx',
  '/components/icons/SettingsIcon.tsx',
  '/components/icons/ShieldIcon.tsx',
  '/components/icons/ThumbsDownIcon.tsx',
  '/components/icons/ThumbsUpIcon.tsx',
  '/components/icons/TimeIcon.tsx',
  '/components/icons/TrendingIcon.tsx',
  '/components/icons/UsersIcon.tsx',
  '/components/icons/SpeakerOnIcon.tsx', // New Speaker On icon
  '/components/icons/SpeakerOffIcon.tsx', // New Speaker Off icon
  // CDNs (Note: Caching opaque responses from CDNs can be tricky)
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and caching app shell');
      // Use addAll with a catch to prevent install failure if one asset fails
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Failed to cache one or more resources during install:', error);
      });
    })
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                 .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    // Ignore non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Use a Cache-first strategy for app shell resources
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return from cache if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network, cache, and return
        return fetch(event.request).then(networkResponse => {
          // Check for valid response to cache
          if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
          }

          // Don't cache opaque responses from third-party CDNs if they cause issues
          if (networkResponse.type === 'opaque') {
              return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      }).catch(error => {
          console.error('Fetch failed; returning offline fallback.', error);
          // Optional: return a fallback page
          // return caches.match('/offline.html');
      })
    );
});