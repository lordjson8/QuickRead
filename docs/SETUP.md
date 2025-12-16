# QuickRead Setup Guide

Complete guide to set up the QuickRead application for development and production.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (Mac only) or Android Studio
- Xcode (Mac only, for iOS development)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lordjson8/QuickRead.git
cd QuickRead
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:

```env
# Get these from Google Cloud Console
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id

# Get this from Facebook Developer Console
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# Optional: For error monitoring
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 4. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Android: Use your app's SHA-1 fingerprint
   - iOS: Use your bundle identifier
   - Web: Add authorized redirect URIs
5. Copy the client IDs to your `.env` file

#### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Copy the App ID to your `.env` file

### 5. Update app.json

Update the `app.json` file with your app-specific information:

```json
{
  "expo": {
    "name": "QuickRead",
    "slug": "quickread",
    "scheme": "quickread",
    "bundleIdentifier": "com.yourcompany.quickread",
    "package": "com.yourcompany.quickread"
  }
}
```

## Running the App

### Development Mode

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

### Run on Device

```bash
# iOS
npm run ios

# Android
npm run android
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Building for Production

### Configure EAS

```bash
eas login
eas build:configure
```

### Build

```bash
# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

### Submit to Stores

```bash
eas submit --platform ios
eas submit --platform android
```

## Troubleshooting

### Common Issues

**OAuth not working:**
- Verify your client IDs in `.env`
- Check redirect URIs in provider consoles
- Ensure your app scheme matches in `app.json`

**Build failures:**
- Clear cache: `expo start -c`
- Clean node_modules: `rm -rf node_modules && npm install`
- Check EAS build logs for specific errors

**Testing issues:**
- Clear Jest cache: `jest --clearCache`
- Ensure all mocks are properly configured

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [OAuth Best Practices](https://oauth.net/2/)

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review closed issues on GitHub
3. Open a new issue with detailed information
4. Join our community discussions