
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PredictedEvent, PatternInsights, FeedbackType, PredictedEventsResponse } from '../../types';
import { EventService } from '../../services/eventService';
import { FeedbackService } from '../../services/feedbackService';

type ConfidenceFilter = 'all' | 'high' | 'medium';

interface PulseState {
  events: PredictedEvent[];
  insights: PatternInsights | null;
  loading: boolean;
  error: string | null;
  filter: ConfidenceFilter;
}

const initialState: PulseState = {
  events: [],
  insights: null,
  loading: false,
  error: null,
  filter: 'all',
};

interface ThunkExtraArgument {
    events: EventService;
    feedback: FeedbackService;
}

// Async Thunks
export const fetchPulseData = createAsyncThunk<
  PredictedEventsResponse,
  void,
  { extra: ThunkExtraArgument }
>('pulse/fetchData', async (_, { extra: { events } }) => {
  return events.getPredictedEvents();
});

export const sendEventFeedback = createAsyncThunk<
  { success: boolean; queued?: boolean },
  { eventId: string; feedbackType: FeedbackType },
  { extra: ThunkExtraArgument; state: RootState }
>('pulse/sendFeedback', async (args, { extra: { feedback }, getState }) => {
  const { user } = getState();
  return feedback.sendEventFeedback(args.eventId, user.id, args.feedbackType);
});


const pulseSlice = createSlice({
  name: 'pulse',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ConfidenceFilter>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchPulseData
    builder.addCase(fetchPulseData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPulseData.fulfilled, (state, action: PayloadAction<PredictedEventsResponse>) => {
      state.loading = false;
      state.events = action.payload.validated_events;
      state.insights = action.payload.pattern_insights;
    });
    builder.addCase(fetchPulseData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch local pulse data.';
    });

    // sendEventFeedback
    builder.addCase(sendEventFeedback.fulfilled, (state, action) => {
        if(action.payload.queued) {
            console.log('Feedback queued successfully.');
        } else {
            console.log('Feedback sent successfully.');
        }
    });
    builder.addCase(sendEventFeedback.rejected, (state, action) => {
        console.error('Feedback submission failed:', action.error.message);
    });
  },
});

export const { setFilter } = pulseSlice.actions;
export const selectPulse = (state: RootState) => state.pulse;
export default pulseSlice.reducer;