/**
 * useAuth Hook
 * Custom hook for managing authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import { UserInfo, AuthState, AuthError } from '@/types';
import { authService } from '@/services/auth.service';
import logger from '@/services/logger';
import config from '@/config/env';

const redirectUri = makeRedirectUri({
  native: 'quickread://',
  preferLocalhost: true,
});

export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Google Auth
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    androidClientId: config.google.androidClientId,
    webClientId: config.google.webClientId,
    iosClientId: config.google.iosClientId,
    redirectUri,
    scopes: ['profile', 'email'],
  });

  // Facebook Auth
  const [facebookRequest, facebookResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: config.facebook.appId,
    redirectUri,
    scopes: ['public_profile', 'email'],
  });

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedAuth, storedUser] = await Promise.all([
          authService.getAuthToken(),
          authService.getUserInfo(),
        ]);

        if (storedAuth && storedUser && !authService.isTokenExpired(storedAuth)) {
          setAuthState(storedAuth);
          setUser(storedUser);
          logger.debug('Restored auth session from storage');
        } else if (storedAuth) {
          // Token expired, clear stored data
          await authService.clearAuthData();
          logger.debug('Cleared expired auth session');
        }
      } catch (err) {
        logger.error('Failed to load stored auth', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Handle Google auth response
  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.authentication) {
      const auth: AuthState = {
        ...googleResponse.authentication,
        provider: 'google',
        issuedAt: Date.now(),
      };
      setAuthState(auth);
      logger.info('Google authentication successful');
    } else if (googleResponse?.type === 'error') {
      setError({
        code: 'GOOGLE_AUTH_ERROR',
        message: 'Failed to authenticate with Google',
        details: googleResponse.error,
      });
      logger.error('Google authentication failed', googleResponse.error);
    }
  }, [googleResponse]);

  // Handle Facebook auth response
  useEffect(() => {
    if (facebookResponse?.type === 'success' && facebookResponse.authentication) {
      const auth: AuthState = {
        ...facebookResponse.authentication,
        provider: 'facebook',
        issuedAt: Date.now(),
      };
      setAuthState(auth);
      logger.info('Facebook authentication successful');
    } else if (facebookResponse?.type === 'error') {
      setError({
        code: 'FACEBOOK_AUTH_ERROR',
        message: 'Failed to authenticate with Facebook',
        details: facebookResponse.error,
      });
      logger.error('Facebook authentication failed', facebookResponse.error);
    }
  }, [facebookResponse]);

  // Fetch user info when auth state changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!authState?.accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        let userInfo: UserInfo;

        if (authState.provider === 'google') {
          userInfo = await authService.fetchGoogleUserInfo(authState.accessToken);
        } else {
          userInfo = await authService.fetchFacebookUserInfo(authState.accessToken);
        }

        setUser(userInfo);
        await Promise.all([
          authService.storeAuthToken(authState),
          authService.storeUserInfo(userInfo),
        ]);
        logger.info('User info fetched and stored successfully');
      } catch (err) {
        const error: AuthError = {
          code: 'FETCH_USER_ERROR',
          message: 'Failed to fetch user information',
          details: err,
        };
        setError(error);
        logger.error('Failed to fetch user info', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [authState]);

  const login = useCallback(
    async (provider: 'google' | 'facebook') => {
      setError(null);
      setIsLoading(true);

      try {
        if (provider === 'google') {
          if (!googleRequest) {
            throw new Error('Google auth not initialized');
          }
          await promptGoogle({ showInRecents: true });
        } else {
          if (!facebookRequest) {
            throw new Error('Facebook auth not initialized');
          }
          await promptFacebook({ showInRecents: true });
        }
      } catch (err) {
        const error: AuthError = {
          code: 'LOGIN_ERROR',
          message: `Failed to login with ${provider}`,
          details: err,
        };
        setError(error);
        logger.error('Login failed', err);
        setIsLoading(false);
      }
    },
    [googleRequest, facebookRequest, promptGoogle, promptFacebook]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Revoke token if it's Google
      if (authState?.provider === 'google' && authState.accessToken) {
        await authService.revokeGoogleToken(authState.accessToken);
      }

      // Clear all stored data
      await authService.clearAuthData();
      setAuthState(null);
      setUser(null);
      logger.info('Logout successful');
    } catch (err) {
      logger.error('Logout failed', err);
      // Still clear local state even if revocation fails
      setAuthState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [authState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};

export default useAuth;