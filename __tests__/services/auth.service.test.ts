/**
 * Authentication Service Tests
 */

import { authService } from '@/services/auth.service';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGoogleUserInfo', () => {
    it('should fetch Google user info successfully', async () => {
      const mockUserInfo = {
        sub: '123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/photo.jpg',
        email_verified: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUserInfo,
      }) as jest.Mock;

      const result = await authService.fetchGoogleUserInfo('mock-token');

      expect(result).toEqual({ ...mockUserInfo, provider: 'google' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }) as jest.Mock;

      await expect(
        authService.fetchGoogleUserInfo('invalid-token')
      ).rejects.toThrow();
    });
  });

  describe('token storage', () => {
    it('should store auth token securely', async () => {
      const mockAuth = {
        accessToken: 'token',
        tokenType: 'Bearer',
        provider: 'google' as const,
      };

      await authService.storeAuthToken(mockAuth);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_token',
        JSON.stringify(mockAuth)
      );
    });

    it('should retrieve stored auth token', async () => {
      const mockAuth = {
        accessToken: 'token',
        tokenType: 'Bearer',
        provider: 'google' as const,
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockAuth)
      );

      const result = await authService.getAuthToken();

      expect(result).toEqual(mockAuth);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for non-expired token', () => {
      const authState = {
        accessToken: 'token',
        tokenType: 'Bearer',
        provider: 'google' as const,
        expiresIn: 3600,
        issuedAt: Date.now(),
      };

      expect(authService.isTokenExpired(authState)).toBe(false);
    });

    it('should return true for expired token', () => {
      const authState = {
        accessToken: 'token',
        tokenType: 'Bearer',
        provider: 'google' as const,
        expiresIn: 3600,
        issuedAt: Date.now() - 4000 * 1000, // 4000 seconds ago
      };

      expect(authService.isTokenExpired(authState)).toBe(true);
    });
  });
});