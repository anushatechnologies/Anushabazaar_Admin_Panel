import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { id: number; email: string; role: string } | null;
  isLoggedIn: boolean;
}

// ✅ LOAD FROM localStorage ON STARTUP - SAFER PARSING
const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    return JSON.parse(saved);
  } catch (e) {
    console.error('Error parsing saved user:', e);
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  user: getInitialUser(),
  isLoggedIn: !!localStorage.getItem('token') && localStorage.getItem('token') !== 'null' && localStorage.getItem('token') !== 'undefined', 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: AuthState['user'] }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
      localStorage.setItem('token', action.payload.token); 
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logoutUser: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem('token'); 
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logoutUser } = authSlice.actions;
export default authSlice.reducer;
