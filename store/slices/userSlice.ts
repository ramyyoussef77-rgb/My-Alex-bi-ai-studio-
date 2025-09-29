import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { User, UserType, LoginResponse } from '../../types';
import { authService } from '../../services/authService';

export interface UserState extends User {
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  id: '',
  profile: UserType.Tourist,
  displayName: '',
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// --- Async Thunks ---
export const loginUser = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk<LoginResponse, { displayName: string; email: string; password: string; profile: UserType }>(
  'user/signup',
  async (details, { rejectWithValue }) => {
    try {
      return await authService.signup(details);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthStatus = createAsyncThunk<LoginResponse | null>(
  'user/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = authService.getToken();
      if (!token) return null;
      // Validate token with a '/me' endpoint
      return await authService.getMe();
    } catch (error: any) {
      // If /me fails (e.g., token expired), logout
      authService.logout();
      return rejectWithValue(error.message);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutUser: (state) => {
      authService.logout();
      Object.assign(state, initialState, { status: 'idle' });
    }
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state: UserState, action: PayloadAction<LoginResponse>) => {
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.id = action.payload.user.id;
      state.displayName = action.payload.user.displayName;
      state.profile = action.payload.user.profile;
      state.error = null;
    };

    const handleAuthPending = (state: UserState) => {
      state.status = 'loading';
      state.error = null;
    };

    const handleAuthFailed = (state: UserState, action: any) => {
      state.status = 'failed';
      state.isAuthenticated = false;
      state.error = action.payload || 'Authentication failed.';
    };

    builder
      .addCase(loginUser.pending, handleAuthPending)
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, handleAuthFailed)
      
      .addCase(signupUser.pending, handleAuthPending)
      .addCase(signupUser.fulfilled, handleAuthSuccess)
      .addCase(signupUser.rejected, handleAuthFailed)
      
      .addCase(checkAuthStatus.pending, (state) => {
          state.status = 'loading';
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          handleAuthSuccess(state, action as PayloadAction<LoginResponse>);
        } else {
          state.status = 'failed'; // No token found
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        Object.assign(state, initialState, { status: 'failed' });
      });
  },
});

export const { logoutUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer;
