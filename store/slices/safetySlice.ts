
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { SafetyNetResponse } from '../../types';
import { SafetyNetService } from '../../services/safetyNetService';

interface SafetyState {
  data: SafetyNetResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: SafetyState = {
  data: null,
  loading: false,
  error: null,
};

interface ThunkExtraArgument {
    safety: SafetyNetService;
}

// Async Thunk
export const fetchSafetyData = createAsyncThunk<
  SafetyNetResponse,
  void,
  { extra: ThunkExtraArgument }
>('safety/fetchData', async (_, { extra: { safety } }) => {
  return safety.getSafetyNetData();
});

const safetySlice = createSlice({
  name: 'safety',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSafetyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSafetyData.fulfilled, (state, action: PayloadAction<SafetyNetResponse>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSafetyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch safety data.';
      });
  },
});

export const selectSafety = (state: RootState) => state.safety;
export default safetySlice.reducer;
