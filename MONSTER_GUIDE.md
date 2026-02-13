# React Native / Expo Monster Guide

> Tailored for your QuickRead project stack. This is your roadmap from where you are now to senior-level mastery.

---

## Table of Contents

1. [Mental Models First](#1-mental-models-first)
2. [JavaScript/TypeScript Mastery](#2-javascripttypescript-mastery)
3. [React Fundamentals You MUST Own](#3-react-fundamentals-you-must-own)
4. [React Native Core](#4-react-native-core)
5. [Expo Deep Dive](#5-expo-deep-dive)
6. [Architecture & Project Structure](#6-architecture--project-structure)
7. [Navigation (Expo Router)](#7-navigation-expo-router)
8. [State Management (Zustand)](#8-state-management-zustand)
9. [Data Fetching (TanStack React Query)](#9-data-fetching-tanstack-react-query)
10. [Forms & Validation (React Hook Form + Zod)](#10-forms--validation-react-hook-form--zod)
11. [Styling (NativeWind / Tailwind)](#11-styling-nativewind--tailwind)
12. [Animations (Reanimated + Gesture Handler)](#12-animations-reanimated--gesture-handler)
13. [Authentication Patterns](#13-authentication-patterns)
14. [API Layer Architecture](#14-api-layer-architecture)
15. [Performance Optimization](#15-performance-optimization)
16. [Testing](#16-testing)
17. [Native Modules & Platform Code](#17-native-modules--platform-code)
18. [Deployment & CI/CD (EAS)](#18-deployment--cicd-eas)
19. [Debugging Like a Pro](#19-debugging-like-a-pro)
20. [Senior-Level Patterns](#20-senior-level-patterns)
21. [Your QuickRead Action Plan](#21-your-quickread-action-plan)
22. [Resources](#22-resources)

---

## 1. Mental Models First

Before any code, internalize these truths:

### The Bridge Architecture
React Native doesn't render web views. It renders **actual native components**. Your `<View>` becomes `android.view.View` on Android and `UIView` on iOS. JavaScript communicates with native code through a bridge (or the new JSI in New Architecture, which you already have enabled).

### New Architecture (You have it ON)
Your `app.json` has `"newArchEnabled": true`. This means:
- **Fabric** - New rendering system, synchronous layout
- **TurboModules** - Lazy-loaded native modules via JSI
- **JSI** - Direct JS-to-Native communication (no more JSON serialization over the bridge)
- **Codegen** - Type-safe native interfaces generated from JS specs

This is the future. You're already on it. Good.

### Think in Constraints
Mobile is NOT web. You have:
- Limited memory (app gets killed if it uses too much)
- Main thread blocking = frozen UI (60fps or users feel it)
- No DOM. No CSS cascade. No `window` object.
- Platform differences (iOS vs Android behave differently)
- App lifecycle (background, foreground, killed states)

---

## 2. JavaScript/TypeScript Mastery

You can't be a monster without owning the language.

### JS Concepts You Must Be Fluent In
```typescript
// 1. Closures - understand why this works
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

// 2. Event loop - know the execution order
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2 (microtasks before macrotasks)

// 3. Destructuring, spread, rest - use them everywhere
const { user, ...rest } = authState;
const merged = { ...defaults, ...overrides };

// 4. Promises & async/await - no callback hell ever
const fetchUser = async (id: string) => {
  try {
    const { data } = await api.get(`/users/${id}`);
    return data;
  } catch (error) {
    throw classifyError(error);
  }
};

// 5. Array methods - stop writing for loops
const activeUsers = users
  .filter((u) => u.isActive)
  .map((u) => u.name)
  .sort((a, b) => a.localeCompare(b));
```

### TypeScript - Non-Negotiables

Turn on strict mode. Your `tsconfig.json` has `"strict": false`. Change it:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

This forces you to handle `null`, `undefined`, and type mismatches. Pain now, monster later.

#### Key TypeScript Patterns for React Native
```typescript
// 1. Discriminated unions for state machines
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: UserProfile }
  | { status: "error"; error: string };

// The compiler forces you to handle every case
function renderAuth(state: AuthState) {
  switch (state.status) {
    case "idle":
      return <LoginScreen />;
    case "loading":
      return <Spinner />;
    case "authenticated":
      return <Dashboard user={state.user} />; // user is typed here!
    case "error":
      return <ErrorScreen message={state.error} />;
  }
}

// 2. Generic components
type ListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
};

function TypedList<T>({ data, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <View>
      {data.map((item, i) => (
        <View key={keyExtractor(item)}>{renderItem(item, i)}</View>
      ))}
    </View>
  );
}

// 3. Utility types you'll use daily
type BookSummary = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  readTime: number;
  chapters: Chapter[];
};

type BookPreview = Pick<BookSummary, "id" | "title" | "coverUrl">;
type BookUpdate = Partial<Omit<BookSummary, "id">>;
type BookRecord = Record<string, BookSummary>;

// 4. Type guards
function isApiError(error: unknown): error is { message: string; code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  );
}

// 5. const assertions for config objects
const READING_SPEEDS = {
  slow: 200,
  medium: 250,
  fast: 300,
} as const;

type ReadingSpeed = keyof typeof READING_SPEEDS; // "slow" | "medium" | "fast"
```

---

## 3. React Fundamentals You MUST Own

### The Render Cycle
```
State/Props Change → Render (create VDOM) → Reconciliation (diff) → Commit (update native views)
```

Every re-render creates a new function scope. Every variable, every function, every object is recreated. This is why memoization exists.

### Hooks Mastery

```typescript
// useState - for local UI state
const [isExpanded, setIsExpanded] = useState(false);

// useReducer - for complex local state with multiple transitions
type ReadingState = {
  currentChapter: number;
  progress: number;
  isBookmarked: boolean;
};

type ReadingAction =
  | { type: "NEXT_CHAPTER" }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "TOGGLE_BOOKMARK" };

function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case "NEXT_CHAPTER":
      return { ...state, currentChapter: state.currentChapter + 1, progress: 0 };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "TOGGLE_BOOKMARK":
      return { ...state, isBookmarked: !state.isBookmarked };
  }
}

// useRef - for values that persist across renders WITHOUT triggering re-render
const scrollRef = useRef<ScrollView>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// useCallback - memoize functions passed to children
const handlePress = useCallback((id: string) => {
  router.push(`/book/${id}`);
}, [router]);

// useMemo - memoize expensive computations
const filteredBooks = useMemo(
  () => books.filter((b) => b.category === selectedCategory),
  [books, selectedCategory]
);

// useEffect - synchronize with external systems
useEffect(() => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") refreshData();
  });
  return () => subscription.remove(); // ALWAYS cleanup
}, []);
```

### When to Memoize (and When NOT to)
```typescript
// DO memoize:
// 1. Functions passed as props to memoized children
// 2. Expensive computations (filtering large lists, complex transforms)
// 3. Objects/arrays passed as props (referential equality matters)

// DON'T memoize:
// 1. Simple values (strings, numbers, booleans)
// 2. Functions only used in the same component
// 3. Components that re-render anyway due to context changes
// 4. Everything "just in case" - profile first, optimize second
```

### Component Patterns
```typescript
// 1. Compound Components (for complex UI)
function BookCard({ children }: { children: React.ReactNode }) {
  return <View className="rounded-xl bg-card p-4">{children}</View>;
}

BookCard.Cover = function Cover({ uri }: { uri: string }) {
  return <Image source={{ uri }} className="h-48 w-full rounded-lg" />;
};

BookCard.Title = function Title({ children }: { children: string }) {
  return <Text className="text-lg font-bold text-foreground">{children}</Text>;
};

BookCard.Meta = function Meta({ children }: { children: React.ReactNode }) {
  return <View className="mt-2 flex-row items-center gap-2">{children}</View>;
};

// Usage:
<BookCard>
  <BookCard.Cover uri={book.coverUrl} />
  <BookCard.Title>{book.title}</BookCard.Title>
  <BookCard.Meta>
    <Text>{book.author}</Text>
    <Text>{book.readTime} min</Text>
  </BookCard.Meta>
</BookCard>

// 2. Render Props (for shared behavior)
function WithLoading<T>({
  data,
  isLoading,
  error,
  children,
}: {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  children: (data: T) => React.ReactNode;
}) {
  if (isLoading) return <ActivityIndicator />;
  if (error) return <ErrorView error={error} />;
  if (!data) return null;
  return <>{children(data)}</>;
}

// 3. Custom Hooks (extract reusable logic)
function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggle = useCallback((bookId: string) => {
    setBookmarks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  }, []);

  const isBookmarked = useCallback(
    (bookId: string) => bookmarks.includes(bookId),
    [bookmarks]
  );

  return { bookmarks, toggle, isBookmarked };
}
```

---

## 4. React Native Core

### Core Components - Know These Cold
```typescript
import {
  View,           // div equivalent - use for layout
  Text,           // REQUIRED for all text (unlike web)
  ScrollView,     // Scrollable container
  FlatList,       // Virtualized list - USE THIS for long lists
  SectionList,    // Grouped virtualized list
  Pressable,      // Touch handler (prefer over TouchableOpacity)
  TextInput,      // Input fields
  Image,          // Image display (use expo-image instead for perf)
  ActivityIndicator, // Loading spinner
  KeyboardAvoidingView, // Push content above keyboard
  Modal,          // Native modal
  StatusBar,      // Status bar control
  Platform,       // Platform detection
  Dimensions,     // Screen dimensions
  AppState,       // App lifecycle
  Linking,        // Deep links / URL opening
  Alert,          // Native alert dialog
} from "react-native";
```

### FlatList - The Most Important Component
```typescript
// This is how you render lists. NEVER use .map() for long lists.
// FlatList virtualizes - only renders what's on screen.

<FlatList
  data={books}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <BookCard book={item} />}
  // Performance props:
  initialNumToRender={10}        // Render 10 items initially
  maxToRenderPerBatch={5}        // Render 5 items per batch
  windowSize={5}                 // Keep 5 screens worth of items
  removeClippedSubviews={true}   // Unmount off-screen items (Android)
  // Features:
  ListHeaderComponent={<SearchBar />}
  ListFooterComponent={isLoading ? <Spinner /> : null}
  ListEmptyComponent={<EmptyState />}
  ItemSeparatorComponent={() => <View className="h-3" />}
  onEndReached={loadMore}        // Infinite scroll
  onEndReachedThreshold={0.5}    // Trigger at 50% from bottom
  refreshControl={               // Pull to refresh
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  // Optimization:
  getItemLayout={(data, index) => ({  // Skip measurement if items are fixed height
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### FlashList - The FlatList Replacement (Consider Adding)
```bash
npx expo install @shopify/flash-list
```
```typescript
// Drop-in replacement, 5-10x faster than FlatList
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={books}
  renderItem={({ item }) => <BookCard book={item} />}
  estimatedItemSize={120} // REQUIRED - estimated item height
/>
```

### Platform-Specific Code
```typescript
import { Platform } from "react-native";

// 1. Inline
const padding = Platform.OS === "ios" ? 20 : 16;
const shadowStyle = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
  android: { elevation: 4 },
});

// 2. File-based (you already use this pattern)
// component.tsx        - default/Android
// component.ios.tsx    - iOS specific
// component.web.tsx    - Web specific
```

### Keyboard Handling
You have `react-native-keyboard-controller` installed. Use it:
```typescript
import { KeyboardProvider } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Wrap your app
<KeyboardProvider>
  <App />
</KeyboardProvider>

// In forms - replaces KeyboardAvoidingView
<KeyboardAwareScrollView>
  <TextInput placeholder="Email" />
  <TextInput placeholder="Password" />
</KeyboardAwareScrollView>
```

---

## 5. Expo Deep Dive

### Expo SDK - What You Have and How to Use It

#### expo-image (USE THIS instead of RN Image)
```typescript
import { Image } from "expo-image";

// expo-image uses native image loading, caching, and blurhash placeholders
<Image
  source={{ uri: book.coverUrl }}
  placeholder={{ blurhash: book.blurhash }} // Blur placeholder while loading
  contentFit="cover"
  transition={200} // Fade in animation
  cachePolicy="memory-disk" // Cache aggressively
  className="h-48 w-32 rounded-lg"
/>
```

#### expo-secure-store (You already use this)
```typescript
// Your storage.service.ts is good. Key insight:
// - Max 2048 bytes per value on iOS
// - Use for tokens, small secrets
// - NOT for large data (use MMKV or AsyncStorage for that)
```

#### expo-haptics
```typescript
import * as Haptics from "expo-haptics";

// Use for tactile feedback on important actions
const onBookmark = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  toggleBookmark(bookId);
};

const onError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

const onSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
```

#### expo-notifications
```typescript
import * as Notifications from "expo-notifications";

// 1. Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 2. Request permissions
async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "your-project-id", // from app.json
  });

  return token.data;
}

// 3. Listen for notifications
useEffect(() => {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    // Handle foreground notification
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      // User tapped the notification - navigate somewhere
      const data = response.notification.request.content.data;
      router.push(`/book/${data.bookId}`);
    }
  );

  return () => {
    sub.remove();
    responseSub.remove();
  };
}, []);
```

#### expo-file-system
```typescript
import * as FileSystem from "expo-file-system";

// Download and cache book content
const downloadBook = async (bookId: string, url: string) => {
  const fileUri = `${FileSystem.documentDirectory}books/${bookId}.json`;

  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (fileInfo.exists) return fileUri; // Already cached

  const { uri } = await FileSystem.downloadAsync(url, fileUri);
  return uri;
};

// Read cached data
const readCachedBook = async (bookId: string) => {
  const fileUri = `${FileSystem.documentDirectory}books/${bookId}.json`;
  const content = await FileSystem.readAsStringAsync(fileUri);
  return JSON.parse(content);
};
```

### Expo Config Plugins (app.json / app.config.ts)
```typescript
// Convert app.json to app.config.ts for dynamic config
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "QuickRead",
  slug: "quickread",
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: "your-project-id",
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: "com.googleusercontent.apps.YOUR_ID",
      },
    ],
  ],
});
```

---

## 6. Architecture & Project Structure

### The Architecture That Scales

Your current structure is good. Here's the monster-level version:

```
app/                          # Routes only - thin layer
  (auth)/
  (onboarding)/
  (tabs)/
    (home)/
      index.tsx               # Screen - composes features
      _layout.tsx
    (library)/
      index.tsx
      [bookId].tsx            # Dynamic route
      _layout.tsx
    (profile)/
      index.tsx
      settings.tsx
      _layout.tsx

features/                     # Feature modules (the meat)
  books/
    api/                      # API calls for this feature
      books.api.ts
      books.queries.ts        # React Query hooks
    components/               # Feature-specific components
      BookCard.tsx
      BookList.tsx
      ChapterView.tsx
    hooks/                    # Feature-specific hooks
      useReadingProgress.ts
    store/                    # Feature-specific state
      reading.store.ts
    types/
      books.types.ts
    utils/
      formatReadTime.ts

  auth/                       # What you already have, reorganized
    api/
      auth.api.ts
      auth.queries.ts
    components/
      LoginForm.tsx
      SignupForm.tsx
    hooks/
      useAuth.ts
    store/
      auth.store.ts
    types/
      auth.types.ts
    validations/
      auth.validations.ts

components/                   # Shared UI components only
  ui/
    Button.tsx
    Input.tsx
    Card.tsx
    Modal.tsx
    Skeleton.tsx              # Loading skeletons
    Toast.tsx

lib/                          # Shared utilities
  api-client.ts               # Axios instance
  storage.ts                  # Storage abstraction
  constants.ts                # App-wide constants
  errors.ts                   # Error handling utilities

hooks/                        # Shared hooks
  useDebounce.ts
  useAppState.ts
  useNetworkStatus.ts

types/                        # Shared types
  global.d.ts
  navigation.ts
```

### The Key Principle: Features Own Their Dependencies

Each feature folder is self-contained. A feature has its own API layer, components, hooks, state, and types. Shared code lives in the top-level `components/`, `hooks/`, `lib/`, and `types/` folders.

This means:
- Deleting a feature = delete one folder
- Finding code = go to the feature folder
- No circular dependencies between features
- Features communicate through the store or route params

---

## 7. Navigation (Expo Router)

You're using Expo Router v6 with file-based routing. Here's how to use it like a pro.

### Dynamic Routes
```
app/
  (tabs)/
    book/
      [id].tsx              # /book/123
      [id]/
        chapter/
          [chapterId].tsx   # /book/123/chapter/5
```

```typescript
// app/(tabs)/book/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: book } = useBook(id); // React Query hook

  return <BookDetail book={book} />;
}
```

### Navigation Patterns
```typescript
import { router, useRouter, Link, Redirect } from "expo-router";

// Imperative navigation
router.push("/book/123");                    // Push to stack
router.replace("/login");                    // Replace current screen
router.back();                               // Go back
router.dismiss();                            // Dismiss modal
router.navigate("/book/123");                // Navigate (won't duplicate)

// With params
router.push({
  pathname: "/book/[id]",
  params: { id: "123" },
});

// Declarative navigation
<Link href="/book/123" asChild>
  <Pressable>
    <Text>Read Book</Text>
  </Pressable>
</Link>

// Redirect (in render)
if (!isAuthenticated) {
  return <Redirect href="/login" />;
}
```

### Layout Patterns
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007A5E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Deep Linking
```typescript
// app.json
{
  "expo": {
    "scheme": "quickread",
    // ...
  }
}

// Now quickread://book/123 opens the app to that book
// Configure universal links for https://quickread.app/book/123
```

### Route Groups Explained
```
(auth)     - Parentheses = group, not in URL path
(tabs)     - Groups routes without adding a segment
(onboarding)

// These don't add to the URL:
// (tabs)/index.tsx    → /
// (tabs)/explore.tsx  → /explore
// (auth)/login.tsx    → /login
```

---

## 8. State Management (Zustand)

You chose Zustand. Excellent choice. Here's how to use it at a senior level.

### Store Design Principles
```typescript
// 1. Split stores by domain (not one god store)
// auth.store.ts - authentication state
// reading.store.ts - reading progress
// preferences.store.ts - user preferences
// ui.store.ts - UI state (modals, toasts)

// 2. Keep stores flat and simple
// BAD:
const useStore = create((set) => ({
  user: {
    profile: { name: "", email: "" },
    preferences: { theme: "light", fontSize: 16 },
    reading: { currentBook: null, progress: {} },
  },
}));

// GOOD:
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const usePreferencesStore = create((set) => ({
  theme: "light",
  fontSize: 16,
  setTheme: (theme) => set({ theme }),
  setFontSize: (size) => set({ fontSize: size }),
}));
```

### Zustand with TypeScript (Proper Way)
```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer"; // npm install immer zustand
import { secureStorage } from "@/utils";

// Define the interface
interface ReadingStore {
  // State
  currentBookId: string | null;
  progress: Record<string, number>; // bookId -> percentage
  bookmarks: string[];

  // Actions
  startReading: (bookId: string) => void;
  updateProgress: (bookId: string, progress: number) => void;
  toggleBookmark: (bookId: string) => void;
  reset: () => void;
}

// Initial state (separate for reset)
const initialState = {
  currentBookId: null,
  progress: {},
  bookmarks: [],
};

export const useReadingStore = create<ReadingStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      startReading: (bookId) =>
        set((state) => {
          state.currentBookId = bookId;
        }),

      updateProgress: (bookId, progress) =>
        set((state) => {
          state.progress[bookId] = progress;
        }),

      toggleBookmark: (bookId) =>
        set((state) => {
          const index = state.bookmarks.indexOf(bookId);
          if (index > -1) {
            state.bookmarks.splice(index, 1);
          } else {
            state.bookmarks.push(bookId);
          }
        }),

      reset: () => set(initialState),
    })),
    {
      name: "reading-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        progress: state.progress,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
```

### Selectors - Prevent Unnecessary Re-renders
```typescript
// BAD - component re-renders when ANY store value changes
const { user, bookmarks, progress } = useReadingStore();

// GOOD - component only re-renders when bookmarks change
const bookmarks = useReadingStore((state) => state.bookmarks);
const toggleBookmark = useReadingStore((state) => state.toggleBookmark);

// GOOD - derived state with shallow comparison
import { useShallow } from "zustand/react/shallow";

const { bookmarks, progress } = useReadingStore(
  useShallow((state) => ({
    bookmarks: state.bookmarks,
    progress: state.progress,
  }))
);

// GOOD - computed selectors
const isBookmarked = useReadingStore(
  (state) => state.bookmarks.includes(bookId)
);

const readingProgress = useReadingStore(
  (state) => state.progress[bookId] ?? 0
);
```

### When to Use Zustand vs React Query vs Local State
```
Local State (useState/useReducer):
  - Form inputs
  - UI toggles (modals, dropdowns)
  - Component-specific state
  - Anything that dies when the component unmounts

Zustand:
  - Auth state (user, tokens)
  - User preferences (theme, font size)
  - App-wide UI state (toasts, navigation state)
  - Offline data / cached state
  - Anything that persists across screens

React Query:
  - ALL server data (books, categories, user profiles from API)
  - Handles caching, refetching, pagination, optimistic updates
  - If it comes from an API, it goes in React Query
```

---

## 9. Data Fetching (TanStack React Query)

You have `@tanstack/react-query` installed. This is the single most impactful library for your app. Here's how to use it properly.

### Setup
```typescript
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is "fresh" for this long
      gcTime: 1000 * 60 * 30,   // 30 minutes - keep in cache this long
      retry: 2,
      refetchOnWindowFocus: false, // Mobile doesn't have "window focus" often
    },
  },
});

// app/_layout.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* rest of your app */}
    </QueryClientProvider>
  );
}
```

### Query Hooks Pattern (The Pro Way)
```typescript
// features/books/api/books.api.ts
import { api } from "@/lib/api-client";
import type { Book, BookSummary, Category } from "../types/books.types";

export const booksApi = {
  getAll: (params?: { category?: string; page?: number }) =>
    api.get<{ results: Book[]; next: string | null }>("/books/", { params }),

  getById: (id: string) =>
    api.get<Book>(`/books/${id}/`),

  getSummary: (bookId: string) =>
    api.get<BookSummary>(`/books/${bookId}/summary/`),

  getCategories: () =>
    api.get<Category[]>("/categories/"),

  search: (query: string) =>
    api.get<Book[]>("/books/search/", { params: { q: query } }),
};

// features/books/api/books.queries.ts
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { booksApi } from "./books.api";

// Query key factory - keeps keys organized and typed
export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: { category?: string }) =>
    [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  summary: (id: string) => [...bookKeys.detail(id), "summary"] as const,
};

// Fetch all books with infinite scroll
export function useBooks(category?: string) {
  return useInfiniteQuery({
    queryKey: bookKeys.list({ category }),
    queryFn: ({ pageParam = 1 }) =>
      booksApi.getAll({ category, page: pageParam }).then((r) => r.data),
    getNextPageParam: (lastPage) =>
      lastPage.next ? extractPage(lastPage.next) : undefined,
    initialPageParam: 1,
  });
}

// Fetch single book
export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => booksApi.getById(id).then((r) => r.data),
    enabled: !!id, // Don't fetch if no id
  });
}

// Fetch book summary
export function useBookSummary(bookId: string) {
  return useQuery({
    queryKey: bookKeys.summary(bookId),
    queryFn: () => booksApi.getSummary(bookId).then((r) => r.data),
    enabled: !!bookId,
  });
}

// Search with debounce
export function useBookSearch(query: string) {
  return useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => booksApi.search(query).then((r) => r.data),
    enabled: query.length >= 2, // Only search with 2+ chars
    staleTime: 1000 * 60, // Cache search results for 1 min
  });
}
```

### Mutations (Creating/Updating Data)
```typescript
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) =>
      api.post(`/books/${bookId}/bookmark/`),

    // Optimistic update - update UI immediately, rollback on error
    onMutate: async (bookId) => {
      await queryClient.cancelQueries({ queryKey: bookKeys.detail(bookId) });

      const previousBook = queryClient.getQueryData(bookKeys.detail(bookId));

      queryClient.setQueryData(bookKeys.detail(bookId), (old: Book) => ({
        ...old,
        isBookmarked: !old.isBookmarked,
      }));

      return { previousBook };
    },

    onError: (err, bookId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        bookKeys.detail(bookId),
        context?.previousBook
      );
    },

    onSettled: (data, error, bookId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(bookId) });
    },
  });
}

// Usage in component
function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id);
  const toggleBookmark = useToggleBookmark();

  return (
    <Pressable onPress={() => toggleBookmark.mutate(id)}>
      <BookmarkIcon filled={book?.isBookmarked} />
    </Pressable>
  );
}
```

### Prefetching (Make Navigation Feel Instant)
```typescript
// Prefetch book details when user scrolls to a card
function BookCard({ book }: { book: Book }) {
  const queryClient = useQueryClient();

  const prefetchBook = () => {
    queryClient.prefetchQuery({
      queryKey: bookKeys.detail(book.id),
      queryFn: () => booksApi.getById(book.id).then((r) => r.data),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link href={`/book/${book.id}`} asChild>
      <Pressable onPressIn={prefetchBook}> {/* Prefetch on press START */}
        <Text>{book.title}</Text>
      </Pressable>
    </Link>
  );
}
```

---

## 10. Forms & Validation (React Hook Form + Zod)

You already have this set up. Here's the senior-level usage.

### Zod Schemas (Your Validation Layer)
```typescript
// lib/validations/auth.ts - improve what you have
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Infer types from schemas (don't define types separately!)
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### Form Components Done Right
```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginUser(data);
      router.replace("/(tabs)");
    } catch (error) {
      // Set server-side errors on the form
      if (isApiError(error) && error.code === 401) {
        setError("root", { message: "Invalid email or password" });
      }
    }
  };

  return (
    <KeyboardAwareScrollView>
      {errors.root && (
        <Text className="text-destructive">{errors.root.message}</Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="mb-1 text-sm text-muted-foreground">Email</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="rounded-lg border border-border bg-card px-4 py-3"
            />
            {errors.email && (
              <Text className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="mt-4 rounded-lg bg-primary py-3"
      >
        <Text className="text-center font-bold text-primary-foreground">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
```

---

## 11. Styling (NativeWind / Tailwind)

You already use NativeWind. Here's how to level up.

### Responsive Design
```typescript
// NativeWind doesn't have responsive breakpoints like web Tailwind.
// Use useWindowDimensions for responsive layouts.

import { useWindowDimensions } from "react-native";

function BookGrid() {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 3 : 2; // Tablet vs phone

  return (
    <FlatList
      data={books}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      renderItem={({ item }) => (
        <View className="flex-1 p-2">
          <BookCard book={item} />
        </View>
      )}
    />
  );
}
```

### Design System with NativeWind
```typescript
// components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-12 px-4",
        lg: "h-14 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-white",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface ButtonProps
  extends React.ComponentProps<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label: string;
  isLoading?: boolean;
}

export function Button({
  label,
  variant,
  size,
  isLoading,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={textVariants({ variant, size })}>{label}</Text>
      )}
    </Pressable>
  );
}

// Usage:
<Button label="Get Started" variant="default" size="lg" />
<Button label="Cancel" variant="outline" />
<Button label="Delete" variant="destructive" isLoading={deleting} />
```

### Common Layout Patterns
```typescript
// Screen wrapper with safe areas
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  );
}

// Centered content
<View className="flex-1 items-center justify-center">

// Space between items
<View className="flex-row items-center justify-between">

// Card with shadow (platform-aware)
<View className="rounded-xl bg-card p-4 shadow-sm">

// Absolute positioning
<View className="absolute bottom-0 left-0 right-0">

// Gap between children (NativeWind supports gap)
<View className="flex-row gap-3">
```

---

## 12. Animations (Reanimated + Gesture Handler)

You have both `react-native-reanimated` and `react-native-gesture-handler`. This is where you become a visual monster.

### Reanimated Basics
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInRight,
  Layout,
} from "react-native-reanimated";

// 1. Basic animation
function AnimatedCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle} className="rounded-xl bg-card p-4">
        <Text>Tap me</Text>
      </Animated.View>
    </Pressable>
  );
}

// 2. Entering/Exiting animations (the easy way)
function BookList({ books }: { books: Book[] }) {
  return (
    <View>
      {books.map((book, index) => (
        <Animated.View
          key={book.id}
          entering={FadeIn.delay(index * 100).springify()}
          exiting={FadeOut}
          layout={Layout.springify()} // Animate layout changes
        >
          <BookCard book={book} />
        </Animated.View>
      ))}
    </View>
  );
}

// 3. Scroll-driven animation
function ParallaxHeader() {
  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, 200],
      [300, 100],
      Extrapolation.CLAMP
    ),
    opacity: interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.3],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      <Animated.View style={headerStyle}>
        <Image source={require("./hero.png")} className="h-full w-full" />
      </Animated.View>
      <Animated.ScrollView
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* content */}
      </Animated.ScrollView>
    </>
  );
}
```

### Gesture Handler + Reanimated
```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

// Swipe to dismiss / swipe actions
function SwipeableBookCard({ book, onDelete }: Props) {
  const translateX = useSharedValue(0);
  const DELETE_THRESHOLD = -100;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX); // Only swipe left
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        translateX.value = withSpring(-200);
        runOnJS(onDelete)(book.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View>
      {/* Delete background */}
      <View className="absolute inset-0 items-end justify-center bg-destructive px-6">
        <Text className="font-bold text-white">Delete</Text>
      </View>

      {/* Swipeable card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle} className="bg-card p-4">
          <Text>{book.title}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Bottom sheet gesture
function BottomSheet({ children }: { children: React.ReactNode }) {
  const translateY = useSharedValue(0);
  const SNAP_POINTS = [0, -300, -600]; // Collapsed, half, full

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      // Snap to nearest point
      const nearest = SNAP_POINTS.reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value)
          ? curr
          : prev
      );
      translateY.value = withSpring(nearest);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={sheetStyle}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-card p-4"
      >
        <View className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Skeleton Loading (Animated)
```typescript
function SkeletonBox({ className }: { className?: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1, // Infinite
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className={cn("rounded-lg bg-muted", className)}
    />
  );
}

// Usage
function BookCardSkeleton() {
  return (
    <View className="flex-row gap-3 p-4">
      <SkeletonBox className="h-32 w-24" />
      <View className="flex-1 gap-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <SkeletonBox className="h-4 w-1/4" />
      </View>
    </View>
  );
}
```

---

## 13. Authentication Patterns

Your auth setup is solid. Here's the production-grade version.

### Token Refresh Race Condition Fix
```typescript
// services/api.service.ts - improved version
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request - another refresh is already in flight
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access, refresh } = data;
      await SecureStore.setItemAsync("accessToken", access);
      await SecureStore.setItemAsync("refreshToken", refresh);

      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      processQueue(null, access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      useAuthStore.getState().logout();
      router.replace("/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

### Auth Hook
```typescript
// features/auth/hooks/useAuth.ts
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      router.replace("/login");
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
}
```

---

## 14. API Layer Architecture

### Error Handling Strategy
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (!error.response) {
      return new AppError(
        "No internet connection. Please check your network.",
        "NETWORK_ERROR"
      );
    }

    switch (status) {
      case 400:
        return new AppError(
          data?.message || "Invalid request",
          "VALIDATION_ERROR",
          400,
          data?.errors
        );
      case 401:
        return new AppError("Session expired. Please log in again.", "UNAUTHORIZED", 401);
      case 403:
        return new AppError("You don't have permission to do this.", "FORBIDDEN", 403);
      case 404:
        return new AppError("The requested resource was not found.", "NOT_FOUND", 404);
      case 429:
        return new AppError("Too many requests. Please slow down.", "RATE_LIMITED", 429);
      default:
        if (status && status >= 500) {
          return new AppError(
            "Something went wrong on our end. Please try again.",
            "SERVER_ERROR",
            status
          );
        }
    }
  }

  return new AppError("An unexpected error occurred.", "UNKNOWN");
}
```

### Global Error Boundary for React Query
```typescript
// Use onError in QueryClient for global handling
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        const appError = handleApiError(error);

        // Show toast for non-auth errors
        if (appError.code !== "UNAUTHORIZED") {
          showToast({ type: "error", message: appError.message });
        }
      },
    },
  },
});
```

---

## 15. Performance Optimization

### The Performance Checklist

#### 1. Lists
```typescript
// Use FlashList over FlatList
// Use keyExtractor (never rely on index)
// Memoize renderItem components
const MemoizedBookCard = React.memo(BookCard);

// Use getItemLayout when item heights are known
// Implement onEndReached for pagination (don't load everything)
```

#### 2. Images
```typescript
// Use expo-image (not RN Image)
// Always specify width and height
// Use blurhash placeholders
// Use cachePolicy="memory-disk"
// Serve appropriately sized images from backend (don't download 4K for a thumbnail)
```

#### 3. Renders
```typescript
// Profile renders with React DevTools
// Use React.memo for pure components that receive the same props
// Use useCallback for functions passed as props
// Use useMemo for expensive computations
// Use Zustand selectors (not destructuring entire store)
// Avoid creating objects/arrays inline in JSX:

// BAD - creates new object every render
<View style={{ marginTop: 10 }} />

// GOOD - NativeWind class (or StyleSheet.create)
<View className="mt-2.5" />

// BAD - creates new array every render
<FlatList data={items.filter(i => i.active)} />

// GOOD
const activeItems = useMemo(() => items.filter(i => i.active), [items]);
<FlatList data={activeItems} />
```

#### 4. JavaScript Thread
```typescript
// Move heavy computation off the JS thread
// Use Reanimated worklets for animation logic (runs on UI thread)
// Use InteractionManager for deferred work
import { InteractionManager } from "react-native";

useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    // Heavy computation that shouldn't block navigation animation
    processLargeDataset();
  });

  return () => task.cancel();
}, []);
```

#### 5. App Startup
```typescript
// Minimize what runs before the first frame
// Use expo-splash-screen to show splash while loading
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // Keep splash visible

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await loadFonts();
      await hydrateAuthStore();
      // Don't load data here - let screens handle their own data
      setReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return <Stack />;
}
```

---

## 16. Testing

### Testing Strategy
```
Unit Tests: Utility functions, hooks, store logic
Component Tests: Individual components render correctly
Integration Tests: Feature flows work end-to-end
E2E Tests: Full user journeys on device/simulator
```

### Setup
```bash
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native
```

```typescript
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterSetup: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
  ],
};
```

### Testing React Query Hooks
```typescript
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBooks } from "../books.queries";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test("useBooks returns book list", async () => {
  const { result } = renderHook(() => useBooks(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.pages[0].results).toHaveLength(10);
});
```

### Testing Components
```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { BookCard } from "../BookCard";

const mockBook = {
  id: "1",
  title: "Atomic Habits",
  author: "James Clear",
  coverUrl: "https://example.com/cover.jpg",
  readTime: 15,
};

test("renders book title and author", () => {
  render(<BookCard book={mockBook} />);

  expect(screen.getByText("Atomic Habits")).toBeTruthy();
  expect(screen.getByText("James Clear")).toBeTruthy();
});

test("calls onPress when tapped", () => {
  const onPress = jest.fn();
  render(<BookCard book={mockBook} onPress={onPress} />);

  fireEvent.press(screen.getByText("Atomic Habits"));
  expect(onPress).toHaveBeenCalledWith("1");
});
```

### E2E Testing with Maestro (Recommended)
```yaml
# .maestro/login-flow.yaml
appId: com.quickread.app
---
- launchApp
- tapOn: "Sign In"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome back"
```

```bash
# Run E2E tests
maestro test .maestro/login-flow.yaml
```

---

## 17. Native Modules & Platform Code

### When You Need Native Code
- Custom camera processing
- Bluetooth / NFC
- Background tasks
- Custom native UI
- Performance-critical operations

### Expo Modules API (The Expo Way)
```bash
npx create-expo-module my-native-module
```

```typescript
// modules/my-module/index.ts
import { NativeModule, requireNativeModule } from "expo-modules-core";

interface MyModule extends NativeModule {
  processText(text: string): Promise<string>;
  getDeviceInfo(): { model: string; os: string };
}

export default requireNativeModule<MyModule>("MyModule");
```

### Config Plugins (Modify Native Config Without Ejecting)
```typescript
// plugins/withCustomConfig.ts
import { ConfigPlugin, withAndroidManifest, withInfoPlist } from "expo/config-plugins";

const withCustomConfig: ConfigPlugin = (config) => {
  // Modify Android
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    // Add permissions, activities, etc.
    return config;
  });

  // Modify iOS
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription = "QuickRead needs camera to scan book covers";
    return config;
  });

  return config;
};

export default withCustomConfig;
```

---

## 18. Deployment & CI/CD (EAS)

### EAS Build Profiles
```json
// eas.json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "123456789"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      }
    }
  }
}
```

### Build Commands
```bash
# Development build (with dev client)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (for testers)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### OTA Updates (EAS Update)
```bash
# Push JS-only updates without rebuilding
eas update --channel production --message "Fix typo in onboarding"

# This updates instantly - no app store review needed
# Only works for JS/asset changes, NOT native code changes
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/build.yml
name: Build & Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx eas-cli build --profile production --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## 19. Debugging Like a Pro

### Tools
```
1. Expo Dev Tools        - npx expo start (press 'j' for debugger)
2. React DevTools        - Component tree, props, state inspection
3. Flipper               - Network inspector, layout inspector, databases
4. React Native Debugger - All-in-one debugging
5. Reactotron            - API monitor, state changes, benchmarks
```

### Debugging Techniques
```typescript
// 1. Console methods (beyond console.log)
console.group("API Request");
console.log("URL:", url);
console.log("Params:", params);
console.table(data); // Tabular data
console.time("fetchBooks");
await fetchBooks();
console.timeEnd("fetchBooks"); // "fetchBooks: 234ms"
console.groupEnd();

// 2. React Query DevTools (for mobile)
// npm install @tanstack/react-query-devtools
// Use the built-in dev tools panel

// 3. Network debugging
// Use Flipper or the Network tab in React Native Debugger
// Or add request/response logging to your Axios instance:
if (__DEV__) {
  api.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

// 4. Performance monitoring
// React DevTools Profiler - record and analyze renders
// Use why-did-you-render in dev:
// npm install @welldone-software/why-did-you-render
```

### Common Issues & Fixes
```
"Invariant Violation: Text strings must be rendered within a <Text>"
  → You have a bare string not wrapped in <Text>

"VirtualizedLists should never be nested inside ScrollViews"
  → Use FlatList's ListHeaderComponent instead of wrapping in ScrollView

"Each child in a list should have a unique key"
  → Add keyExtractor to FlatList or key prop to .map()

Metro bundler issues
  → npx expo start --clear (clears Metro cache)

Native module not found
  → npx expo prebuild --clean && npx expo run:ios

White screen on launch
  → Check _layout.tsx for errors, check Expo logs
```

---

## 20. Senior-Level Patterns

### Offline-First Architecture
```typescript
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

// React Query will pause mutations when offline and retry when back online
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Persist React Query cache for offline access
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});
```

### Error Boundaries
```typescript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="mb-2 text-xl font-bold">Something went wrong</Text>
      <Text className="mb-4 text-center text-muted-foreground">
        {error.message}
      </Text>
      <Button label="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

// Wrap features, not the whole app
function BookDetailScreen() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BookDetail />
    </ErrorBoundary>
  );
}
```

### Accessibility (A11y)
```typescript
// Senior devs don't skip accessibility
<Pressable
  onPress={toggleBookmark}
  accessible={true}
  accessibilityLabel={`${isBookmarked ? "Remove" : "Add"} bookmark for ${book.title}`}
  accessibilityRole="button"
  accessibilityState={{ selected: isBookmarked }}
>
  <BookmarkIcon filled={isBookmarked} />
</Pressable>

// Dynamic font scaling
<Text
  className="text-base"
  maxFontSizeMultiplier={1.3} // Limit how large text can get
  allowFontScaling={true}     // Respect system font size
>
  {book.title}
</Text>
```

### Analytics & Monitoring
```typescript
// Track screen views
import * as Analytics from "expo-analytics"; // or PostHog, Amplitude, etc.

// In your root layout, track route changes
export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    Analytics.screen(pathname);
  }, [pathname]);

  return <Stack />;
}

// Error monitoring with Sentry
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 0.2,
});
```

### Internationalization (i18n)
```bash
npx expo install expo-localization i18next react-i18next
```

```typescript
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require("./locales/en.json") },
    fr: { translation: require("./locales/fr.json") },
  },
  lng: getLocales()[0].languageCode ?? "en",
  fallbackLng: "en",
});
```

---

## 21. Your QuickRead Action Plan

Based on your current codebase, here's what to do in order:

### Phase 1: Foundation (Do This Now)
- [ ] Enable `"strict": true` in tsconfig.json and fix all type errors
- [ ] Set up React Query provider in `_layout.tsx`
- [ ] Create query key factories for your API endpoints
- [ ] Replace direct API calls in components with React Query hooks
- [ ] Add proper error boundaries around feature screens
- [ ] Switch from RN `Image` to `expo-image` everywhere

### Phase 2: Architecture (Next)
- [ ] Reorganize into feature-based structure (features/ folder)
- [ ] Create a proper design system (Button, Card, Input with variants)
- [ ] Set up proper TypeScript types for all API responses
- [ ] Implement proper loading states with skeleton screens
- [ ] Add pull-to-refresh and infinite scroll to lists

### Phase 3: Polish (After Core Features Work)
- [ ] Add enter/exit animations with Reanimated
- [ ] Implement haptic feedback on key interactions
- [ ] Add skeleton loading screens
- [ ] Implement offline support with React Query persistence
- [ ] Set up push notifications

### Phase 4: Production (Before Launch)
- [ ] Add error monitoring (Sentry)
- [ ] Add analytics (PostHog / Amplitude)
- [ ] Set up EAS build profiles
- [ ] Configure OTA updates
- [ ] Add E2E tests with Maestro
- [ ] Performance profiling and optimization
- [ ] Accessibility audit

---

## 22. Resources

### Documentation (Read These Cover to Cover)
- [React Native Docs](https://reactnative.dev/docs/getting-started) - Official docs
- [Expo Docs](https://docs.expo.dev/) - Your framework's docs
- [Expo Router Docs](https://docs.expo.dev/router/introduction/) - Navigation
- [TanStack React Query Docs](https://tanstack.com/query/latest/docs/react/overview) - Data fetching
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/) - Animations
- [NativeWind Docs](https://www.nativewind.dev/) - Styling

### YouTube Channels
- **Simon Grimm** - Best Expo/RN tutorials
- **William Candillon** - Animation master (Can it be done in React Native?)
- **Catalin Miron** - Beautiful RN animations
- **Theo** - React ecosystem opinions and best practices
- **Jack Herrington** - Advanced React patterns

### Courses
- [reactnative.dev Tutorial](https://reactnative.dev/docs/tutorial) - Free official tutorial
- Expo's official examples on GitHub

### Code to Study
- [Expo examples](https://github.com/expo/examples) - Official example projects
- [react-native-paper](https://github.com/callstack/react-native-paper) - Study how a UI library is built
- [notesnook](https://github.com/streetwriters/notesnook) - Production RN app, open source

### Tools to Install
```bash
# FlashList - faster FlatList
npx expo install @shopify/flash-list

# Bottom Sheet - production-grade bottom sheets
npx expo install @gorhom/bottom-sheet

# MMKV - fastest key-value storage (10x faster than AsyncStorage)
npx expo install react-native-mmkv

# NetInfo - network status
npx expo install @react-native-community/netinfo

# Maestro - E2E testing
curl -Ls "https://get.maestro.mobile.dev" | bash

# Sentry - error monitoring
npx expo install @sentry/react-native
```

---

> **The monster mindset:** Read source code of libraries you use. When something breaks,
> don't just Google the error -- read the library's source on GitHub.
> Understand WHY things work, not just HOW to use them.
> Build things, break things, fix things. Ship.
