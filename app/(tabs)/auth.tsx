/**
 * Authentication Screen
 * Refactored with proper error handling, loading states, and separation of concerns
 */

import { Image } from 'expo-image';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import logger from '@/services/logger';

export default function AuthScreen() {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();

  // Handle errors with user-friendly alerts
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Authentication Error',
        error.message,
        [
          {
            text: 'OK',
            onPress: clearError,
          },
        ],
        { cancelable: false }
      );
    }
  }, [error, clearError]);

  const handleGoogleLogin = async () => {
    logger.debug('User initiated Google login');
    await login('google');
  };

  const handleFacebookLogin = async () => {
    logger.debug('User initiated Facebook login');
    await login('facebook');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // Show authenticated user profile
  if (isAuthenticated && user) {
    const profilePicture = 
      user.provider === 'google' 
        ? (user as any).picture 
        : (user as any).picture?.data?.url;

    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          {profilePicture && (
            <Image source={{ uri: profilePicture }} style={styles.profilePic} />
          )}
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome, {user.name}!
          </ThemedText>
          {(user as any).email && (
            <ThemedText type="subtitle" style={styles.emailText}>
              {(user as any).email}
            </ThemedText>
          )}
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              {user.provider === 'google' ? '🔵 Google' : '🔷 Facebook'}
            </Text>
          </View>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Show login options
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Welcome to QuickRead
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Please sign in to continue
          </ThemedText>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, styles.facebookButton]}
            onPress={handleFacebookLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    marginBottom: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#e0e0e0',
    borderWidth: 3,
  },
  providerBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});