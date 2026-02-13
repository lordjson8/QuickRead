# Biometric Authentication in React Native

> Fingerprint, Face ID, and device credentials — from basic unlock to production-grade security.

---

## Table of Contents

1. [How Biometrics Work on Mobile](#1-how-biometrics-work-on-mobile)
2. [Setup with expo-local-authentication](#2-setup-with-expo-local-authentication)
3. [Basic Biometric Prompt](#3-basic-biometric-prompt)
4. [Checking Device Capabilities](#4-checking-device-capabilities)
5. [Authentication Flow Patterns](#5-authentication-flow-patterns)
6. [Securing Data with Biometrics](#6-securing-data-with-biometrics)
7. [App Lock / Re-authentication](#7-app-lock--re-authentication)
8. [Biometric + Keychain Integration](#8-biometric--keychain-integration)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [UX Best Practices](#10-ux-best-practices)
11. [Advanced: Biometric-Protected API Tokens](#11-advanced-biometric-protected-api-tokens)
12. [Platform Differences](#12-platform-differences)
13. [Production Checklist](#13-production-checklist)

---

## 1. How Biometrics Work on Mobile

### The Security Model

Biometric data (fingerprint templates, face geometry) **never leaves the device's secure enclave**. Your app never sees the actual biometric data. Here's what happens:

```
1. Your app asks the OS: "Authenticate this user"
2. The OS shows its native biometric prompt
3. The user scans fingerprint / face
4. The OS compares against stored templates in the Secure Enclave (iOS) or TEE (Android)
5. The OS tells your app: "Success" or "Failure"
```

You CANNOT:
- Access raw fingerprint/face data
- Store biometrics yourself
- Bypass the OS biometric UI

You CAN:
- Request authentication
- Check what biometric types are available
- Protect Keychain/Keystore items with biometric access control
- Fall back to device PIN/password

### Biometric Types

| Platform | Types | Secure Hardware |
|----------|-------|----------------|
| iOS | Touch ID (fingerprint), Face ID (face) | Secure Enclave |
| Android | Fingerprint, Face, Iris | TEE / StrongBox |

### Security Levels (Android)

```
Strong (Class 3):   Hardware-backed, can't be spoofed by photos/masks
Weak (Class 2):     Software-based face unlock (some cheap Android phones)
Device Credential:  PIN, pattern, or password
```

Always prefer Strong biometrics. Fall back to Device Credential if needed.

---

## 2. Setup with expo-local-authentication

```bash
npx expo install expo-local-authentication
```

```json
// app.json - add the plugin
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "QuickRead uses Face ID to quickly and securely log you in."
        }
      ]
    ]
  }
}
```

The `faceIDPermission` string is REQUIRED for iOS. It shows in the system permission dialog the first time Face ID is requested. Make it clear and specific to your app.

---

## 3. Basic Biometric Prompt

### Simplest Possible Implementation

```typescript
import * as LocalAuthentication from "expo-local-authentication";

async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Verify your identity",
    fallbackLabel: "Use passcode", // iOS: button to fall back to device passcode
    disableDeviceFallback: false,  // Allow PIN/password if biometric fails
    cancelLabel: "Cancel",         // iOS: cancel button text
  });

  if (result.success) {
    console.log("Authenticated!");
    return true;
  } else {
    console.log("Authentication failed:", result.error);
    return false;
  }
}
```

### What the User Sees

```
iOS (Face ID):
  ┌────────────────────────┐
  │     [Face ID Icon]     │
  │                        │
  │  Verify your identity  │
  │                        │
  │  [Use passcode]        │
  │  [Cancel]              │
  └────────────────────────┘

iOS (Touch ID):
  ┌────────────────────────┐
  │  [Fingerprint Icon]    │
  │                        │
  │  Verify your identity  │
  │                        │
  │  [Use passcode]        │
  │  [Cancel]              │
  └────────────────────────┘

Android:
  ┌────────────────────────┐
  │  Biometric Sign In     │
  │                        │
  │  Verify your identity  │
  │                        │
  │  [Fingerprint Icon]    │
  │                        │
  │         [Cancel]       │
  └────────────────────────┘
```

---

## 4. Checking Device Capabilities

### Before prompting, always check what's available:

```typescript
import * as LocalAuthentication from "expo-local-authentication";

interface BiometricCapability {
  isAvailable: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
  hasFingerprint: boolean;
  hasFaceRecognition: boolean;
  hasIris: boolean;
  hasEnrolledBiometrics: boolean;
  securityLevel: LocalAuthentication.SecurityLevel;
}

async function checkBiometricCapability(): Promise<BiometricCapability> {
  // 1. Is any biometric hardware present?
  const isAvailable = await LocalAuthentication.hasHardwareAsync();

  // 2. What types of biometrics are available?
  const biometricTypes =
    await LocalAuthentication.supportedAuthenticationTypesAsync();

  // 3. Has the user enrolled at least one biometric?
  const hasEnrolledBiometrics = await LocalAuthentication.isEnrolledAsync();

  // 4. What security level?
  const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

  return {
    isAvailable,
    biometricTypes,
    hasFingerprint: biometricTypes.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    ),
    hasFaceRecognition: biometricTypes.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    ),
    hasIris: biometricTypes.includes(
      LocalAuthentication.AuthenticationType.IRIS
    ),
    hasEnrolledBiometrics,
    securityLevel,
  };
}
```

### Biometric Type Labels

```typescript
function getBiometricLabel(
  types: LocalAuthentication.AuthenticationType[]
): string {
  if (Platform.OS === "ios") {
    // iOS only has Touch ID or Face ID, never both on one device
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    }
  }

  if (Platform.OS === "android") {
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint";
    }
    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return "Face Recognition";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris Scan";
    }
  }

  return "Biometrics";
}

// Usage in UI
const biometricLabel = getBiometricLabel(capability.biometricTypes);

<Text>Sign in with {biometricLabel}</Text>
// "Sign in with Face ID" on iPhone
// "Sign in with Fingerprint" on Android
```

### Biometric Icon

```typescript
import { Fingerprint, ScanFace, Eye } from "lucide-react-native";

function BiometricIcon({
  types,
  size = 24,
}: {
  types: LocalAuthentication.AuthenticationType[];
  size?: number;
}) {
  if (
    types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return <ScanFace size={size} />;
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return <Fingerprint size={size} />;
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return <Eye size={size} />;
  }
  return <Fingerprint size={size} />; // Fallback
}
```

---

## 5. Authentication Flow Patterns

### Pattern 1: Biometric Login (Skip Password Entry)

```typescript
// features/auth/hooks/useBiometricLogin.ts

export function useBiometricLogin() {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometrics");
  const { setUser } = useAuthStore();

  // Check on mount if biometric login is set up
  useEffect(() => {
    async function check() {
      const capability = await checkBiometricCapability();
      if (!capability.isAvailable || !capability.hasEnrolledBiometrics) return;

      // Check if user previously enabled biometric login
      const enabled = await SecureStore.getItemAsync("biometric_login_enabled");
      setIsBiometricEnabled(enabled === "true");
      setBiometricType(getBiometricLabel(capability.biometricTypes));
    }
    check();
  }, []);

  // Attempt biometric authentication
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Sign in to QuickRead`,
      fallbackLabel: "Use password",
      cancelLabel: "Cancel",
    });

    if (!result.success) return false;

    // Retrieve stored credentials (protected by biometric)
    const storedToken = await SecureStore.getItemAsync("access_token", {
      requireAuthentication: true, // THIS is the key - biometric required to read
    });

    if (!storedToken) return false;

    // Validate token is still valid
    try {
      const { data: user } = await api.get("/auth/me/", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(user);
      return true;
    } catch {
      // Token expired, need regular login
      return false;
    }
  };

  // Enable biometric login after successful password login
  const enableBiometricLogin = async (accessToken: string) => {
    const capability = await checkBiometricCapability();
    if (!capability.isAvailable || !capability.hasEnrolledBiometrics) return;

    // Store token with biometric protection
    await SecureStore.setItemAsync("access_token", accessToken, {
      requireAuthentication: true,
      authenticationPrompt: "Authenticate to enable biometric login",
    });

    await SecureStore.setItemAsync("biometric_login_enabled", "true");
    setIsBiometricEnabled(true);
  };

  const disableBiometricLogin = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.setItemAsync("biometric_login_enabled", "false");
    setIsBiometricEnabled(false);
  };

  return {
    isBiometricEnabled,
    biometricType,
    authenticateWithBiometrics,
    enableBiometricLogin,
    disableBiometricLogin,
  };
}
```

```typescript
// Login screen with biometric option
function LoginScreen() {
  const {
    isBiometricEnabled,
    biometricType,
    authenticateWithBiometrics,
  } = useBiometricLogin();

  // Auto-prompt biometric on screen mount
  useEffect(() => {
    if (isBiometricEnabled) {
      authenticateWithBiometrics().then((success) => {
        if (success) router.replace("/(tabs)");
      });
    }
  }, [isBiometricEnabled]);

  return (
    <View className="flex-1 bg-background p-6">
      {/* Regular login form */}
      <LoginForm />

      {/* Biometric button */}
      {isBiometricEnabled && (
        <Pressable
          onPress={async () => {
            const success = await authenticateWithBiometrics();
            if (success) router.replace("/(tabs)");
          }}
          className="mt-6 items-center"
        >
          <BiometricIcon types={biometricCapability.biometricTypes} size={48} />
          <Text className="mt-2 text-sm text-foreground-secondary">
            Sign in with {biometricType}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

### Pattern 2: Biometric to Confirm Sensitive Actions

```typescript
// Use before: payments, changing password, deleting account, viewing sensitive data

async function confirmSensitiveAction(
  actionDescription: string
): Promise<boolean> {
  const capability = await checkBiometricCapability();

  if (!capability.hasEnrolledBiometrics) {
    // No biometrics - fall back to re-entering password
    return showPasswordConfirmDialog();
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: actionDescription,
    fallbackLabel: "Enter password",
    disableDeviceFallback: false,
  });

  return result.success;
}

// Usage
async function handleDeleteAccount() {
  const confirmed = await confirmSensitiveAction(
    "Confirm account deletion"
  );

  if (!confirmed) return;

  // Proceed with deletion
  await api.delete("/auth/account/");
}

async function handleViewPaymentDetails() {
  const confirmed = await confirmSensitiveAction(
    "Verify to view payment details"
  );

  if (!confirmed) return;

  // Show sensitive data
  setShowPaymentDetails(true);
}
```

### Pattern 3: Biometric Toggle in Settings

```typescript
function SecuritySettings() {
  const {
    isBiometricEnabled,
    biometricType,
    enableBiometricLogin,
    disableBiometricLogin,
  } = useBiometricLogin();

  const [capability, setCapability] = useState<BiometricCapability | null>(null);

  useEffect(() => {
    checkBiometricCapability().then(setCapability);
  }, []);

  if (!capability?.isAvailable || !capability.hasEnrolledBiometrics) {
    return null; // Don't show toggle if device doesn't support biometrics
  }

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      // Verify identity before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType}`,
      });
      if (result.success) {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) await enableBiometricLogin(token);
      }
    } else {
      await disableBiometricLogin();
    }
  };

  return (
    <View className="flex-row items-center justify-between rounded-xl bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <BiometricIcon types={capability.biometricTypes} />
        <View>
          <Text className="font-medium text-foreground">
            Sign in with {biometricType}
          </Text>
          <Text className="text-sm text-foreground-secondary">
            Quick and secure sign in
          </Text>
        </View>
      </View>
      <Switch
        value={isBiometricEnabled}
        onValueChange={handleToggle}
        trackColor={{ false: "#E5E7EB", true: "#007A5E" }}
      />
    </View>
  );
}
```

---

## 6. Securing Data with Biometrics

### expo-secure-store with Biometric Protection

```typescript
import * as SecureStore from "expo-secure-store";

// Store a value that REQUIRES biometric to read
await SecureStore.setItemAsync("sensitive_key", "sensitive_value", {
  // iOS: Requires biometric to access
  // Android: Requires biometric to decrypt
  requireAuthentication: true,
  // Prompt shown when reading the value
  authenticationPrompt: "Authenticate to access your data",
});

// Reading this value will trigger the biometric prompt
try {
  const value = await SecureStore.getItemAsync("sensitive_key", {
    requireAuthentication: true,
    authenticationPrompt: "Authenticate to access your data",
  });
} catch (error) {
  // User cancelled or authentication failed
  console.log("Could not access secure data:", error);
}
```

### What Gets Protected

```
With requireAuthentication: true:
  iOS:   Value stored in Keychain with .biometryCurrentSet access control
         → If user adds/removes a fingerprint, the value is invalidated
  Android: Value encrypted with a key that requires biometric unlock
           → Stored in Android Keystore backed by TEE
```

### Keychain Access Control Levels (iOS)

```typescript
// expo-secure-store abstracts these, but understand what's happening:

// .whenUnlocked          - Accessible when device is unlocked (default)
// .afterFirstUnlock      - Accessible after first unlock since boot
// .biometryCurrentSet    - Requires biometric, invalidated if biometrics change
// .biometryAny           - Requires biometric, survives biometric changes
// .devicePasscode        - Requires device passcode
```

---

## 7. App Lock / Re-authentication

### Auto-lock When App Goes to Background

```typescript
// hooks/useAppLock.ts
import { useRef, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

const LOCK_TIMEOUT_MS = 30_000; // Lock after 30 seconds in background

export function useAppLock() {
  const [isLocked, setIsLocked] = useState(false);
  const backgroundTimestamp = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current === "active" &&
        nextState.match(/inactive|background/)
      ) {
        // App going to background - record timestamp
        backgroundTimestamp.current = Date.now();
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        // App coming to foreground
        if (backgroundTimestamp.current) {
          const elapsed = Date.now() - backgroundTimestamp.current;

          if (elapsed > LOCK_TIMEOUT_MS) {
            setIsLocked(true);
          }
        }
        backgroundTimestamp.current = null;
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  const unlock = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock QuickRead",
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  return { isLocked, unlock };
}
```

```typescript
// app/_layout.tsx - Show lock screen overlay
export default function RootLayout() {
  const { isLocked, unlock } = useAppLock();
  const isLockEnabled = usePreferencesStore((s) => s.appLockEnabled);

  return (
    <>
      <Stack />
      {isLockEnabled && isLocked && <LockScreen onUnlock={unlock} />}
    </>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => Promise<boolean> }) {
  // Auto-prompt on mount
  useEffect(() => {
    onUnlock();
  }, []);

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-background">
      <Image
        source={require("@/assets/images/icon.png")}
        className="mb-8 h-20 w-20"
      />
      <Text className="mb-2 text-xl font-bold text-foreground">
        QuickRead is Locked
      </Text>
      <Text className="mb-8 text-foreground-secondary">
        Authenticate to continue
      </Text>
      <Pressable
        onPress={onUnlock}
        className="rounded-xl bg-primary px-8 py-4"
      >
        <Text className="font-semibold text-primary-foreground">Unlock</Text>
      </Pressable>
    </View>
  );
}
```

### Privacy Screen (Blur When in App Switcher)

```typescript
// Prevent screenshots of sensitive content in app switcher
import { BlurView } from "expo-blur";

function PrivacyOverlay() {
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setIsBackground(state !== "active");
    });
    return () => sub.remove();
  }, []);

  if (!isBackground) return null;

  return (
    <BlurView
      intensity={100}
      tint="default"
      className="absolute inset-0 z-50"
    />
  );
}
```

---

## 8. Biometric + Keychain Integration

### The Gold Standard: Crypto-Backed Biometric Auth

For the highest security, use biometric authentication to unlock a cryptographic key that signs API requests:

```typescript
// This is the advanced pattern used by banking apps

// Step 1: Generate a keypair during setup
import * as Crypto from "expo-crypto";

async function setupBiometricKeyPair() {
  // Generate a random secret (or use an asymmetric keypair if your backend supports it)
  const secret = await Crypto.getRandomBytesAsync(32);
  const secretBase64 = btoa(String.fromCharCode(...secret));

  // Store it with biometric protection
  await SecureStore.setItemAsync("biometric_secret", secretBase64, {
    requireAuthentication: true,
    authenticationPrompt: "Set up biometric authentication",
  });

  // Register this secret with your backend
  await api.post("/auth/biometric/register/", {
    deviceId: await getDeviceId(),
    publicKey: secretBase64, // In production, use asymmetric crypto
  });
}

// Step 2: Authenticate using the biometric-protected secret
async function biometricSignIn() {
  // This triggers the biometric prompt
  const secret = await SecureStore.getItemAsync("biometric_secret", {
    requireAuthentication: true,
    authenticationPrompt: "Sign in with biometrics",
  });

  if (!secret) throw new Error("Biometric secret not found");

  // Use the secret to authenticate with your backend
  const { data } = await api.post("/auth/biometric/verify/", {
    deviceId: await getDeviceId(),
    signature: secret,
    timestamp: Date.now(),
  });

  return data; // { accessToken, refreshToken, user }
}
```

---

## 9. Error Handling & Edge Cases

### All Possible Error Codes

```typescript
import * as LocalAuthentication from "expo-local-authentication";

async function authenticateWithFullErrorHandling(): Promise<{
  success: boolean;
  message: string;
}> {
  // Pre-checks
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return {
      success: false,
      message: "Your device doesn't support biometric authentication",
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return {
      success: false,
      message: "No biometrics enrolled. Set up fingerprint or face in Settings.",
    };
  }

  // Attempt authentication
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Verify your identity",
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { success: true, message: "Authenticated" };
  }

  // Handle specific errors
  switch (result.error) {
    case "user_cancel":
      return { success: false, message: "Authentication cancelled" };

    case "system_cancel":
      // Another app came to foreground, or system interrupted
      return { success: false, message: "Authentication interrupted" };

    case "app_cancel":
      return { success: false, message: "Authentication cancelled by app" };

    case "authentication_failed":
      // Biometric didn't match (wrong finger, face not recognized)
      return {
        success: false,
        message: "Authentication failed. Please try again.",
      };

    case "not_enrolled":
      return {
        success: false,
        message: "Please set up biometrics in your device Settings",
      };

    case "hardware_unavailable":
      return {
        success: false,
        message: "Biometric hardware is temporarily unavailable",
      };

    case "lockout":
      // Too many failed attempts - temporary lockout
      return {
        success: false,
        message: "Too many failed attempts. Try again in 30 seconds.",
      };

    case "lockout_permanent":
      // Too many failed attempts - requires device PIN to reset
      return {
        success: false,
        message: "Biometric locked. Use your device passcode to unlock.",
      };

    case "passcode_not_set":
      return {
        success: false,
        message: "Please set a device passcode in Settings first",
      };

    default:
      return {
        success: false,
        message: "Authentication failed. Please try again.",
      };
  }
}
```

### Edge Cases to Handle

```
1. User removes all fingerprints while app is running
   → isEnrolledAsync() returns false
   → Gracefully disable biometric features

2. User adds a new fingerprint
   → On iOS with .biometryCurrentSet, Keychain items are INVALIDATED
   → User must re-authenticate with password and re-enroll

3. Device has face unlock but it's weak (Android Class 2)
   → getEnrolledLevelAsync() returns SECURITY_LEVEL_BIOMETRIC_WEAK
   → Consider requiring device credential fallback for sensitive operations

4. Biometric lockout after too many failures
   → Show "Use passcode" option
   → Or wait for the cooldown period

5. Biometric prompt while app is in background
   → authenticateAsync will fail with "system_cancel"
   → Retry when app comes to foreground
```

---

## 10. UX Best Practices

### Do

```
- Tell users WHY you need biometric before prompting
- Show which biometric type (Face ID vs Fingerprint) in UI text
- Provide a fallback (password, PIN) if biometric fails
- Let users opt out of biometric auth
- Auto-prompt biometric on login screen if enabled
- Show a loading state while waiting for biometric result
- Use biometric for convenience, not as the ONLY auth factor
```

### Don't

```
- Don't prompt biometric on first app open without explanation
- Don't silently fail if biometric is unavailable
- Don't require biometric for every single action
- Don't show biometric option if device doesn't support it
- Don't show "Fingerprint" on an iPhone with Face ID
- Don't make biometric the only way to access the app
```

### Recommended UX Flow

```
First login:
  1. User enters email + password
  2. Login succeeds
  3. Show dialog: "Enable Face ID for faster sign-in?"
  4. [Enable] → prompt biometric → store credentials
  5. [Not Now] → skip, ask again later

Subsequent opens:
  1. App opens to login screen
  2. Biometric prompt appears automatically
  3. User authenticates → instant access
  4. If cancel/fail → show email + password form

Settings:
  - Toggle: "Sign in with Face ID" (on/off)
  - If turning ON → verify with biometric first
  - If turning OFF → no verification needed
```

---

## 11. Advanced: Biometric-Protected API Tokens

### The Complete Flow

```typescript
// This is how banking/fintech apps do it

// 1. After successful password login, store tokens with biometric protection
async function onLoginSuccess(tokens: { access: string; refresh: string }) {
  const capability = await checkBiometricCapability();

  if (capability.hasEnrolledBiometrics) {
    // Store with biometric protection
    await SecureStore.setItemAsync(
      "bio_tokens",
      JSON.stringify(tokens),
      {
        requireAuthentication: true,
        authenticationPrompt: "Secure your account with biometrics",
      }
    );
  }

  // Also store normally for regular access
  await SecureStore.setItemAsync("access_token", tokens.access);
  await SecureStore.setItemAsync("refresh_token", tokens.refresh);
}

// 2. On app reopen, use biometric-protected tokens
async function biometricQuickLogin(): Promise<boolean> {
  try {
    // This triggers the biometric prompt
    const tokensJson = await SecureStore.getItemAsync("bio_tokens", {
      requireAuthentication: true,
      authenticationPrompt: "Sign in to QuickRead",
    });

    if (!tokensJson) return false;

    const tokens = JSON.parse(tokensJson);

    // Validate token with server
    const { data: user } = await api.get("/auth/me/", {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });

    // Update stores
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setTokens(tokens.access, tokens.refresh);

    return true;
  } catch (error) {
    // Token expired or biometric failed
    return false;
  }
}

// 3. When tokens refresh, update the biometric-protected copy too
async function onTokenRefresh(newTokens: { access: string; refresh: string }) {
  const biometricEnabled = await SecureStore.getItemAsync(
    "biometric_login_enabled"
  );

  if (biometricEnabled === "true") {
    await SecureStore.setItemAsync(
      "bio_tokens",
      JSON.stringify(newTokens),
      { requireAuthentication: false } // Don't prompt during background refresh
    );
  }
}
```

---

## 12. Platform Differences

### iOS Specifics

```
Face ID:
  - Requires NSFaceIDUsageDescription in Info.plist (Expo handles via plugin)
  - First prompt shows system permission dialog
  - If denied, must go to Settings > QuickRead > Face ID to re-enable
  - Two failed attempts → "Use Passcode" button appears
  - Five failed attempts → device passcode required

Touch ID:
  - No permission dialog needed (unlike Face ID)
  - Three failed attempts → passcode fallback
  - Works in background

Keychain:
  - Items with kSecAccessControlBiometryCurrentSet are invalidated if
    biometric enrollment changes (fingerprint added/removed)
  - Items with kSecAccessControlBiometryAny survive enrollment changes
```

### Android Specifics

```
BiometricPrompt:
  - System-rendered dialog (you can't customize the look)
  - BIOMETRIC_STRONG (Class 3) = hardware-backed
  - BIOMETRIC_WEAK (Class 2) = may be software-based
  - Some devices have "convenience" face unlock that's Class 2

Keystore:
  - Keys can require biometric auth for each use
  - setUserAuthenticationRequired(true)
  - Keys are backed by TEE (Trusted Execution Environment)
  - On devices with StrongBox, keys are in dedicated secure hardware

Quirks:
  - Some Samsung devices show their own biometric UI
  - Some Xiaomi devices have buggy fingerprint implementations
  - Always test on real devices, not just emulators
```

---

## 13. Production Checklist

```
Setup:
  [ ] expo-local-authentication installed and configured
  [ ] iOS Face ID permission string is user-friendly and specific
  [ ] Biometric type detection works on both platforms
  [ ] Appropriate icon shown (Face ID icon vs fingerprint icon)
  [ ] Correct label shown ("Face ID" vs "Fingerprint" vs "Biometrics")

Security:
  [ ] Sensitive tokens stored with requireAuthentication: true
  [ ] Biometric is not the ONLY authentication method (fallback exists)
  [ ] Re-authentication required for sensitive actions
  [ ] Tokens invalidated on biometric enrollment change (if needed)
  [ ] No biometric data stored in your own storage (OS handles it all)

UX:
  [ ] User explicitly opts into biometric login (not forced)
  [ ] Graceful degradation when biometrics unavailable
  [ ] All error states handled with user-friendly messages
  [ ] Biometric toggle in settings works correctly
  [ ] Auto-prompt on login when biometric is enabled
  [ ] Password fallback always accessible

Edge Cases:
  [ ] Works when biometrics are removed while app is running
  [ ] Works after device reboot (some Keychain items need first unlock)
  [ ] Handles lockout (too many failed attempts)
  [ ] Handles system cancellation (incoming call, app switch)
  [ ] Works on devices with only weak biometrics (Android)
  [ ] Privacy screen (blur) in app switcher for sensitive screens

Testing:
  [ ] Tested on real iOS device with Face ID
  [ ] Tested on real iOS device with Touch ID (if supporting older devices)
  [ ] Tested on real Android device with fingerprint
  [ ] Tested on Android device with face unlock
  [ ] Tested with biometric lockout scenario
  [ ] Tested with no biometrics enrolled
  [ ] Tested with biometrics hardware unavailable
```
