import { useState, useCallback, useRef, useEffect } from 'react';
import { showSnackbar } from '@components/snackbarUtils';

export interface ApiError {
  status?: number;
  data?: any;
  message: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  isAuthError: boolean;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: ApiError) => void;
  onRetry?: (attempt: number) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseError = (error: any): ApiError => {
  // Network error detection
  const isNetworkError =
    !error.status ||
    error.status === 'FETCH_ERROR' ||
    error.status === 'PARSING_ERROR' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('Failed to fetch');

  // Timeout detection
  const isTimeout =
    error.status === 'TIMEOUT_ERROR' ||
    error.message?.includes('timeout') ||
    error.message?.includes('exceeded');

  // Auth error detection
  const isAuthError = error.status === 401 || error.status === 403;

  let message = 'An unexpected error occurred';

  if (isNetworkError) {
    message = 'Network connection failed. Please check your internet connection.';
  } else if (isTimeout) {
    message = 'Request timed out. Please try again.';
  } else if (isAuthError) {
    message = 'Session expired. Please log in again.';
  } else if (error.data?.message) {
    message = error.data.message;
  } else if (error.message) {
    message = error.message;
  } else if (error.status === 404) {
    message = 'Resource not found.';
  } else if (error.status === 500) {
    message = 'Server error. Please try again later.';
  } else if (error.status === 429) {
    message = 'Too many requests. Please wait a moment.';
  }

  return {
    status: error.status,
    data: error.data,
    message,
    isNetworkError,
    isTimeout,
    isAuthError,
  };
};

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    logError = true,
    onError,
    onRetry,
  } = options;

  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleError = useCallback(
    (err: any): ApiError => {
      const parsedError = parseError(err);

      if (logError) {
        console.error('[ErrorHandler]', parsedError);
      }

      setError(parsedError);

      if (showToast && !parsedError.isAuthError) {
        showSnackbar({
          message: parsedError.message,
          severity: 'error',
          duration: 5000,
        });
      }

      onError?.(parsedError);

      return parsedError;
    },
    [logError, showToast, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
    setRetryAttempt(0);
    setIsRetrying(false);
  }, []);

  const executeWithRetry = useCallback(
    async <T,>(operation: () => Promise<T>, attempt = 0): Promise<T> => {
      try {
        clearError();
        setIsRetrying(attempt > 0);
        setRetryAttempt(attempt);

        if (attempt > 0) {
          onRetry?.(attempt);
          await sleep(retryDelay * attempt);
        }

        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (err: any) {
        const parsedError = handleError(err);

        // Don't retry auth errors or if max retries reached
        if (parsedError.isAuthError || attempt >= maxRetries) {
          setIsRetrying(false);
          throw parsedError;
        }

        // Retry network and timeout errors
        if (parsedError.isNetworkError || parsedError.isTimeout) {
          showSnackbar({
            message: `Retrying... (${attempt + 1}/${maxRetries})`,
            severity: 'warning',
            duration: 2000,
          });
          return executeWithRetry(operation, attempt + 1);
        }

        setIsRetrying(false);
        throw parsedError;
      }
    },
    [clearError, handleError, maxRetries, retryDelay, onRetry]
  );

  const wrapMutation = useCallback(
    <T,>(mutation: any) => {
      return async (args?: any): Promise<T> => {
        try {
          const result = await mutation(args).unwrap();
          return result;
        } catch (err: any) {
          const parsedError = handleError(err);

          if (parsedError.isNetworkError || parsedError.isTimeout) {
            return executeWithRetry(() => mutation(args).unwrap());
          }

          throw parsedError;
        }
      };
    },
    [handleError, executeWithRetry]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    error,
    isRetrying,
    retryAttempt,
    handleError,
    clearError,
    executeWithRetry,
    wrapMutation,
  };
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        showSnackbar({
          message: 'Back online! 🎉',
          severity: 'success',
          duration: 3000,
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      showSnackbar({
        message: 'You are offline. Some features may be unavailable.',
        severity: 'warning',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

export default useErrorHandler;
