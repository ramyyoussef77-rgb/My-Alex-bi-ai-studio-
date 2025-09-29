
export enum UserType {
  Tourist = 'Tourist',
  Local = 'Local Resident',
  Expat = 'Expat',
}

// Represents the authenticated user profile
export interface User {
  id: string;
  displayName: string;
  profile: UserType;
}

// Represents the response from a successful login/signup
export interface LoginResponse {
  token: string;
  user: User;
}


// Represents the rich, detailed event data from the Predictive Event Calendar workflow
export interface PredictedEvent {
  event_id: string; // Critical for keys and feedback
  title: string;
  predicted_date: string;
  predicted_time: string;
  venue: string;
  event_type: string;
  confidence_score: number;
  reasoning: string;
  weather_dependency: 'high' | 'medium' | 'low';
  cultural_significance: string;
  preparation_suggestions: string[];
}

// Represents the pattern insights from the Predictive Event Calendar workflow
export interface PatternInsights {
  detected_trends: string[];
  seasonal_factors: string[];
  cultural_calendar_influences: string[];
}

// Represents the full response from the predictive events endpoint
export interface PredictedEventsResponse {
  validated_events: PredictedEvent[];
  pattern_insights: PatternInsights;
  success?: boolean; // Optional success flag
}

export interface CulturalResponse {
  answer: string;
  followUpQuestions: string[];
  eraDetails?: HistoricalEraDetail[];
}

// Represents the location data from the n8n workflow's database query
export interface LocationInfo {
  name: string;
  historical_period: string;
  description: string;
}

// Represents a single historical era detail for the explorer component
export interface HistoricalEraDetail {
  era: 'Ptolemaic' | 'Roman' | 'Islamic' | 'Modern';
  summary: string;
}

// Represents the full JSON response from the n8n historical context webhook
export interface HistoricalContextResponse {
  success: boolean;
  error?: string;
  historical_context: string;
  location_info: LocationInfo;
  metadata: {
    user_language: string;
    time_of_day?: string;
    generated_at?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  era_details: HistoricalEraDetail[];
}

// Represents a single chat room suggestion from the Social Graph workflow
export interface RoomSuggestion {
  type: 'interest_based' | 'neighborhood_bridge';
  users: string[];
  topic?: string;
  neighborhood?: string;
  compatibility_score: number;
  suggested_room_name: string;
  reason: string;
}

// Represents the full JSON response from the n8n social analysis webhook
export interface SocialAnalysisResponse {
  success: boolean;
  room_suggestions: RoomSuggestion[];
  analysis_timestamp: string;
}

// Represents a discussion starter from the Facebook analysis part of the n8n workflow
export interface DiscussionStarter {
  topic: string;
  starter_question: string;
  context: string;
}

// Represents the response for the trending topics endpoint
export interface TrendingTopicsResponse {
  success: boolean;
  discussion_starters: DiscussionStarter[];
  analysis_timestamp: string;
}


// --- Settings Types ---
export type Language = 'en' | 'ar';
export type DetailLevel = 'Concise' | 'Detailed';
export type CulturalContext = 'Subtle' | 'Explicit';

export interface NotificationSettings {
    enabled: boolean;
    emergency: boolean;
    events: boolean;
    community: boolean;
}

export interface Settings {
  language: Language;
  detailLevel: DetailLevel;
  culturalContext: CulturalContext;
  notificationSettings: NotificationSettings;
}

// --- Feedback Types ---
export type FeedbackType = 'accurate' | 'inaccurate';

// --- Safety Net Types ---
export type CityAlertLevel = 'Normal' | 'Advisory' | 'Emergency';
export type EmergencyServiceType = 'Hospital' | 'Police' | 'Fire Department';

export interface EmergencyService {
  id: string;
  type: EmergencyServiceType;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface SafetyNetResponse {
  success: boolean;
  alertLevel: CityAlertLevel;
  alertMessage: string;
  safetyTips: string[];
  emergencyServices: EmergencyService[];
  lastUpdated: string;
}