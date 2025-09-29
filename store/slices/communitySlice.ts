
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { RoomSuggestion, DiscussionStarter } from '../../types';
import { SocialGraphService } from '../../services/socialGraphService';
import { TrendingTopicsService } from '../../services/trendingTopicsService';

interface CommunityData {
    suggestions: RoomSuggestion[];
    topics: DiscussionStarter[];
}

interface CommunityState extends CommunityData {
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  suggestions: [],
  topics: [],
  loading: false,
  error: null,
};

interface ThunkExtraArgument {
    socialGraph: SocialGraphService;
    trendingTopics: TrendingTopicsService;
}

// Async Thunk
export const fetchCommunityData = createAsyncThunk<
  CommunityData,
  void, // No argument needed, userId comes from state
  { extra: ThunkExtraArgument; state: RootState }
>('community/fetchData', async (_, { extra: { socialGraph, trendingTopics }, getState }) => {
    const { user } = getState();
    // Fetch in parallel for better performance
    const [suggestionsResponse, topicsResponse] = await Promise.all([
        socialGraph.getRoomSuggestions(user.id),
        trendingTopics.getTrendingTopics()
    ]);
    return {
        suggestions: suggestionsResponse.room_suggestions || [],
        topics: topicsResponse.discussion_starters || []
    };
});

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityData.fulfilled, (state, action: PayloadAction<CommunityData>) => {
        state.loading = false;
        state.suggestions = action.payload.suggestions;
        state.topics = action.payload.topics;
      })
      .addCase(fetchCommunityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch community data.';
      });
  },
});

export const selectCommunity = (state: RootState) => state.community;
export default communitySlice.reducer;