import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@app/store';

/**
 * Use throughout your app instead of plain `useDispatch` and `useSelector`
 * Provides proper TypeScript types for dispatch and state
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
