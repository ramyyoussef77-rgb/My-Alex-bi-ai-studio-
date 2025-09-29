import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CulturalResponse, Settings, UserType } from '../../types';
import { EnhancedOfflineDataManager } from '../../services/offlineManager';
import { geminiService } from '../../services/geminiService';

interface CompassState {
  response: CulturalResponse | null;
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
}

const initialState: CompassState = {
  response: null,
  loading: false,
  error: null,
  isFromCache: false,
};

interface ThunkExtraArgument {
    gemini: typeof geminiService;
    offlineManager: EnhancedOfflineDataManager;
}

// Async Thunks
export const fetchGenerativeResponse = createAsyncThunk<
  CulturalResponse,
  { query: string; userType: UserType; settings: Settings },
  { extra: ThunkExtraArgument }
>('compass/fetchGenerative', async (args, { extra: { gemini } }) => {
  return gemini.getGenerativeResponse(args.query, args.userType, args.settings);
});

export const fetchHistoricalContext = createAsyncThunk<
  any, // Allow flexible response from offline manager
  { settings: Settings },
  { extra: ThunkExtraArgument; state: RootState }
>('compass/fetchHistorical', async (args, { extra: { offlineManager }, getState, rejectWithValue }) => {
    const { user } = getState();

    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await offlineManager.getHistoricalContextOffline(latitude, longitude, user.id, { language: args.settings.language });
                        const transformedResponse = {
                            answer: response.historical_context,
                            followUpQuestions: response.success ? [
                                `Tell me more about ${response.location_info.name}.`,
                                `What was the ${response.location_info.historical_period} period like here?`
                            ] : [],
                            eraDetails: response.era_details,
                            _fromCache: response._fromCache || response._offlineMode,
                        };
                        resolve(transformedResponse);
                    } catch (error) {
                        reject(error);
                    }
                },
                (geoError) => {
                    console.error('Geolocation Error:', geoError);
                    reject(new Error(`Geolocation failed: ${geoError.message}`));
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by your browser."));
        }
    }).catch(error => rejectWithValue(error.message));
});

export const fetchVisualAnalysis = createAsyncThunk<
  CulturalResponse,
  { imageData: string; mimeType: string; settings: Settings },
  { extra: ThunkExtraArgument }
>('compass/fetchVisualAnalysis', async (args, { extra: { gemini } }) => {
  return gemini.getVisualAnalysis(args.imageData, args.mimeType, args.settings);
});


const compassSlice = createSlice({
  name: 'compass',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Shared pending state handler
    const handlePending = (state: CompassState) => {
        state.loading = true;
        state.error = null;
        state.response = null;
        state.isFromCache = false;
    };

    // Shared fulfilled state handler
    const handleFulfilled = (state: CompassState, action: PayloadAction<any>) => {
        // BUG FIX: Destructure payload to separate UI state from data.
        const { _fromCache, ...responsePayload } = action.payload;
        state.loading = false;
        state.response = responsePayload; // Ensures state.response matches CulturalResponse type
        state.isFromCache = _fromCache || false;
    };
    
    // Shared rejected state handler
    const handleRejected = (state: CompassState, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'An unknown error occurred.';
    };

    // Add cases for all thunks
    [fetchGenerativeResponse, fetchHistoricalContext, fetchVisualAnalysis].forEach(thunk => {
        builder.addCase(thunk.pending, handlePending);
        builder.addCase(thunk.fulfilled, handleFulfilled);
        builder.addCase(thunk.rejected, handleRejected);
    });
  },
});

export const selectCompass = (state: RootState) => state.compass;
export default compassSlice.reducer;