/**
 * useAuth Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

jest.mock('@/services/auth.service');
jest.mock('expo-auth-session/providers/google');
jest.mock('expo-auth-session/providers/facebook');
jest.mock('expo-auth-session');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    (authService.getAuthToken as jest.Mock).mockResolvedValue(null);
    (authService.getUserInfo as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should restore authenticated session from storage', async () => {
    const mockAuth = {
      accessToken: 'token',
      tokenType: 'Bearer',
      provider: 'google' as const,
      issuedAt: Date.now(),
      expiresIn: 3600,
    };

    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      provider: 'google' as const,
    };

    (authService.getAuthToken as jest.Mock).mockResolvedValue(mockAuth);
    (authService.getUserInfo as jest.Mock).mockResolvedValue(mockUser);
    (authService.isTokenExpired as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear expired session on mount', async () => {
    const mockAuth = {
      accessToken: 'token',
      tokenType: 'Bearer',
      provider: 'google' as const,
      issuedAt: Date.now() - 5000 * 1000,
      expiresIn: 3600,
    };

    (authService.getAuthToken as jest.Mock).mockResolvedValue(mockAuth);
    (authService.getUserInfo as jest.Mock).mockResolvedValue(null);
    (authService.isTokenExpired as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(authService.clearAuthData).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
  });
});