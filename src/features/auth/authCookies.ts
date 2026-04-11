export interface StoredAuthUser {
  id: number;
  email: string;
  role: string;
}

const ACCESS_TOKEN_COOKIE = 'anusha_admin_token';
const REFRESH_TOKEN_COOKIE = 'anusha_admin_refresh_token';
const USER_COOKIE = 'anusha_admin_user';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const USER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

const isBrowser = () => typeof document !== 'undefined';

const normalizeCookieValue = (value: string | null) => {
  if (!value || value === 'undefined' || value === 'null') return null;
  return value;
};

const getCookieValue = (name: string): string | null => {
  if (!isBrowser()) return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const matched = document.cookie.split('; ').find((entry) => entry.startsWith(encodedName));

  if (!matched) return null;

  return decodeURIComponent(matched.slice(encodedName.length));
};

const setCookieValue = (name: string, value: string, options?: { maxAge?: number }) => {
  if (!isBrowser()) return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}${secure}`;
};

const clearCookieValue = (name: string) => {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const getStoredAccessToken = () => normalizeCookieValue(getCookieValue(ACCESS_TOKEN_COOKIE));

export const getStoredRefreshToken = () =>
  normalizeCookieValue(getCookieValue(REFRESH_TOKEN_COOKIE));

export const getStoredAuthUser = (): StoredAuthUser | null => {
  const saved = normalizeCookieValue(getCookieValue(USER_COOKIE));
  if (!saved) return null;

  try {
    return JSON.parse(saved) as StoredAuthUser;
  } catch (error) {
    console.error('Error parsing auth user cookie:', error);
    clearCookieValue(USER_COOKIE);
    return null;
  }
};

export const saveAuthSession = (params: {
  token: string;
  refreshToken?: string | null;
  user: StoredAuthUser | null;
}) => {
  setCookieValue(ACCESS_TOKEN_COOKIE, params.token);

  if (params.refreshToken) {
    setCookieValue(REFRESH_TOKEN_COOKIE, params.refreshToken, {
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }

  if (params.user) {
    setCookieValue(USER_COOKIE, JSON.stringify(params.user), {
      maxAge: USER_COOKIE_MAX_AGE,
    });
  }
};

export const clearAuthSession = () => {
  clearCookieValue(ACCESS_TOKEN_COOKIE);
  clearCookieValue(REFRESH_TOKEN_COOKIE);
  clearCookieValue(USER_COOKIE);
};
