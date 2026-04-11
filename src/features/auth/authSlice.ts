import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredAuthUser,
  getStoredRefreshToken,
  saveAuthSession,
} from '@features/auth/authCookies';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; role: string } | null;
  isLoggedIn: boolean;
}

const initialToken = getStoredAccessToken();
const initialRefreshToken = getStoredRefreshToken();

const initialState: AuthState = {
  token: initialToken,
  refreshToken: initialRefreshToken,
  user: getStoredAuthUser(),
  isLoggedIn: !!(initialToken || initialRefreshToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string | null;
        user: AuthState['user'];
      }>,
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      saveAuthSession({
        token: action.payload.token,
        refreshToken: action.payload.refreshToken ?? state.refreshToken,
        user: action.payload.user,
      });
    },
    logoutUser: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isLoggedIn = false;
      clearAuthSession();
    },
  },
});

export const { setCredentials, logoutUser } = authSlice.actions;
export default authSlice.reducer;
