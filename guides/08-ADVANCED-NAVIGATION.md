# Advanced Navigation in React Native (Expo Router)

> Deep links, modals, auth guards, nested navigators, transitions — the full navigation playbook.

---

## Table of Contents

1. [How Navigation Works Under the Hood](#1-how-navigation-works-under-the-hood)
2. [Expo Router File System Conventions](#2-expo-router-file-system-conventions)
3. [Stack Navigation (Push/Pop)](#3-stack-navigation-pushpop)
4. [Tab Navigation](#4-tab-navigation)
5. [Drawer Navigation](#5-drawer-navigation)
6. [Modal Screens](#6-modal-screens)
7. [Nested Navigators](#7-nested-navigators)
8. [Dynamic Routes & Params](#8-dynamic-routes--params)
9. [Route Groups & Layouts](#9-route-groups--layouts)
10. [Authentication Flow (Protected Routes)](#10-authentication-flow-protected-routes)
11. [Deep Linking & Universal Links](#11-deep-linking--universal-links)
12. [Screen Transitions & Animations](#12-screen-transitions--animations)
13. [Navigation State & Persistence](#13-navigation-state--persistence)
14. [Bottom Sheets as Screens](#14-bottom-sheets-as-screens)
15. [Type-Safe Navigation](#15-type-safe-navigation)
16. [Tab Bar Customization](#16-tab-bar-customization)
17. [Preventing Back Navigation](#17-preventing-back-navigation)
18. [Navigation Patterns for Common Flows](#18-navigation-patterns-for-common-flows)
19. [Performance Optimization](#19-performance-optimization)
20. [Debugging Navigation](#20-debugging-navigation)

---

## 1. How Navigation Works Under the Hood

### The Architecture

```
Expo Router (file-based routing)
      ↓
React Navigation (navigation library)
      ↓
Native Navigation Primitives
  iOS:     UINavigationController, UITabBarController
  Android: FragmentManager, BottomNavigationView
```

Expo Router is a file-based abstraction on top of React Navigation. Every file in `app/` becomes a route. The `_layout.tsx` files define the navigation structure (stack, tabs, drawer).

### Key Mental Models

```
Stack:   Screens stacked on top of each other (push/pop)
         Back gesture: swipe from left edge (iOS) / hardware back (Android)

Tabs:    Screens accessible from a bottom tab bar
         Each tab has its own navigation stack

Drawer:  Screens accessible from a side menu
         Swipe from left edge to open

Modal:   Screen that slides up from bottom, overlays previous screen
         Semi-transparent background showing parent

Group:   Logical grouping of routes (no visual navigator)
         Used for organization and shared layouts
```

---

## 2. Expo Router File System Conventions

### File → Route Mapping

```
app/
  _layout.tsx          →  Root navigator (wraps everything)
  index.tsx            →  / (home screen)
  about.tsx            →  /about

  (tabs)/
    _layout.tsx        →  Tab navigator
    index.tsx          →  / (first tab)
    explore.tsx        →  /explore (second tab)
    profile.tsx        →  /profile (third tab)

  (auth)/
    _layout.tsx        →  Auth group layout
    login.tsx          →  /login
    signup.tsx         →  /signup

  book/
    [id].tsx           →  /book/123 (dynamic route)
    [id]/
      chapter/
        [chapterId].tsx → /book/123/chapter/5

  (settings)/
    _layout.tsx        →  Settings group
    index.tsx          →  /settings
    account.tsx        →  /settings/account
    notifications.tsx  →  /settings/notifications

  modal.tsx            →  /modal (presented as modal)
  [...missing].tsx     →  Catch-all 404 route
```

### Special Files

```
_layout.tsx     Defines the navigator type and configuration
index.tsx       Default route for a directory (like index.html)
[param].tsx     Dynamic route segment
[...rest].tsx   Catch-all route (rest params)
+not-found.tsx  404 page
+html.tsx       Custom HTML wrapper (web only)
_sitemap.tsx    Auto-generated sitemap (development)
```

### File Naming Rules

```
(group)     Parentheses = route group (not in URL path)
[param]     Brackets = dynamic parameter
[...rest]   Spread = catch-all parameter
+file       Plus = special Expo Router file
_layout     Underscore prefix = layout file (not a route)
```

---

## 3. Stack Navigation (Push/Pop)

### Basic Stack

```typescript
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F9F9F9" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="book/[id]"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
```

### Navigating Between Screens

```typescript
import { router, Link } from "expo-router";

// Imperative
router.push("/book/123");                     // Push onto stack
router.replace("/home");                      // Replace current (no back)
router.back();                                // Pop one screen
router.dismiss();                             // Dismiss modal
router.dismissAll();                          // Dismiss all modals
router.canGoBack();                           // Check if back is possible
router.navigate("/book/123");                 // Push if not already there

// With typed params
router.push({
  pathname: "/book/[id]",
  params: { id: "123", title: "Atomic Habits" },
});

// Declarative
<Link href="/book/123">
  <Text>View Book</Text>
</Link>

// As child (pass press handler to child component)
<Link href="/book/123" asChild>
  <Pressable className="rounded-xl bg-surface p-4">
    <Text>View Book</Text>
  </Pressable>
</Link>
```

### Push vs Replace vs Navigate

```
router.push("/screen")
  - Always adds a new screen to the stack
  - Back button goes to previous screen
  - Can result in duplicate screens

router.replace("/screen")
  - Replaces current screen
  - Back button goes to screen BEFORE the replaced one
  - Use for: login → home (don't want user to "go back" to login)

router.navigate("/screen")
  - If screen is already in stack, goes to it (no duplicate)
  - If not in stack, pushes it
  - Safest for general navigation
```

---

## 4. Tab Navigation

### Full Tab Setup

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Home, Search, BookOpen, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#007A5E",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          tabBarBadge: 3, // Show badge with count
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Tab with Stack Inside

```
app/
  (tabs)/
    _layout.tsx          ← Tab navigator
    (home)/
      _layout.tsx        ← Stack navigator inside Home tab
      index.tsx          ← Home screen
      book/[id].tsx      ← Book detail (pushed on home's stack)
    (explore)/
      _layout.tsx        ← Stack inside Explore tab
      index.tsx
    (library)/
      _layout.tsx
      index.tsx
    (profile)/
      _layout.tsx
      index.tsx
      settings.tsx
```

```typescript
// app/(tabs)/(home)/_layout.tsx
import { Stack } from "expo-router";

export default function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book/[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
```

This way, navigating to a book from the Home tab pushes it onto the Home tab's stack, keeping the tab bar visible.

---

## 5. Drawer Navigation

```bash
npx expo install @react-navigation/drawer react-native-gesture-handler react-native-reanimated
```

```typescript
// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#FFFFFF",
          width: 280,
        },
        drawerActiveTintColor: "#007A5E",
        drawerInactiveTintColor: "#6B7280",
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
```

### Custom Drawer Content

```typescript
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

function CustomDrawerContent(props: any) {
  const { user } = useAuthStore();

  return (
    <DrawerContentScrollView {...props} className="flex-1">
      {/* User profile section */}
      <View className="border-b border-border p-4">
        <Image
          source={{ uri: user?.avatar }}
          className="h-16 w-16 rounded-full"
        />
        <Text className="mt-2 text-lg font-bold text-foreground">
          {user?.name}
        </Text>
        <Text className="text-sm text-foreground-secondary">{user?.email}</Text>
      </View>

      {/* Navigation items */}
      <DrawerItemList {...props} />

      {/* Footer */}
      <View className="mt-auto border-t border-border p-4">
        <Pressable onPress={logout} className="flex-row items-center gap-3">
          <LogOut size={20} color="#EF4444" />
          <Text className="text-destructive">Sign Out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

// Use in layout
<Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
```

---

## 6. Modal Screens

### Presentation Modes

```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" />

  {/* Full-screen modal */}
  <Stack.Screen
    name="modal"
    options={{
      presentation: "modal",
      animation: "slide_from_bottom",
    }}
  />

  {/* Transparent modal (background visible) */}
  <Stack.Screen
    name="overlay"
    options={{
      presentation: "transparentModal",
      animation: "fade",
      headerShown: false,
    }}
  />

  {/* Contained modal (iOS sheet-style) */}
  <Stack.Screen
    name="sheet"
    options={{
      presentation: "containedModal",
      sheetAllowedDetents: [0.5, 0.75, 1.0],    // iOS 16+ sheet heights
      sheetGrabberVisible: true,                  // Show drag handle
      sheetCornerRadius: 24,
      sheetExpandsWhenScrolledToEdge: true,
    }}
  />
</Stack>
```

### Transparent Overlay Modal

```typescript
// app/overlay.tsx
export default function OverlayScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-black/50">
      <Animated.View
        entering={ZoomIn.springify()}
        className="mx-6 w-full max-w-sm rounded-2xl bg-surface p-6"
      >
        <Text className="text-xl font-bold text-foreground">
          Are you sure?
        </Text>
        <Text className="mt-2 text-foreground-secondary">
          This action cannot be undone.
        </Text>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 rounded-xl bg-muted py-3"
          >
            <Text className="text-center font-semibold text-foreground">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            className="flex-1 rounded-xl bg-destructive py-3"
          >
            <Text className="text-center font-semibold text-white">
              Delete
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
```

### iOS Sheet Detents (Half-Screen Modal)

```typescript
<Stack.Screen
  name="filter-sheet"
  options={{
    presentation: "formSheet",
    sheetAllowedDetents: [0.25, 0.5, 1.0], // 25%, 50%, 100% of screen
    sheetLargestUndimmedDetent: 0.5,        // Don't dim background below 50%
    sheetGrabberVisible: true,
    sheetCornerRadius: 20,
  }}
/>
```

---

## 7. Nested Navigators

### Common Pattern: Tabs Inside Stack

```
Root Stack
  ├── (auth) Stack          ← Before login
  │   ├── login
  │   └── signup
  ├── (main) Tabs           ← After login
  │   ├── Home Stack
  │   │   ├── index
  │   │   └── book/[id]
  │   ├── Explore Stack
  │   │   ├── index
  │   │   └── category/[id]
  │   └── Profile Stack
  │       ├── index
  │       └── settings
  └── Modals                ← Overlay on everything
      ├── search
      └── share
```

```
app/
  _layout.tsx              ← Root Stack
  (auth)/
    _layout.tsx            ← Auth Stack
    login.tsx
    signup.tsx
  (main)/
    _layout.tsx            ← Tabs
    (home)/
      _layout.tsx          ← Home Stack
      index.tsx
      book/[id].tsx
    (explore)/
      _layout.tsx          ← Explore Stack
      index.tsx
      category/[id].tsx
    (profile)/
      _layout.tsx          ← Profile Stack
      index.tsx
      settings.tsx
  search-modal.tsx         ← Modal (defined in root stack)
  share-modal.tsx          ← Modal
```

### Navigating Across Navigators

```typescript
// From any screen, navigate to any route:
router.push("/search-modal");           // Opens modal over tabs
router.push("/(main)/(home)/book/123"); // Navigates within home tab
router.navigate("/(main)/(explore)");   // Switches to explore tab

// Dismiss all modals and go to a specific tab
router.dismissAll();
router.navigate("/(main)/(profile)");
```

---

## 8. Dynamic Routes & Params

### Single Dynamic Segment

```typescript
// app/book/[id].tsx
import { useLocalSearchParams, useGlobalSearchParams } from "expo-router";

export default function BookScreen() {
  // useLocalSearchParams: params for THIS screen only
  const { id } = useLocalSearchParams<{ id: string }>();

  // useGlobalSearchParams: all params in the URL
  // Useful for deeply nested routes
  const params = useGlobalSearchParams();

  return <BookDetail bookId={id} />;
}
```

### Multiple Dynamic Segments

```typescript
// app/book/[id]/chapter/[chapterId].tsx
export default function ChapterScreen() {
  const { id, chapterId } = useLocalSearchParams<{
    id: string;
    chapterId: string;
  }>();

  return <ChapterView bookId={id} chapterId={chapterId} />;
}
```

### Catch-All Routes

```typescript
// app/book/[...slug].tsx
// Matches: /book/anything/goes/here
export default function BookCatchAll() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  // slug = ["anything", "goes", "here"]
}
```

### Passing Params

```typescript
// Simple
router.push("/book/123");

// With additional params (query string)
router.push({
  pathname: "/book/[id]",
  params: {
    id: "123",
    title: "Atomic Habits",
    fromScreen: "home",
  },
});

// Access all params
const { id, title, fromScreen } = useLocalSearchParams();
```

### Setting Screen Options from Params

```typescript
// app/book/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: book } = useBook(id);

  return (
    <>
      {/* Dynamic header title */}
      <Stack.Screen
        options={{
          headerTitle: book?.title ?? "Loading...",
          headerRight: () => (
            <Pressable onPress={() => shareBook(id)}>
              <Share size={20} />
            </Pressable>
          ),
        }}
      />
      <BookDetail book={book} />
    </>
  );
}
```

---

## 9. Route Groups & Layouts

### What Route Groups Do

```
(auth)  → Groups auth screens together
         → Shares a layout (_layout.tsx)
         → Does NOT add to URL path
         → /login, not /(auth)/login
```

### Shared Layout Wrapper

```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F9F9F9" },
        animation: "fade",
      }}
    />
  );
}
```

### Layout with Shared UI

```typescript
// app/(settings)/_layout.tsx
export default function SettingsLayout() {
  return (
    <View className="flex-1 bg-background">
      {/* Shared header for all settings screens */}
      <View className="border-b border-border px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
      </View>
      {/* Settings screens render here */}
      <Slot />
    </View>
  );
}
```

### Multiple Groups Sharing Same Layout

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Only one group is rendered based on auth state */}
      <Stack.Screen
        name="(onboarding)"
        redirect={hasCompletedOnboarding}
      />
      <Stack.Screen
        name="(auth)"
        redirect={!hasCompletedOnboarding || isAuthenticated}
      />
      <Stack.Screen
        name="(tabs)"
        redirect={!isAuthenticated}
      />
    </Stack>
  );
}
```

---

## 10. Authentication Flow (Protected Routes)

### The Pattern You Should Use

```typescript
// app/_layout.tsx
import { useAuthStore } from "@/store/auth.store";

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasCompletedOnboarding);
  const hydrated = useAuthStore((s) => s._hydrated);

  // Wait for auth state to load from storage
  if (!hydrated) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!hasOnboarded ? (
        <Stack.Screen name="(onboarding)" />
      ) : !user ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
```

### Redirect Pattern (Alternative)

```typescript
// app/(tabs)/_layout.tsx
import { Redirect } from "expo-router";

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Tabs>{/* ... */}</Tabs>;
}
```

### After Login Navigation

```typescript
// After successful login:
async function handleLogin(credentials: LoginInput) {
  const { user, tokens } = await authApi.login(credentials);
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setTokens(tokens.access, tokens.refresh);

  // Option 1: Replace to prevent going back to login
  router.replace("/(tabs)");

  // Option 2: Let the layout handle it (if using conditional rendering)
  // The root layout will automatically show (tabs) when user is set
}
```

### Session Expiry Handling

```typescript
// When token refresh fails (in API interceptor):
function handleSessionExpired() {
  useAuthStore.getState().logout();

  // Navigate to login with a message
  router.replace({
    pathname: "/login",
    params: { message: "Session expired. Please log in again." },
  });
}
```

---

## 11. Deep Linking & Universal Links

### URL Scheme (Custom Protocol)

```json
// app.json
{
  "expo": {
    "scheme": "quickread"
  }
}
```

Now `quickread://book/123` opens your app to the book detail screen.

### Universal Links (HTTPS)

```json
// app.json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:quickread.app"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "quickread.app",
              "pathPrefix": "/book"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

Now `https://quickread.app/book/123` opens your app (if installed) or the website (if not).

### Apple App Site Association (AASA)

Host this at `https://quickread.app/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAMID.com.quickread.app"],
        "paths": ["/book/*", "/invite/*"]
      }
    ]
  }
}
```

### Android App Links

Host at `https://quickread.app/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.quickread.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

### Handling Incoming Links

```typescript
// Expo Router handles this automatically!
// quickread://book/123 → navigates to app/book/[id].tsx with id="123"
// https://quickread.app/book/123 → same thing

// For custom handling:
import { useURL } from "expo-linking";

function App() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      // Parse and handle custom logic
      console.log("Opened with URL:", url);
    }
  }, [url]);
}
```

### Testing Deep Links

```bash
# iOS Simulator
npx uri-scheme open "quickread://book/123" --ios

# Android Emulator
adb shell am start -a android.intent.action.VIEW -d "quickread://book/123"

# Expo development
npx expo start
# Then open: exp://192.168.1.x:8081/--/book/123
```

---

## 12. Screen Transitions & Animations

### Built-in Animations

```typescript
<Stack.Screen
  name="screen"
  options={{
    animation: "default",            // Platform default
    animation: "slide_from_right",   // Push from right
    animation: "slide_from_left",    // Push from left
    animation: "slide_from_bottom",  // Modal style
    animation: "fade",               // Crossfade
    animation: "fade_from_bottom",   // Fade + slide up
    animation: "flip",               // Flip transition
    animation: "simple_push",        // Simple push (no gesture)
    animation: "none",               // Instant (no animation)
  }}
/>
```

### Per-Screen Animations

```typescript
<Stack>
  <Stack.Screen
    name="(tabs)"
    options={{ animation: "fade" }}
  />
  <Stack.Screen
    name="book/[id]"
    options={{ animation: "slide_from_right" }}
  />
  <Stack.Screen
    name="modal"
    options={{
      presentation: "modal",
      animation: "slide_from_bottom",
      animationDuration: 250,
    }}
  />
  <Stack.Screen
    name="search"
    options={{
      animation: "fade",
      animationDuration: 150,
    }}
  />
</Stack>
```

### Custom Screen Animation

```typescript
<Stack.Screen
  name="custom"
  options={{
    customAnimationOnGesture: true,
    animation: "slide_from_right",
    gestureEnabled: true,
    gestureDirection: "horizontal",
    // Full custom animation config
    transitionSpec: {
      open: {
        animation: "spring",
        config: { damping: 20, stiffness: 200 },
      },
      close: {
        animation: "timing",
        config: { duration: 200 },
      },
    },
  }}
/>
```

---

## 13. Navigation State & Persistence

### Reading Navigation State

```typescript
import { usePathname, useSegments, useRootNavigationState } from "expo-router";

function DebugNavigation() {
  const pathname = usePathname();           // "/book/123"
  const segments = useSegments();           // ["book", "[id]"]
  const navState = useRootNavigationState();

  return (
    <View>
      <Text>Current: {pathname}</Text>
      <Text>Segments: {segments.join("/")}</Text>
    </View>
  );
}
```

### Tracking Screen Views (Analytics)

```typescript
// app/_layout.tsx
import { usePathname } from "expo-router";

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    // Track every screen view
    analytics.screen(pathname);
  }, [pathname]);

  return <Stack />;
}
```

### Persisting Navigation State

```typescript
// Restore user's position after app restart
import { useNavigationContainerRef } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PERSISTENCE_KEY = "NAVIGATION_STATE";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<any>();

  useEffect(() => {
    async function restoreState() {
      try {
        const saved = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (saved) {
          setInitialState(JSON.parse(saved));
        }
      } finally {
        setIsReady(true);
      }
    }
    restoreState();
  }, []);

  if (!isReady) return null;

  return (
    <Stack
      initialRouteName="(tabs)"
      // Save state on every change
      onStateChange={(state) => {
        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      }}
    />
  );
}
```

---

## 14. Bottom Sheets as Screens

### Using @gorhom/bottom-sheet with Navigation

```bash
npx expo install @gorhom/bottom-sheet
```

```typescript
// app/filter-sheet.tsx
import BottomSheet from "@gorhom/bottom-sheet";

export default function FilterSheet() {
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  return (
    <View className="flex-1 bg-black/50">
      <Pressable className="flex-1" onPress={() => router.back()} />

      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => router.back()}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
      >
        <View className="p-4">
          <Text className="text-xl font-bold">Filters</Text>
          {/* Filter content */}
        </View>
      </BottomSheet>
    </View>
  );
}
```

---

## 15. Type-Safe Navigation

### Enable Typed Routes

```json
// app.json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

You already have this enabled.

### Usage

```typescript
// TypeScript will now validate route paths
router.push("/book/123");           // Valid
router.push("/nonexistent");        // TypeScript error!

// Typed params
router.push({
  pathname: "/book/[id]",           // Autocomplete works
  params: { id: "123" },            // Required params enforced
});

// Link component is also typed
<Link href="/book/123">             // Valid
<Link href="/fake">                 // Error
```

### Custom Type Augmentation

```typescript
// types/expo-router.d.ts
import { type ExpoRouter } from "expo-router/build/types";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> {
      // Add custom routes if auto-detection misses them
      StaticRoutes: "/book/[id]" | "/(tabs)" | "/login";
      DynamicRoutes: `/book/${string}` | `/category/${string}`;
      DynamicRouteTemplate: "/book/[id]" | "/category/[id]";
    }
  }
}
```

---

## 16. Tab Bar Customization

### Custom Tab Bar Component

```typescript
// components/CustomTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row border-t border-border bg-surface pb-8 pt-2">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <AnimatedTab
            key={route.key}
            focused={isFocused}
            options={options}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

function AnimatedTab({ focused, options, onPress }: TabProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 15 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} className="flex-1 items-center gap-1">
      <Animated.View style={iconStyle}>
        {options.tabBarIcon?.({
          focused,
          color: focused ? "#007A5E" : "#9CA3AF",
          size: 24,
        })}
      </Animated.View>
      <Text
        className={`text-[10px] font-semibold ${
          focused ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {options.title}
      </Text>
    </Pressable>
  );
}

// Usage
<Tabs tabBar={(props) => <CustomTabBar {...props} />}>
```

### Floating Action Button in Tab Bar

```typescript
function CustomTabBarWithFAB(props: BottomTabBarProps) {
  return (
    <View className="relative">
      {/* Regular tab bar */}
      <CustomTabBar {...props} />

      {/* Floating center button */}
      <Pressable
        onPress={() => router.push("/new-note")}
        className="absolute -top-7 left-1/2 -ml-7 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Plus size={24} color="white" />
      </Pressable>
    </View>
  );
}
```

### Hide Tab Bar on Specific Screens

```typescript
// In a screen component:
import { useNavigation } from "expo-router";

export default function BookReaderScreen() {
  const navigation = useNavigation();

  // Hide tab bar when this screen is focused
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, []);

  return <ReaderView />;
}
```

---

## 17. Preventing Back Navigation

### Confirmation Before Leaving

```typescript
import { useNavigation } from "expo-router";

function EditScreen() {
  const navigation = useNavigation();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasChanges) return; // No unsaved changes, allow navigation

      e.preventDefault(); // Block navigation

      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [hasChanges, navigation]);

  return (
    <View>
      <TextInput
        onChangeText={() => setHasChanges(true)}
        placeholder="Write something..."
      />
    </View>
  );
}
```

### Disable Back Gesture

```typescript
<Stack.Screen
  name="payment"
  options={{
    gestureEnabled: false,          // Disable swipe back
    headerBackVisible: false,       // Hide back button
    headerLeft: () => null,         // Remove header left area
  }}
/>
```

---

## 18. Navigation Patterns for Common Flows

### Onboarding → Auth → Main App

```
First launch:  (onboarding) → interest-selection → (auth) → login → (tabs)
Return user:   (tabs) directly
Logged out:    (auth) → login
```

### Multi-Step Form (Wizard)

```
app/
  (wizard)/
    _layout.tsx        ← Stack with no header
    step-1.tsx
    step-2.tsx
    step-3.tsx
    confirmation.tsx

// step-1.tsx
router.push("/step-2");       // Next step

// step-3.tsx
router.push("/confirmation"); // Final step

// confirmation.tsx
router.dismissAll();           // Exit wizard completely
router.replace("/(tabs)");    // Go to main app
```

### Search Flow

```typescript
// Search is a modal over everything
<Stack.Screen
  name="search"
  options={{
    presentation: "fullScreenModal",
    animation: "fade",
    headerShown: false,
  }}
/>

// search.tsx
function SearchScreen() {
  const [query, setQuery] = useState("");
  const { data: results } = useBookSearch(query);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} />
        </Pressable>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search books..."
          autoFocus
          className="flex-1 rounded-xl bg-surface px-4 py-3"
        />
      </View>

      <FlatList
        data={results}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.back();                    // Close search
              router.push(`/book/${item.id}`);  // Navigate to book
            }}
          >
            <BookListItem book={item} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
```

---

## 19. Performance Optimization

### Lazy Loading Screens

```typescript
// Screens are lazy-loaded by default in Expo Router
// But you can explicitly control it:

<Tabs>
  <Tabs.Screen
    name="index"
    options={{ lazy: false }}  // Pre-load this tab
  />
  <Tabs.Screen
    name="explore"
    options={{ lazy: true }}   // Load only when first visited (default)
  />
</Tabs>
```

### Prevent Unnecessary Re-renders

```typescript
// Screen components re-render when focused
// Use useFocusEffect for focus-specific logic (not useEffect)

import { useFocusEffect } from "expo-router";

function HomeScreen() {
  useFocusEffect(
    useCallback(() => {
      // Runs when screen is focused
      refetchData();

      return () => {
        // Runs when screen loses focus
      };
    }, [])
  );
}
```

### Optimize Tab Switching

```typescript
// By default, tab screens are kept mounted when switching tabs
// This preserves scroll position and state

// To unmount inactive tabs (save memory):
<Tabs
  screenOptions={{
    unmountOnBlur: true, // Unmount when tab loses focus
  }}
/>

// Usually you want to KEEP tabs mounted (default behavior)
// Only unmount if memory is a concern
```

---

## 20. Debugging Navigation

### Common Issues

```
"Screen not found" error
  → File is not in the app/ directory
  → File name doesn't match route
  → _layout.tsx is missing in parent directory
  → Restart Metro: npx expo start --clear

"Couldn't find a navigation object"
  → You're using navigation hooks outside a screen component
  → Wrap with NavigationContainer if using React Navigation directly

Tab bar disappears on navigation
  → You're pushing a screen in the root stack instead of the tab's stack
  → Put the screen in the tab's directory, not the root

Double screens / duplicate push
  → Use router.navigate() instead of router.push()
  → router.navigate won't push if already on that screen

Gesture conflicts (swipe back vs drawer vs horizontal scroll)
  → Use gestureEnabled: false on specific screens
  → Configure gesture handlers with failOffset/activeOffset
```

### Debug Tools

```typescript
// Log all navigation events
import { useNavigationContainerRef } from "expo-router";

const ref = useNavigationContainerRef();

useEffect(() => {
  ref.addListener("state", (e) => {
    console.log("Nav State:", JSON.stringify(e.data.state, null, 2));
  });
}, []);
```

```bash
# See all registered routes
# In development, visit: http://localhost:8081/_sitemap
```
