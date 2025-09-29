
import { configureStore } from '@reduxjs/toolkit';
import compassReducer from './slices/compassSlice';
import pulseReducer from './slices/pulseSlice';
import communityReducer from './slices/communitySlice';
import safetyReducer from './slices/safetySlice';
import userReducer from './slices/userSlice'; // Import the new user reducer
import { geminiService } from '../services/geminiService';
import { HistoricalContextService } from '../services/historicalContextService';
import { EventService } from '../services/eventService';
import { FeedbackService } from '../services/feedbackService';
import { SocialGraphService } from '../services/socialGraphService';
import { TrendingTopicsService } from '../services/trendingTopicsService';
import { SafetyNetService } from '../services/safetyNetService';
import { EnhancedOfflineDataManager } from '../services/offlineManager';

// Instantiate services here to be used as singletons
const historicalContextService = new HistoricalContextService();
export const offlineManager = new EnhancedOfflineDataManager(historicalContextService);

// ARCHITECTURAL FIX: Removed preloading from here. It's now triggered
// in App.tsx after the user state is available.

// Collection of all services to be provided to thunks
const services = {
    gemini: geminiService,
    historicalContext: historicalContextService,
    events: new EventService(),
    feedback: new FeedbackService(),
    socialGraph: new SocialGraphService(),
    trendingTopics: new TrendingTopicsService(),
    safety: new SafetyNetService(),
    offlineManager: offlineManager,
};

export const store = configureStore({
  reducer: {
    user: userReducer, // Add user reducer to the store
    compass: compassReducer,
    pulse: pulseReducer,
    community: communityReducer,
    safety: safetyReducer,
  },
  // Provide service instances to thunks via extraArgument
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
        thunk: {
            extraArgument: services
        }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;