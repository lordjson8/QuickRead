/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */

import * as SecureStore from 'expo-secure-store';
import { GoogleUserInfo, FacebookUserInfo, UserInfo, AuthState } from '@/types';
import logger from './logger';
import config from '@/config/env';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthService {
  /**
   * Fetch Google user information
   */
  async fetchGoogleUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google user info: ${response.status}`);
      }

      const user: GoogleUserInfo = await response.json();
      return { ...user, provider: 'google' };
    } catch (error) {
      logger.error('Failed to fetch Google user info', error);
      throw error;
    }
  }

  /**
   * Fetch Facebook user information
   */
  async fetchFacebookUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Facebook user info: ${response.status}`);
      }

      const user: FacebookUserInfo = await response.json();
      return { ...user, provider: 'facebook' };
    } catch (error) {
      logger.error('Failed to fetch Facebook user info', error);
      throw error;
    }
  }

  /**
   * Store authentication token securely
   */
  async storeAuthToken(authState: AuthState): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(authState));
      logger.debug('Auth token stored successfully');
    } catch (error) {
      logger.error('Failed to store auth token', error);
      throw error;
    }
  }

  /**
   * Retrieve authentication token
   */
  async getAuthToken(): Promise<AuthState | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return token ? JSON.parse(token) : null;
    } catch (error) {
      logger.error('Failed to retrieve auth token', error);
      return null;
    }
  }

  /**
   * Store user information securely
   */
  async storeUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userInfo));
      logger.debug('User info stored successfully');
    } catch (error) {
      logger.error('Failed to store user info', error);
      throw error;
    }
  }

  /**
   * Retrieve user information
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfo = await SecureStore.getItemAsync(USER_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      logger.error('Failed to retrieve user info', error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
      logger.debug('Auth data cleared successfully');
    } catch (error) {
      logger.error('Failed to clear auth data', error);
      throw error;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(authState: AuthState): boolean {
    if (!authState.expiresIn || !authState.issuedAt) {
      return false; // Cannot determine, assume valid
    }

    const expirationTime = authState.issuedAt + authState.expiresIn * 1000;
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return currentTime >= expirationTime - bufferTime;
  }

  /**
   * Revoke Google token
   */
  async revokeGoogleToken(accessToken: string): Promise<void> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
      });
      logger.debug('Google token revoked successfully');
    } catch (error) {
      logger.error('Failed to revoke Google token', error);
      // Don't throw, as this is a cleanup operation
    }
  }
}

export const authService = new AuthService();
export default authService;