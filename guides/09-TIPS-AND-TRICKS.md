# React Native Tips, Tricks & Common Patterns

> Every "how do I do X?" question answered. Background images, gradients, shadows, keyboards, status bars, safe areas, and 100+ practical snippets.

---

## Table of Contents

1. [Images & Backgrounds](#1-images--backgrounds)
2. [Gradients](#2-gradients)
3. [Shadows & Elevation](#3-shadows--elevation)
4. [Safe Areas & Notches](#4-safe-areas--notches)
5. [StatusBar & System UI](#5-statusbar--system-ui)
6. [Keyboard Handling](#6-keyboard-handling)
7. [Text & Fonts](#7-text--fonts)
8. [Scrolling Patterns](#8-scrolling-patterns)
9. [Responsive Design](#9-responsive-design)
10. [Modals & Overlays](#10-modals--overlays)
11. [Haptic Feedback](#11-haptic-feedback)
12. [Clipboard](#12-clipboard)
13. [Opening External Links](#13-opening-external-links)
14. [Share Sheet](#14-share-sheet)
15. [App State & Lifecycle](#15-app-state--lifecycle)
16. [Network Status](#16-network-status)
17. [AsyncStorage & MMKV](#17-asyncstorage--mmkv)
18. [Splash Screen Control](#18-splash-screen-control)
19. [Environment Variables](#19-environment-variables)
20. [Debugging Tricks](#20-debugging-tricks)
21. [Common Pitfalls & Fixes](#21-common-pitfalls--fixes)
22. [Performance Quick Wins](#22-performance-quick-wins)
23. [Platform-Specific Tricks](#23-platform-specific-tricks)
24. [Useful Snippets](#24-useful-snippets)

---

## 1. Images & Backgrounds

### Background Image

```typescript
import { ImageBackground } from "react-native";

function HeroSection() {
  return (
    <ImageBackground
      source={{ uri: "https://example.com/hero.jpg" }}
      // Or local: source={require("@/assets/images/hero.jpg")}
      className="h-64 w-full justify-end"
      resizeMode="cover"
    >
      {/* Dark overlay for text readability */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="p-6">
        <Text className="text-2xl font-bold text-white">
          Discover Great Books
        </Text>
        <Text className="mt-1 text-white/80">
          Read key insights in 15 minutes
        </Text>
      </View>
    </ImageBackground>
  );
}
```

### Background Image for Full Screen

```typescript
function SplashScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/bg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center justify-center">
        <Image
          source={require("@/assets/images/logo.png")}
          className="h-24 w-24"
        />
        <Text className="mt-4 text-3xl font-bold text-white">QuickRead</Text>
      </SafeAreaView>
    </ImageBackground>
  );
}
```

### expo-image (Better Performance)

```typescript
import { Image } from "expo-image";

// expo-image is ALWAYS preferred over RN Image
<Image
  source={{ uri: book.coverUrl }}
  placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
  contentFit="cover"          // "cover" | "contain" | "fill" | "none" | "scale-down"
  transition={200}            // Crossfade duration in ms
  cachePolicy="memory-disk"   // Cache aggressively
  recyclingKey={book.id}      // Optimization for list recycling
  className="h-48 w-32 rounded-xl"
/>
```

### Aspect Ratio

```typescript
// Fixed aspect ratio (e.g., book cover 2:3)
<View className="w-32 aspect-[2/3]">
  <Image source={{ uri: coverUrl }} className="h-full w-full rounded-lg" />
</View>

// Square
<View className="w-20 aspect-square">
  <Image source={{ uri: avatarUrl }} className="h-full w-full rounded-full" />
</View>

// 16:9 video thumbnail
<View className="w-full aspect-video">
  <Image source={{ uri: thumbnailUrl }} className="h-full w-full rounded-xl" />
</View>
```

### Circular Image (Avatar)

```typescript
function Avatar({
  uri,
  size = 40,
  fallbackInitials,
}: {
  uri: string | null;
  size?: number;
  fallbackInitials?: string;
}) {
  if (!uri) {
    return (
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center rounded-full bg-primary"
      >
        <Text className="font-bold text-primary-foreground">
          {fallbackInitials}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      className="rounded-full"
      contentFit="cover"
    />
  );
}
```

### Image with Loading Placeholder

```typescript
function BookCover({ uri, blurhash }: { uri: string; blurhash?: string }) {
  return (
    <View className="h-48 w-32 overflow-hidden rounded-xl bg-muted">
      <Image
        source={{ uri }}
        placeholder={blurhash ? { blurhash } : undefined}
        contentFit="cover"
        transition={300}
        className="h-full w-full"
      />
    </View>
  );
}
```

---

## 2. Gradients

```bash
npx expo install expo-linear-gradient
```

### Linear Gradient

```typescript
import { LinearGradient } from "expo-linear-gradient";

// Simple top-to-bottom
<LinearGradient
  colors={["#007A5E", "#004D3B"]}
  className="h-64 w-full rounded-2xl p-6"
>
  <Text className="text-2xl font-bold text-white">Featured Book</Text>
</LinearGradient>

// Diagonal gradient
<LinearGradient
  colors={["#667eea", "#764ba2"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  className="h-48 rounded-2xl"
/>

// Gradient overlay on image
<View className="h-64 overflow-hidden rounded-2xl">
  <Image source={{ uri: coverUrl }} className="absolute inset-0" />
  <LinearGradient
    colors={["transparent", "rgba(0,0,0,0.8)"]}
    className="flex-1 justify-end p-6"
  >
    <Text className="text-xl font-bold text-white">{title}</Text>
  </LinearGradient>
</View>

// Fade out at bottom of scrollable content
<LinearGradient
  colors={["transparent", "#F9F9F9"]}
  className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
/>
```

### Gradient Button

```typescript
function GradientButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["#007A5E", "#00A67E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="items-center rounded-xl px-6 py-4"
      >
        <Text className="text-lg font-bold text-white">{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
```

### Gradient Text (Trick)

```typescript
import MaskedView from "@react-native-masked-view/masked-view";

function GradientText({ text }: { text: string }) {
  return (
    <MaskedView
      maskElement={
        <Text className="text-3xl font-black">{text}</Text>
      }
    >
      <LinearGradient
        colors={["#007A5E", "#00D4AA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text className="text-3xl font-black opacity-0">{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
```

---

## 3. Shadows & Elevation

### Cross-Platform Shadows

```typescript
// iOS uses shadow* properties, Android uses elevation
// NativeWind handles some of this:

<View className="shadow-sm" />   // Small shadow
<View className="shadow-md" />   // Medium shadow
<View className="shadow-lg" />   // Large shadow
<View className="shadow-xl" />   // Extra large shadow

// Manual cross-platform shadow:
const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
});
```

### Shadow Presets

```typescript
const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
  }),
};
```

### Colored Shadow (iOS Only)

```typescript
<View
  style={{
    shadowColor: "#007A5E", // Green shadow!
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8, // Android can't do colored shadows
  }}
  className="rounded-2xl bg-primary p-6"
>
  <Text className="text-white">Card with green shadow</Text>
</View>
```

---

## 4. Safe Areas & Notches

### SafeAreaView

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

// Wrap screens to avoid notch, status bar, home indicator
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {children}
    </SafeAreaView>
  );
}

// edges prop controls which areas to pad:
edges={["top"]}               // Only pad top (notch/status bar)
edges={["top", "bottom"]}     // Top and bottom (home indicator)
edges={["left", "right"]}     // Landscape safe areas
edges={["top", "left", "right", "bottom"]} // All (default)
```

### useSafeAreaInsets

```typescript
import { useSafeAreaInsets } from "react-native-safe-area-context";

function FloatingButton() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ bottom: insets.bottom + 16 }}
      className="absolute right-4"
    >
      <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
        <Plus size={24} color="white" />
      </Pressable>
    </View>
  );
}
```

### Safe Area Cheat Sheet

```
iPhone (with notch/Dynamic Island):
  top: ~59px    (status bar + notch)
  bottom: ~34px (home indicator)

iPhone SE / older:
  top: ~20px    (status bar only)
  bottom: 0

Android:
  top: ~24-48px (status bar, varies by device)
  bottom: ~48px (navigation bar, if software buttons)

iPad:
  top: ~24px
  bottom: ~20px (home indicator on newer iPads)
```

---

## 5. StatusBar & System UI

### StatusBar

```typescript
import { StatusBar } from "expo-status-bar";

// In your root layout
<StatusBar style="auto" />        // Auto-detect based on background
<StatusBar style="dark" />        // Dark text (for light backgrounds)
<StatusBar style="light" />       // Light text (for dark backgrounds)
<StatusBar style="inverted" />    // Opposite of current scheme

// Hide status bar (full-screen mode)
<StatusBar hidden />

// Per-screen status bar
function BookReaderScreen() {
  return (
    <>
      <StatusBar style="light" hidden={isFullScreen} />
      <View className="flex-1 bg-black">{/* Reader content */}</View>
    </>
  );
}
```

### Android Navigation Bar

```bash
npx expo install expo-navigation-bar
```

```typescript
import * as NavigationBar from "expo-navigation-bar";

// Set navigation bar color to match your app
NavigationBar.setBackgroundColorAsync("#FFFFFF");
NavigationBar.setButtonStyleAsync("dark");  // Dark buttons on light bg

// Transparent navigation bar (content goes behind)
NavigationBar.setBackgroundColorAsync("transparent");
NavigationBar.setPositionAsync("absolute");

// Hide navigation bar (full immersion)
NavigationBar.setVisibilityAsync("hidden");
```

---

## 6. Keyboard Handling

### KeyboardAvoidingView (Basic)

```typescript
import { KeyboardAvoidingView, Platform } from "react-native";

<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  className="flex-1"
  keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
>
  {/* Your form content */}
</KeyboardAvoidingView>
```

### react-native-keyboard-controller (Better)

You already have this installed.

```typescript
import {
  KeyboardProvider,
  KeyboardAwareScrollView,
  useKeyboardHandler,
} from "react-native-keyboard-controller";

// Wrap your app
// app/_layout.tsx
<KeyboardProvider>
  <Stack />
</KeyboardProvider>

// In forms
function LoginForm() {
  return (
    <KeyboardAwareScrollView
      bottomOffset={50}      // Extra padding below focused input
      className="flex-1 bg-background p-6"
    >
      <TextInput placeholder="Email" />
      <TextInput placeholder="Password" />
      <Pressable className="mt-4 bg-primary">
        <Text>Sign In</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
```

### Dismiss Keyboard

```typescript
import { Keyboard, TouchableWithoutFeedback } from "react-native";

// Tap outside to dismiss
<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View className="flex-1">{/* content */}</View>
</TouchableWithoutFeedback>

// Or use a ScrollView (has built-in keyboard dismiss)
<ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
  {/* content */}
</ScrollView>

// keyboardDismissMode options:
// "none"     - Don't dismiss on scroll
// "on-drag"  - Dismiss when user starts scrolling
// "interactive" - Dismiss follows finger (iOS only, like iMessage)

// keyboardShouldPersistTaps options:
// "never"    - Tapping outside input dismisses keyboard AND doesn't trigger the tap
// "always"   - Tapping a button works even when keyboard is open
// "handled"  - Taps handled by children work, others dismiss keyboard (RECOMMENDED)
```

### Keyboard Events

```typescript
import { Keyboard } from "react-native";

useEffect(() => {
  const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
    console.log("Keyboard height:", e.endCoordinates.height);
  });
  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    console.log("Keyboard hidden");
  });

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);
```

---

## 7. Text & Fonts

### Custom Fonts (DM Sans - Your Font)

```typescript
// Already set up in your project with expo-font
import { useFonts } from "expo-font";

const [fontsLoaded] = useFonts({
  "DMSans-Regular": require("@/assets/fonts/DMSans-Regular.ttf"),
  "DMSans-Medium": require("@/assets/fonts/DMSans-Medium.ttf"),
  "DMSans-Bold": require("@/assets/fonts/DMSans-Bold.ttf"),
});
```

### Text Truncation

```typescript
// Single line with ellipsis
<Text numberOfLines={1} className="text-base text-foreground">
  This very long book title will be truncated with...
</Text>

// Multi-line clamp
<Text numberOfLines={3} className="text-sm text-foreground-secondary">
  This description will show at most 3 lines and then truncate with ellipsis at the end...
</Text>

// "Read more" pattern
function ExpandableText({ text, maxLines = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <Text
        numberOfLines={expanded ? undefined : maxLines}
        className="text-base text-foreground"
      >
        {text}
      </Text>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text className="mt-1 font-medium text-primary">
          {expanded ? "Read less" : "Read more"}
        </Text>
      </Pressable>
    </View>
  );
}
```

### Selectable Text

```typescript
// By default, text is NOT selectable in React Native
<Text selectable className="text-base text-foreground">
  Users can select and copy this text.
</Text>
```

### Rich Text / Nested Styles

```typescript
<Text className="text-base text-foreground">
  This is normal text with{" "}
  <Text className="font-bold">bold text</Text> and{" "}
  <Text className="italic text-primary">colored italic text</Text> and{" "}
  <Text className="underline">underlined text</Text>.
</Text>
```

---

## 8. Scrolling Patterns

### Scroll to Top on Tab Press

```typescript
function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to top when tab is pressed again
  useScrollToTop(scrollRef);

  return (
    <ScrollView ref={scrollRef}>
      {/* content */}
    </ScrollView>
  );
}
```

### Horizontal Scroll Cards

```typescript
function FeaturedBooks({ books }: { books: Book[] }) {
  return (
    <View>
      <Text className="mb-3 px-4 text-xl font-bold text-foreground">
        Featured
      </Text>
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item }) => (
          <View className="w-40">
            <Image source={{ uri: item.coverUrl }} className="h-56 w-40 rounded-xl" />
            <Text numberOfLines={1} className="mt-2 font-medium text-foreground">
              {item.title}
            </Text>
          </View>
        )}
        snapToInterval={160 + 12}  // Card width + gap
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
```

### Sticky Headers

```typescript
<ScrollView
  stickyHeaderIndices={[0, 4, 8]} // Indices of sticky elements
>
  <View>{/* This sticks at index 0 */}</View>
  <View>{/* content */}</View>
  <View>{/* content */}</View>
  <View>{/* content */}</View>
  <View>{/* This sticks at index 4 */}</View>
  {/* ... */}
</ScrollView>

// SectionList has built-in sticky headers
<SectionList
  sections={data}
  stickySectionHeadersEnabled
  renderSectionHeader={({ section }) => (
    <View className="bg-background px-4 py-2">
      <Text className="font-bold text-foreground">{section.title}</Text>
    </View>
  )}
/>
```

### Scroll Position Tracking

```typescript
const [scrollPercent, setScrollPercent] = useState(0);

<ScrollView
  onScroll={(e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const percent =
      contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setScrollPercent(Math.min(1, Math.max(0, percent)));
  }}
  scrollEventThrottle={16}
>
```

---

## 9. Responsive Design

### Screen Dimensions

```typescript
import { useWindowDimensions, Dimensions } from "react-native";

function ResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  return (
    <View className={`flex-1 ${isTablet ? "flex-row" : "flex-col"}`}>
      <View className={isTablet ? "w-1/3" : "w-full"}>
        <SidePanel />
      </View>
      <View className="flex-1">
        <MainContent />
      </View>
    </View>
  );
}
```

### Responsive Grid

```typescript
function BookGrid({ books }: { books: Book[] }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : width > 480 ? 3 : 2;
  const cardWidth = (width - 16 * 2 - 12 * (numColumns - 1)) / numColumns;

  return (
    <FlatList
      data={books}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={{ padding: 16 }}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <BookCard book={item} />
        </View>
      )}
    />
  );
}
```

### Responsive Font Sizes

```typescript
import { PixelRatio } from "react-native";

// Scale font based on screen width
function normalize(size: number): number {
  const { width } = Dimensions.get("window");
  const scale = width / 375; // iPhone standard width
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
}

// Usage
<Text style={{ fontSize: normalize(16) }}>Scales with screen</Text>
```

---

## 10. Modals & Overlays

### Simple Alert

```typescript
import { Alert } from "react-native";

Alert.alert(
  "Delete Book",                           // Title
  "Are you sure you want to remove this?", // Message
  [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: () => deleteBook(bookId),
    },
  ]
);
```

### Action Sheet

```typescript
import { ActionSheetIOS, Platform } from "react-native";

function showOptions() {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Share", "Edit", "Delete"],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1: shareBook(); break;
          case 2: editBook(); break;
          case 3: deleteBook(); break;
        }
      }
    );
  } else {
    // Android: Use a custom bottom sheet or Alert
    Alert.alert("Options", "", [
      { text: "Share", onPress: shareBook },
      { text: "Edit", onPress: editBook },
      { text: "Delete", onPress: deleteBook, style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  }
}
```

### Toast/Snackbar (Build Your Own)

```typescript
// store/toast.store.ts
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = "info") => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// components/ToastContainer.tsx
function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ top: insets.top + 8 }}
      className="absolute left-4 right-4 z-50 gap-2"
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          entering={SlideInDown.springify().damping(15)}
          exiting={FadeOutUp.duration(200)}
          className={cn(
            "flex-row items-center gap-2 rounded-xl p-4 shadow-md",
            toast.type === "success" && "bg-green-500",
            toast.type === "error" && "bg-destructive",
            toast.type === "info" && "bg-foreground"
          )}
        >
          {toast.type === "success" && <Check size={18} color="white" />}
          {toast.type === "error" && <X size={18} color="white" />}
          <Text className="flex-1 font-medium text-white">{toast.message}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// Usage anywhere
const showToast = useToastStore((s) => s.show);
showToast("Book saved!", "success");
showToast("Something went wrong", "error");
```

---

## 11. Haptic Feedback

```typescript
import * as Haptics from "expo-haptics";

// Impact (physical tap feeling)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // Subtle
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // Default
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);   // Strong

// Notification (semantic feedback)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Checkmark
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Caution
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   // Failed

// Selection (subtle click - for pickers, toggles)
Haptics.selectionAsync();

// When to use:
// - Button taps: Light impact
// - Toggle switches: Selection
// - Swipe actions: Medium impact
// - Destructive actions: Error notification
// - Success states: Success notification
// - Long press activation: Heavy impact
// - Pull to refresh trigger: Medium impact
```

---

## 12. Clipboard

```bash
npx expo install expo-clipboard
```

```typescript
import * as Clipboard from "expo-clipboard";

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  showToast("Copied!", "success");
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Read from clipboard
const paste = async () => {
  const text = await Clipboard.getStringAsync();
  console.log("Pasted:", text);
};

// Check if clipboard has text
const hasContent = await Clipboard.hasStringAsync();
```

---

## 13. Opening External Links

```typescript
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

// Open in external browser (leaves your app)
Linking.openURL("https://quickread.app");

// Open in-app browser (stays in your app - PREFERRED)
WebBrowser.openBrowserAsync("https://quickread.app", {
  presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  controlsColor: "#007A5E",
  toolbarColor: "#FFFFFF",
});

// Open system settings
Linking.openSettings();

// Open email
Linking.openURL("mailto:support@quickread.app?subject=Help");

// Open phone
Linking.openURL("tel:+1234567890");

// Open SMS
Linking.openURL("sms:+1234567890");

// Open maps
const address = encodeURIComponent("Times Square, New York");
Linking.openURL(
  Platform.select({
    ios: `maps://app?q=${address}`,
    android: `geo:0,0?q=${address}`,
  })!
);

// Check if URL can be opened
const canOpen = await Linking.canOpenURL("instagram://");
if (canOpen) {
  Linking.openURL("instagram://user?username=quickread");
}
```

---

## 14. Share Sheet

```typescript
import { Share } from "react-native";

async function shareBook(book: Book) {
  try {
    const result = await Share.share({
      message: `Check out "${book.title}" on QuickRead!\nhttps://quickread.app/book/${book.id}`,
      // iOS only:
      url: `https://quickread.app/book/${book.id}`,
      title: book.title,
    });

    if (result.action === Share.sharedAction) {
      // Shared successfully
      if (result.activityType) {
        // iOS: tells you how they shared (Messages, Mail, etc.)
        console.log("Shared via:", result.activityType);
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed share sheet (iOS only)
    }
  } catch (error) {
    console.error("Share failed:", error);
  }
}
```

---

## 15. App State & Lifecycle

```typescript
import { AppState, type AppStateStatus } from "react-native";

function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const previousState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      previousState.current = appState;
      setAppState(nextState);
    });
    return () => sub.remove();
  }, [appState]);

  return {
    appState,
    isActive: appState === "active",
    isBackground: appState === "background",
    justBecameActive:
      previousState.current.match(/inactive|background/) &&
      appState === "active",
  };
}

// Common uses:
// - Refresh data when app becomes active
// - Pause timers when backgrounded
// - Show privacy screen when inactive
// - Reconnect WebSocket when active
```

---

## 16. Network Status

```bash
npx expo install @react-native-community/netinfo
```

```typescript
import NetInfo from "@react-native-community/netinfo";

function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type); // "wifi" | "cellular" | "none" | etc.
    });
    return () => unsubscribe();
  }, []);

  return { isConnected, connectionType };
}

// Offline banner
function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutUp}
      className="bg-destructive px-4 py-2"
    >
      <Text className="text-center text-sm font-medium text-white">
        No internet connection
      </Text>
    </Animated.View>
  );
}
```

---

## 17. AsyncStorage & MMKV

### AsyncStorage (Simple)

```bash
npx expo install @react-native-async-storage/async-storage
```

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("key", "value");
const value = await AsyncStorage.getItem("key");
await AsyncStorage.removeItem("key");
await AsyncStorage.clear(); // Remove all
await AsyncStorage.multiSet([
  ["key1", "value1"],
  ["key2", "value2"],
]);
```

### MMKV (10x Faster)

```bash
npx expo install react-native-mmkv
```

```typescript
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

// Synchronous! No async/await needed
storage.set("key", "value");
storage.set("number", 42);
storage.set("bool", true);

const value = storage.getString("key");
const num = storage.getNumber("number");
const bool = storage.getBoolean("bool");

storage.delete("key");
storage.clearAll();

// Use as Zustand storage
import { StateStorage } from "zustand/middleware";

const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};
```

---

## 18. Splash Screen Control

```typescript
import * as SplashScreen from "expo-splash-screen";

// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
        await hydrateStores();
        // Don't await data fetching - let screens handle that
      } finally {
        setReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return <Stack />;
}
```

---

## 19. Environment Variables

```
# .env
EXPO_PUBLIC_API_URL=https://api.quickread.app
EXPO_PUBLIC_GOOGLE_MAPS_KEY=AIza...

# EXPO_PUBLIC_ prefix = accessible in JS
# Without prefix = only available in build config
```

```typescript
// Access in code
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// Type-safe env
// utils/env.ts
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL!,
  googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY!,
} as const;
```

---

## 20. Debugging Tricks

```typescript
// 1. Quick debug border (see layout)
<View className="border border-red-500">{/* See the boundaries */}</View>

// 2. Console methods
console.group("API Call");
console.log("URL:", url);
console.table(data);
console.time("operation");
/* ... */ console.timeEnd("operation");
console.groupEnd();

// 3. Component render tracking
useEffect(() => {
  console.log("Component rendered:", new Date().toISOString());
});

// 4. Debug async storage contents
async function dumpStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.table(items);
}

// 5. Show dev menu
// iOS Simulator: Cmd + D
// Android Emulator: Cmd + M (Mac) / Ctrl + M (Windows)
// Physical device: Shake

// 6. Clear metro cache
// npx expo start --clear
```

---

## 21. Common Pitfalls & Fixes

```typescript
// PITFALL: Text not rendering
// React Native REQUIRES all text to be inside <Text>
// BAD:
<View>Hello</View>
// GOOD:
<View><Text>Hello</Text></View>

// PITFALL: FlatList in ScrollView
// BAD: VirtualizedLists should never be nested inside ScrollViews
<ScrollView>
  <FlatList data={items} />
</ScrollView>
// GOOD: Use FlatList's header/footer
<FlatList
  data={items}
  ListHeaderComponent={<HeaderContent />}
/>

// PITFALL: Image without dimensions
// React Native images NEED explicit width and height (or flex)
// BAD:
<Image source={{ uri: url }} />
// GOOD:
<Image source={{ uri: url }} className="h-48 w-full" />

// PITFALL: Percent width in a non-flex parent
// BAD:
<View><View style={{ width: "50%" }} /></View>
// GOOD:
<View className="flex-row"><View className="flex-1" /></View>

// PITFALL: Android back button not working in modals
// Add handler:
useEffect(() => {
  const sub = BackHandler.addEventListener("hardwareBackPress", () => {
    router.back();
    return true;
  });
  return () => sub.remove();
}, []);

// PITFALL: Memory leak from subscriptions
// ALWAYS clean up in useEffect return
useEffect(() => {
  const sub = Something.addListener(handler);
  return () => sub.remove(); // CLEANUP
}, []);
```

---

## 22. Performance Quick Wins

```typescript
// 1. Use FlashList instead of FlatList
import { FlashList } from "@shopify/flash-list";
<FlashList estimatedItemSize={80} data={items} renderItem={renderItem} />

// 2. Memoize renderItem
const renderItem = useCallback(({ item }) => <BookCard book={item} />, []);

// 3. Memoize expensive components
const MemoBookCard = React.memo(BookCard);

// 4. Use expo-image instead of Image
import { Image } from "expo-image";

// 5. Debounce search input
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// 6. Use InteractionManager for heavy work after navigation
InteractionManager.runAfterInteractions(() => {
  heavyComputation();
});

// 7. Avoid inline objects in JSX
// BAD (creates new object every render):
<View style={{ marginTop: 10 }} />
// GOOD:
<View className="mt-2.5" />
```

---

## 23. Platform-Specific Tricks

```typescript
import { Platform } from "react-native";

// Conditional value
const paddingTop = Platform.OS === "ios" ? 20 : 0;

// Platform.select
const Component = Platform.select({
  ios: IOSComponent,
  android: AndroidComponent,
  default: DefaultComponent,
});

// File-based (.ios.tsx / .android.tsx)
// Button.tsx         → default
// Button.ios.tsx     → iOS override
// Button.android.tsx → Android override

// Version check
if (Platform.OS === "ios" && parseInt(Platform.Version, 10) >= 16) {
  // iOS 16+ specific code
}
if (Platform.OS === "android" && Platform.Version >= 33) {
  // Android 13+ specific code
}
```

---

## 24. Useful Snippets

### UUID Generation

```typescript
import * as Crypto from "expo-crypto";

const uuid = Crypto.randomUUID();
```

### Debounce Hook

```typescript
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Previous Value Hook

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

### Interval Hook

```typescript
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

### Format File Size

```typescript
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
```

### Time Ago

```typescript
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
```
