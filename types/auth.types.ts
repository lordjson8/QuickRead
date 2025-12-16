/**
 * Authentication Types
 * Defines all types related to authentication flows
 */

export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}

export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

export type UserInfo = (GoogleUserInfo | FacebookUserInfo) & {
  provider: 'google' | 'facebook';
};

export interface AuthState {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  refreshToken?: string;
  scope?: string;
  provider: 'google' | 'facebook';
  issuedAt?: number;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}