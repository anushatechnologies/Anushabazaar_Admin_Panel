import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AllLoansState {
  appLoader: boolean;
  pageName: string;
}

const initialState: AllLoansState = {
  appLoader: false,
  pageName: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoader(state, action: PayloadAction<boolean>) {
      state.appLoader = action.payload;
    },
    setPageName(state, action) {
      state.pageName = action.payload;
    },
  },
});

export const { setLoader, setPageName } = appSlice.actions;

export default appSlice.reducer;
