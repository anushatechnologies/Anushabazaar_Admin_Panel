// src/app/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import authReducer from '@features/auth/authSlice';
import { baseApi, baseApiWithAuth } from '@api/baseApi';
import { authApi } from '@features/auth/api/authApi';
import appReducer from '@app/app-slices/appSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [baseApiWithAuth.reducerPath]: baseApiWithAuth.reducer,
  [authApi.reducerPath]: authApi.reducer,
  app: appReducer,
});

// ✅ Persist only auth state
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

// ✅ Wrap reducer with persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware, baseApiWithAuth.middleware, authApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
});

// ✅ Persistor
export const persistor = persistStore(store);

// Expose store on window so the cross-tab token sync listener in baseApi.ts
// can dispatch setCredentials when another tab refreshes the access token.
if (typeof window !== 'undefined') {
  (window as any).__adminReduxStore = store;
}

// ✅ Type helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
