# Theming in React Native: Dark Mode, Light Mode & Beyond

> From basic color switching to a production-grade, fully dynamic theming system.

---

## Table of Contents

1. [How Theming Works in Mobile](#1-how-theming-works-in-mobile)
2. [Without NativeWind: Pure React Native Theming](#2-without-nativewind-pure-react-native-theming)
3. [With NativeWind: Tailwind-Powered Theming](#3-with-nativewind-tailwind-powered-theming)
4. [System Theme Detection](#4-system-theme-detection)
5. [User Theme Preference (Override System)](#5-user-theme-preference-override-system)
6. [Dynamic Color Tokens](#6-dynamic-color-tokens)
7. [Themed Components Library](#7-themed-components-library)
8. [StatusBar & Navigation Bar Theming](#8-statusbar--navigation-bar-theming)
9. [Splash Screen & App Icon Theming](#9-splash-screen--app-icon-theming)
10. [Advanced: Multiple Themes (Not Just Dark/Light)](#10-advanced-multiple-themes-not-just-darklight)
11. [Advanced: Animated Theme Transitions](#11-advanced-animated-theme-transitions)
12. [Production Checklist](#12-production-checklist)

---

## 1. How Theming Works in Mobile

### The Core Concept

Theming is about **separating color values from components**. Instead of hardcoding `backgroundColor: "#FFFFFF"`, you reference a token like `colors.background` that resolves to `#FFFFFF` in light mode and `#121212` in dark mode.

### Three Approaches

| Approach | How It Works | Best For |
|----------|-------------|----------|
| React Context | JS-level theme provider, StyleSheet.create per theme | Full control, no external deps |
| NativeWind | CSS variables + Tailwind classes, dark: prefix | Your stack, fastest DX |
| UI Libraries | Pre-built themed components (Tamagui, Gluestack) | Rapid prototyping |

### Color Theory for Dark Mode

Dark mode is NOT just inverting colors. Follow Material Design guidelines:

```
Light Mode:
  Background: White (#FFFFFF) or near-white (#F9F9F9)
  Surface:    Slightly darker (#F5F5F5)
  Text:       Near-black (#212121) - never pure black
  Primary:    Your brand color at full saturation

Dark Mode:
  Background: Dark gray (#121212) - never pure black (#000000)
  Surface:    Lighter gray (#1E1E1E)
  Text:       Off-white (#E0E0E0) - never pure white (#FFFFFF)
  Primary:    Your brand color desaturated/lightened for contrast
```

Why not pure black? On OLED screens, pure black next to any color creates a harsh "smearing" effect during scrolling. `#121212` eliminates this.

---

## 2. Without NativeWind: Pure React Native Theming

### Level 1: Basic Context Theme

```typescript
// theme/colors.ts
export const lightColors = {
  background: "#F9F9F9",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  text: "#212121",
  textSecondary: "#757575",
  textTertiary: "#9E9E9E",
  primary: "#007A5E",
  primaryContainer: "#E8F0ED",
  secondary: "#FFC107",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  shadow: "#000000",
  skeleton: "#E0E0E0",
};

export const darkColors: typeof lightColors = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#2C2C2C",
  text: "#E0E0E0",
  textSecondary: "#A0A0A0",
  textTertiary: "#707070",
  primary: "#4CAF93",        // Lighter green for dark bg
  primaryContainer: "#1B3A30",
  secondary: "#FFD54F",      // Lighter amber
  border: "#333333",
  error: "#FF6B6B",
  success: "#4ADE80",
  shadow: "#000000",
  skeleton: "#2C2C2C",
};

export type ThemeColors = typeof lightColors;
```

```typescript
// theme/ThemeContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { lightColors, darkColors, type ThemeColors } from "./colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ colors, isDark, mode, setMode }),
    [colors, isDark, mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

```typescript
// Usage in any component
import { useTheme } from "@/theme/ThemeContext";

function BookCard({ title, author }: { title: string; author: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
        {author}
      </Text>
    </View>
  );
}
```

### Level 2: StyleSheet Factory Pattern (Better Performance)

The problem with inline styles: they create new objects every render. StyleSheet.create is optimized by RN, but it can't accept dynamic theme values. Solution: a factory function.

```typescript
// theme/createStyles.ts
import { StyleSheet } from "react-native";
import { type ThemeColors } from "./colors";

// Factory that takes colors and returns styles
type StyleFactory<T extends StyleSheet.NamedStyles<T>> = (
  colors: ThemeColors
) => T;

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: StyleFactory<T>
): T {
  const { colors } = useTheme();
  // useMemo ensures we only recreate styles when theme changes
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
```

```typescript
// Usage
const makeStyles = (colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});

function BookCard({ title, author }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{author}</Text>
    </View>
  );
}
```

### Level 3: Typed Theme with Spacing, Typography, and Shadows

```typescript
// theme/theme.ts
import { lightColors, darkColors, type ThemeColors } from "./colors";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  button: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  radius,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  radius,
  isDark: true,
};
```

```typescript
// Now your style factories use the full theme
const makeStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
});
```

---

## 3. With NativeWind: Tailwind-Powered Theming

This is your stack. NativeWind makes theming dramatically simpler.

### How NativeWind Dark Mode Works

NativeWind uses CSS variables under the hood. When you add the `dark:` prefix, it swaps CSS custom properties based on the color scheme.

### Level 1: Basic dark: Prefix

```typescript
// This just works out of the box with NativeWind
function BookCard({ title, author }: Props) {
  return (
    <View className="rounded-xl bg-white p-4 dark:bg-neutral-900">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </Text>
      <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {author}
      </Text>
    </View>
  );
}
```

### Level 2: Semantic Color Tokens (What You Should Do)

Instead of specifying light AND dark colors on every element, define semantic tokens once in your Tailwind config:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // Use class-based dark mode
  theme: {
    extend: {
      colors: {
        // Semantic tokens - define ONCE, works in both modes
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "foreground-secondary": "rgb(var(--color-foreground-secondary) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
          container: "rgb(var(--color-primary-container) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground: "rgb(var(--color-destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-background: 249 249 249;       /* #F9F9F9 */
    --color-surface: 255 255 255;          /* #FFFFFF */
    --color-surface-variant: 245 245 245;  /* #F5F5F5 */
    --color-foreground: 33 33 33;          /* #212121 */
    --color-foreground-secondary: 117 117 117; /* #757575 */
    --color-primary: 0 122 94;             /* #007A5E */
    --color-primary-foreground: 255 255 255;
    --color-primary-container: 232 240 237; /* #E8F0ED */
    --color-secondary: 255 193 7;          /* #FFC107 */
    --color-secondary-foreground: 0 77 59;
    --color-destructive: 239 68 68;
    --color-destructive-foreground: 255 255 255;
    --color-border: 229 231 235;           /* #E5E7EB */
    --color-muted: 241 245 249;
    --color-muted-foreground: 100 116 139;
  }

  .dark {
    --color-background: 18 18 18;          /* #121212 */
    --color-surface: 30 30 30;             /* #1E1E1E */
    --color-surface-variant: 44 44 44;     /* #2C2C2C */
    --color-foreground: 224 224 224;       /* #E0E0E0 */
    --color-foreground-secondary: 160 160 160;
    --color-primary: 76 175 147;           /* #4CAF93 */
    --color-primary-foreground: 255 255 255;
    --color-primary-container: 27 58 48;
    --color-secondary: 255 213 79;
    --color-secondary-foreground: 27 58 48;
    --color-destructive: 255 107 107;
    --color-destructive-foreground: 255 255 255;
    --color-border: 51 51 51;
    --color-muted: 44 44 44;
    --color-muted-foreground: 140 140 140;
  }
}
```

Now your components become dead simple:

```typescript
// No dark: prefix needed! Colors auto-switch.
function BookCard({ title, author }: Props) {
  return (
    <View className="rounded-xl bg-surface p-4 border border-border">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">{author}</Text>
    </View>
  );
}
```

### Level 3: NativeWind Color Scheme Control

```typescript
// app/_layout.tsx
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export default function RootLayout() {
  // NativeWind gives you programmatic control
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativeWindColorScheme();

  return (
    <Stack>
      {/* colorScheme is now controlled by NativeWind */}
    </Stack>
  );
}

// settings screen
function ThemeSelector() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  return (
    <View className="gap-3">
      <ThemeOption
        label="Light"
        selected={colorScheme === "light"}
        onPress={() => setColorScheme("light")}
      />
      <ThemeOption
        label="Dark"
        selected={colorScheme === "dark"}
        onPress={() => setColorScheme("dark")}
      />
      <ThemeOption
        label="System"
        selected={colorScheme === "system"}
        onPress={() => setColorScheme("system")}
      />
    </View>
  );
}
```

---

## 4. System Theme Detection

### Detecting System Theme Changes

```typescript
import { useColorScheme, Appearance } from "react-native";

// Hook-based (reactive - updates when user changes system theme)
function MyComponent() {
  const colorScheme = useColorScheme(); // "light" | "dark" | null

  // This re-renders automatically when user toggles system dark mode
}

// Imperative (for one-time checks)
const currentScheme = Appearance.getColorScheme();

// Listener (for side effects)
useEffect(() => {
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    console.log("System theme changed to:", colorScheme);
    // Update analytics, sync with backend, etc.
  });

  return () => subscription.remove();
}, []);
```

### Platform Behavior

```
iOS:
  - Respects Settings > Display & Brightness > Appearance
  - Can be set per-app in Settings > [App] > Appearance
  - Scheduled dark mode (sunset to sunrise) is supported

Android:
  - Respects Settings > Display > Dark theme
  - Some OEMs add their own dark mode toggles
  - Quick Settings tile for fast switching

Expo:
  - useColorScheme() works on both platforms
  - expo-system-ui syncs the root view background
```

---

## 5. User Theme Preference (Override System)

### Persisting Theme Choice

```typescript
// store/preferences.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface PreferencesStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      themeMode: "system",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

```typescript
// hooks/useAppTheme.ts
import { useColorScheme } from "react-native";
import { usePreferencesStore } from "@/store/preferences.store";

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const resolvedScheme =
    themeMode === "system" ? (systemScheme ?? "light") : themeMode;

  return {
    isDark: resolvedScheme === "dark",
    colorScheme: resolvedScheme,
    themeMode,
    setThemeMode,
  };
}
```

### Syncing NativeWind with Persisted Preference

```typescript
// app/_layout.tsx
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { usePreferencesStore } from "@/store/preferences.store";

export default function RootLayout() {
  const { setColorScheme } = useNativeWindColorScheme();
  const themeMode = usePreferencesStore((s) => s.themeMode);

  // Sync persisted preference to NativeWind on mount and changes
  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  return <Stack />;
}
```

---

## 6. Dynamic Color Tokens

### Beyond Light/Dark: Dynamic Accent Colors

Let users pick their own accent/primary color:

```typescript
// store/preferences.store.ts
interface PreferencesStore {
  themeMode: ThemeMode;
  accentColor: string; // User-chosen accent
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

// Preset accent colors
export const ACCENT_PRESETS = [
  { name: "Teal", value: "#007A5E" },
  { name: "Blue", value: "#2563EB" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Rose", value: "#E11D48" },
  { name: "Orange", value: "#EA580C" },
  { name: "Emerald", value: "#059669" },
] as const;
```

```typescript
// With NativeWind - dynamically update CSS variables
import { vars } from "nativewind";

function RootLayout() {
  const accentColor = usePreferencesStore((s) => s.accentColor);

  // Convert hex to RGB for CSS variables
  const rgb = hexToRgb(accentColor); // "0 122 94"

  return (
    <View style={vars({ "--color-primary": rgb })}>
      <Stack />
    </View>
  );
}

// Without NativeWind - update context
function ThemeProvider({ children }) {
  const accentColor = usePreferencesStore((s) => s.accentColor);

  const colors = useMemo(
    () => ({
      ...baseColors,
      primary: accentColor,
      primaryContainer: lighten(accentColor, 0.8),
    }),
    [accentColor]
  );

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Material You / Dynamic Colors (Android 12+)

```typescript
// Android 12+ supports extracting colors from the user's wallpaper
import { DynamicColorIOS, PlatformColor } from "react-native";

// iOS
const iosSystemColor = PlatformColor("systemBlue"); // Uses iOS system blue

// Android Material You
const androidDynamic = PlatformColor("@android:color/system_accent1_500");

// Cross-platform with fallback
const accentColor = Platform.select({
  ios: PlatformColor("systemBlue"),
  android: PlatformColor("@android:color/system_accent1_500"),
  default: "#007A5E",
});
```

---

## 7. Themed Components Library

### Build Once, Theme Automatically

```typescript
// components/ui/ThemedText.tsx
import { Text, type TextProps } from "react-native";
import { cn } from "@/utils/cn";

interface ThemedTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "bodySmall" | "caption" | "label";
  color?: "default" | "secondary" | "tertiary" | "primary" | "error";
}

const variantClasses = {
  h1: "text-3xl font-bold leading-10",
  h2: "text-2xl font-bold leading-8",
  h3: "text-xl font-semibold leading-7",
  body: "text-base leading-6",
  bodySmall: "text-sm leading-5",
  caption: "text-xs leading-4",
  label: "text-sm font-medium leading-5",
};

const colorClasses = {
  default: "text-foreground",
  secondary: "text-foreground-secondary",
  tertiary: "text-muted-foreground",
  primary: "text-primary",
  error: "text-destructive",
};

export function ThemedText({
  variant = "body",
  color = "default",
  className,
  ...props
}: ThemedTextProps) {
  return (
    <Text
      className={cn(variantClasses[variant], colorClasses[color], className)}
      {...props}
    />
  );
}
```

```typescript
// components/ui/ThemedCard.tsx
export function ThemedCard({
  children,
  variant = "default",
  className,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-surface border border-border",
    elevated: "bg-surface shadow-md",
    outlined: "bg-transparent border-2 border-border",
    filled: "bg-surface-variant",
  };

  return (
    <View
      className={cn("rounded-xl p-4", variants[variant], className)}
      {...props}
    >
      {children}
    </View>
  );
}
```

### Themed Icons

```typescript
// components/ui/ThemedIcon.tsx
import { useTheme } from "@/hooks/useAppTheme";

export function ThemedIcon({
  icon: Icon,
  size = 24,
  color = "foreground",
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  size?: number;
  color?: "foreground" | "secondary" | "primary" | "error";
}) {
  const { colors } = useTheme();

  const colorMap = {
    foreground: colors.text,
    secondary: colors.textSecondary,
    primary: colors.primary,
    error: colors.error,
  };

  return <Icon size={size} color={colorMap[color]} />;
}
```

---

## 8. StatusBar & Navigation Bar Theming

### StatusBar

```typescript
import { StatusBar } from "expo-status-bar";

function RootLayout() {
  const { isDark } = useAppTheme();

  return (
    <>
      {/* "auto" detects based on background color */}
      {/* "light" = white text (for dark backgrounds) */}
      {/* "dark" = dark text (for light backgrounds) */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack />
    </>
  );
}
```

### System UI Background

```typescript
// Sync the root native view background with your theme
import * as SystemUI from "expo-system-ui";

useEffect(() => {
  SystemUI.setBackgroundColorAsync(isDark ? "#121212" : "#F9F9F9");
}, [isDark]);
```

### Navigation Bar (Android)

```typescript
import * as NavigationBar from "expo-navigation-bar";

useEffect(() => {
  if (Platform.OS === "android") {
    NavigationBar.setBackgroundColorAsync(isDark ? "#121212" : "#FFFFFF");
    NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  }
}, [isDark]);
```

### Tab Bar & Header Theming

```typescript
// app/(tabs)/_layout.tsx
export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      {/* screens */}
    </Tabs>
  );
}
```

---

## 9. Splash Screen & App Icon Theming

### Themed Splash Screen

```json
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-light.png",
      "backgroundColor": "#F9F9F9"
    },
    "ios": {
      "splash": {
        "dark": {
          "image": "./assets/splash-dark.png",
          "backgroundColor": "#121212"
        }
      }
    },
    "android": {
      "splash": {
        "dark": {
          "image": "./assets/splash-dark.png",
          "backgroundColor": "#121212"
        }
      }
    }
  }
}
```

### Adaptive App Icons (Android)

```json
// app.json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "monochromeImage": "./assets/adaptive-icon-mono.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

The `monochromeImage` is used on Android 13+ for themed icons that match the user's wallpaper colors.

---

## 10. Advanced: Multiple Themes (Not Just Dark/Light)

### Theme Registry Pattern

```typescript
// theme/themes.ts
import { type ThemeColors } from "./colors";

export interface ThemeDefinition {
  name: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export const themes: Record<string, ThemeDefinition> = {
  default: {
    name: "QuickRead Classic",
    colors: { light: defaultLightColors, dark: defaultDarkColors },
  },
  ocean: {
    name: "Ocean Breeze",
    colors: {
      light: {
        ...defaultLightColors,
        primary: "#0369A1",
        primaryContainer: "#E0F2FE",
        background: "#F0F9FF",
      },
      dark: {
        ...defaultDarkColors,
        primary: "#38BDF8",
        primaryContainer: "#0C4A6E",
        background: "#0C1929",
      },
    },
  },
  sunset: {
    name: "Sunset Warmth",
    colors: {
      light: {
        ...defaultLightColors,
        primary: "#EA580C",
        primaryContainer: "#FFF7ED",
        background: "#FFFBF5",
      },
      dark: {
        ...defaultDarkColors,
        primary: "#FB923C",
        primaryContainer: "#7C2D12",
        background: "#1C1009",
      },
    },
  },
  // "Sepia" theme for reading
  sepia: {
    name: "Reading Mode",
    colors: {
      light: {
        ...defaultLightColors,
        background: "#FBF5E6",
        surface: "#F5ECD7",
        text: "#5B4636",
        textSecondary: "#8B7355",
      },
      dark: {
        ...defaultDarkColors,
        background: "#1A1612",
        surface: "#2A2420",
        text: "#D4C5A9",
        textSecondary: "#A89880",
      },
    },
  },
};
```

### Theme Picker UI

```typescript
function ThemePicker() {
  const currentTheme = usePreferencesStore((s) => s.themeName);
  const setTheme = usePreferencesStore((s) => s.setThemeName);

  return (
    <View className="flex-row flex-wrap gap-3 p-4">
      {Object.entries(themes).map(([key, theme]) => (
        <Pressable
          key={key}
          onPress={() => setTheme(key)}
          className={cn(
            "w-[45%] rounded-xl border-2 p-3",
            currentTheme === key ? "border-primary" : "border-border"
          )}
        >
          {/* Theme preview circles */}
          <View className="mb-2 flex-row gap-2">
            <View
              style={{ backgroundColor: theme.colors.light.primary }}
              className="h-6 w-6 rounded-full"
            />
            <View
              style={{ backgroundColor: theme.colors.light.background }}
              className="h-6 w-6 rounded-full border border-border"
            />
            <View
              style={{ backgroundColor: theme.colors.light.text }}
              className="h-6 w-6 rounded-full"
            />
          </View>
          <Text className="text-sm font-medium text-foreground">
            {theme.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

---

## 11. Advanced: Animated Theme Transitions

### Smooth Color Transitions with Reanimated

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

function AnimatedThemeBackground({ children }: { children: React.ReactNode }) {
  const { isDark } = useAppTheme();
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, { duration: 300 });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#F9F9F9", "#121212"]
    ),
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
```

### Circular Reveal Animation (Premium Feel)

```typescript
// A circle expands from the toggle button position to reveal the new theme
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

function CircularThemeReveal({ isDark, togglePosition }: Props) {
  const radius = useSharedValue(0);
  const maxRadius = Math.sqrt(
    Math.pow(SCREEN_WIDTH, 2) + Math.pow(SCREEN_HEIGHT, 2)
  );

  const trigger = () => {
    radius.value = 0;
    radius.value = withTiming(maxRadius, { duration: 500 });
  };

  // This requires react-native-skia for the circular mask
  // It's an advanced effect seen in premium apps like Telegram
}
```

---

## 12. Production Checklist

### Before Shipping Your Theme System

```
[ ] Colors pass WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
[ ] Dark mode tested on OLED and LCD screens
[ ] StatusBar style matches background
[ ] Splash screen has light and dark variants
[ ] System navigation bar (Android) matches theme
[ ] Images/illustrations have dark mode variants (or use opacity overlays)
[ ] Charts and graphs adapt to theme colors
[ ] Third-party components respect theme (alerts, pickers, modals)
[ ] Theme preference persists across app restarts
[ ] Theme switches don't cause layout jumps
[ ] Shadows are subtle in light mode, invisible or glows in dark mode
[ ] Error/success/warning colors are distinct in BOTH modes
[ ] Text remains readable on all themed surfaces
[ ] User can choose "System" to follow OS preference
```

### Testing Theme

```bash
# iOS Simulator: Toggle dark mode
# Hardware > Toggle Appearance (Cmd+Shift+A)

# Android Emulator: Toggle dark mode
# adb shell cmd uimode night yes  # Enable dark mode
# adb shell cmd uimode night no   # Disable dark mode
```

### Contrast Checking Tool

```typescript
// utils/contrast.ts
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Usage in development
if (__DEV__) {
  const ratio = getContrastRatio("#007A5E", "#FFFFFF");
  console.log(`Primary on white: ${ratio.toFixed(2)}:1`);
  // Should be >= 4.5 for normal text
}
```
