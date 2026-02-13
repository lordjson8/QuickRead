# The Complete React Native + Expo Course

> From zero to production app. Every concept, in order, with code you can run.

---

## Course Map

```
Phase 1: Foundations          [Weeks 1-2]
Phase 2: Core Building Blocks [Weeks 3-4]
Phase 3: Real App Features    [Weeks 5-7]
Phase 4: Production Polish    [Weeks 8-10]
Phase 5: Senior Patterns      [Weeks 11-12]
```

---

# Phase 1: Foundations

---

## Module 1: How React Native Works

### 1.1 The Architecture

React Native renders **real native views**, not a WebView. Your `<View>` becomes `UIView` (iOS) or `android.view.View` (Android).

```
Your JSX Code          Native Platform
─────────────          ───────────────
<View>            →    UIView / android.view.View
<Text>            →    UILabel / TextView
<Image>           →    UIImageView / ImageView
<ScrollView>      →    UIScrollView / ScrollView
<TextInput>       →    UITextField / EditText
<Pressable>       →    UIButton / View with touch handler
```

### 1.2 New Architecture (What You Have)

Your project has `"newArchEnabled": true`. This means you're using:

```
Old Architecture:               New Architecture (yours):
JS → Bridge → Native            JS → JSI → Native
     (async, JSON)                   (sync, direct)

Bridge: Serializes everything    JSI: Direct memory access
to JSON, sends async.           No serialization. Synchronous.
Slow for frequent updates.      Fast for everything.
```

**Fabric** — New rendering system. Synchronous layout measurements.
**TurboModules** — Native modules loaded lazily. Accessed via JSI.
**Codegen** — Auto-generates native interfaces from TypeScript specs.

### 1.3 The Thread Model

```
JS Thread:     Runs your React code, business logic
UI Thread:     Renders native views, handles touch
Shadow Thread: Calculates layout (Yoga engine)
```

Rule: Never block the JS thread with heavy computation. The UI thread handles animations and touch — if you run animations via Reanimated, they stay on the UI thread and JS thread can do other work.

---

## Module 2: Expo Fundamentals

### 2.1 What Expo Is

Expo is a platform built around React Native that provides:
- **Expo SDK** — Curated native APIs (camera, location, notifications, etc.)
- **Expo CLI** — Development tools (start, build, update)
- **EAS** — Cloud build and deployment service
- **Expo Router** — File-based routing
- **Expo Dev Client** — Custom development build

### 2.2 Project Structure Explained

```
app/                    File-based routes (screens)
components/             Reusable UI components
assets/                 Fonts, images, static files
constants/              App-wide constants (colors, config)
hooks/                  Custom React hooks
lib/                    Utilities and helpers
services/               API and external service integrations
store/                  Global state (Zustand stores)
types/                  TypeScript type definitions
utils/                  Pure utility functions

app.json                Expo configuration
babel.config.js         Babel plugins
metro.config.js         Metro bundler config
tailwind.config.js      Tailwind/NativeWind config
tsconfig.json           TypeScript configuration
package.json            Dependencies and scripts
```

### 2.3 Running Your App

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# Clear cache (when things break)
npx expo start --clear

# Create a development build (for native modules)
npx expo run:ios
npx expo run:android
```

### 2.4 Expo Go vs Development Build

```
Expo Go:
  - Pre-built app from App/Play Store
  - Fast to start developing
  - Limited to Expo SDK modules
  - Can't use custom native code

Development Build (what you should use):
  - Custom app built for your project
  - Supports ALL native modules
  - Faster startup (no Expo Go overhead)
  - Required for google-signin, etc.

Command: eas build --profile development
```

---

## Module 3: TypeScript for React Native

### 3.1 Why TypeScript

TypeScript catches bugs before runtime. In a mobile app, a runtime crash means:
- The app closes
- User sees nothing helpful
- You lose trust

TypeScript prevents entire categories of bugs: null access, wrong prop types, missing fields.

### 3.2 Essential Types

```typescript
// Primitive types
const name: string = "QuickRead";
const count: number = 42;
const active: boolean = true;
const nothing: null = null;
const missing: undefined = undefined;

// Arrays
const ids: string[] = ["a", "b", "c"];
const numbers: Array<number> = [1, 2, 3];

// Objects
interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  readTime: number;         // minutes
  rating: number;
  isBookmarked: boolean;
  chapters: Chapter[];
  publishedAt: string;      // ISO date
  tags?: string[];           // Optional
}

// Functions
function greet(name: string): string {
  return `Hello, ${name}`;
}

const add = (a: number, b: number): number => a + b;

// Async functions
async function fetchBook(id: string): Promise<Book> {
  const response = await api.get(`/books/${id}`);
  return response.data;
}
```

### 3.3 React Native Specific Types

```typescript
import { type ViewProps, type TextProps, type TextInputProps } from "react-native";

// Component props extending native props
interface CardProps extends ViewProps {
  title: string;
  variant?: "default" | "outlined";
}

// Children prop
interface ScreenProps {
  children: React.ReactNode;   // Any renderable content
}

// Event handlers
import { type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  const offsetY = e.nativeEvent.contentOffset.y;
};

// Navigation params
import { useLocalSearchParams } from "expo-router";

const { id } = useLocalSearchParams<{ id: string }>();

// Style props
import { type StyleProp, type ViewStyle, type TextStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
```

### 3.4 Advanced Patterns

```typescript
// Discriminated unions (state machines)
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useRequest<T>() {
  const [state, setState] = useState<RequestState<T>>({ status: "idle" });
  // TypeScript narrows the type in switch/if:
  if (state.status === "success") {
    state.data; // TypeScript knows 'data' exists here
  }
}

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function GenericList<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <View>
      {items.map((item) => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
    </View>
  );
}

// Usage - TypeScript infers T from items
<GenericList
  items={books}
  renderItem={(book) => <Text>{book.title}</Text>}
  keyExtractor={(book) => book.id}
/>
```

---

## Module 4: React Fundamentals

### 4.1 Components

```typescript
// Function component (the only kind you'll write)
function BookCard({ book }: { book: Book }) {
  return (
    <View className="rounded-xl bg-surface p-4">
      <Text className="text-lg font-bold text-foreground">{book.title}</Text>
      <Text className="text-foreground-secondary">{book.author}</Text>
    </View>
  );
}

// Export default for screen files (Expo Router requires it)
export default function HomeScreen() {
  return <View className="flex-1 bg-background">{/* content */}</View>;
}
```

### 4.2 Props

```typescript
// Define what your component accepts
interface ButtonProps {
  label: string;                      // Required
  onPress: () => void;                // Required
  variant?: "primary" | "secondary";  // Optional with default
  disabled?: boolean;                 // Optional
  icon?: React.ReactNode;             // Optional renderable
}

function Button({
  label,
  onPress,
  variant = "primary",  // Default value
  disabled = false,
  icon,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-xl px-6 py-3",
        variant === "primary" && "bg-primary",
        variant === "secondary" && "bg-secondary",
        disabled && "opacity-50"
      )}
    >
      {icon}
      <Text
        className={cn(
          "font-semibold",
          variant === "primary" && "text-primary-foreground",
          variant === "secondary" && "text-secondary-foreground"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Usage
<Button label="Get Started" onPress={handleStart} />
<Button label="Cancel" variant="secondary" onPress={handleCancel} />
<Button label="Delete" onPress={handleDelete} disabled={isLoading} />
```

### 4.3 State (useState)

```typescript
function Counter() {
  const [count, setCount] = useState(0); // Initial value: 0

  return (
    <View className="items-center gap-4">
      <Text className="text-4xl font-bold">{count}</Text>
      <View className="flex-row gap-4">
        <Button label="-" onPress={() => setCount(count - 1)} />
        <Button label="+" onPress={() => setCount(count + 1)} />
      </View>
    </View>
  );
}

// State rules:
// 1. State updates trigger re-renders
// 2. State updates are batched (multiple setStates = one render)
// 3. State updates with objects/arrays need new references:

const [user, setUser] = useState({ name: "John", age: 25 });
// BAD: mutating the existing object
user.name = "Jane";
setUser(user); // Won't re-render! Same reference.
// GOOD: create a new object
setUser({ ...user, name: "Jane" }); // New object = re-render

const [items, setItems] = useState(["a", "b"]);
// BAD
items.push("c");
setItems(items);
// GOOD
setItems([...items, "c"]);
```

### 4.4 Effects (useEffect)

```typescript
// useEffect synchronizes your component with external systems

// Run once on mount
useEffect(() => {
  fetchData();
}, []); // Empty array = run once

// Run when dependency changes
useEffect(() => {
  fetchBookDetails(bookId);
}, [bookId]); // Runs when bookId changes

// Cleanup (subscriptions, timers)
useEffect(() => {
  const timer = setInterval(() => tick(), 1000);
  return () => clearInterval(timer); // Cleanup on unmount
}, []);

// Common pattern: fetch data
useEffect(() => {
  let cancelled = false;

  async function load() {
    const data = await fetchBooks();
    if (!cancelled) { // Prevent state update after unmount
      setBooks(data);
    }
  }

  load();
  return () => { cancelled = true; };
}, []);
```

### 4.5 Lists & Keys

```typescript
// Short lists (< 50 items): use .map()
<View>
  {categories.map((cat) => (
    <Text key={cat.id}>{cat.name}</Text> // key is REQUIRED
  ))}
</View>

// Long lists: use FlatList (virtualizes — only renders visible items)
<FlatList
  data={books}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <BookCard book={item} />}
/>

// Why keys matter:
// Keys tell React which items changed, were added, or removed.
// Without proper keys, React re-renders everything on every update.
// NEVER use array index as key if the list can reorder.
```

### 4.6 Conditional Rendering

```typescript
function BookScreen({ book }: { book: Book | null }) {
  // Pattern 1: Early return
  if (!book) return <Text>Book not found</Text>;

  // Pattern 2: Ternary
  return (
    <View>
      {book.isBookmarked ? (
        <BookmarkFilled size={20} />
      ) : (
        <Bookmark size={20} />
      )}

      {/* Pattern 3: Logical AND (show if truthy) */}
      {book.tags && book.tags.length > 0 && (
        <View className="flex-row gap-1">
          {book.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
      )}

      {/* Pattern 4: Nullish coalescing */}
      <Text>{book.subtitle ?? "No subtitle"}</Text>
    </View>
  );
}
```

---

# Phase 2: Core Building Blocks

---

## Module 5: Core Components Deep Dive

### 5.1 View (Layout Container)

```typescript
// View is the fundamental building block. It's a flexbox container.
// Flexbox defaults in RN are DIFFERENT from web:
// - flexDirection: "column" (not "row")
// - alignItems: "stretch" (not "normal")

// Vertical stack (default)
<View className="gap-4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</View>

// Horizontal row
<View className="flex-row items-center gap-3">
  <Image source={avatar} className="h-10 w-10 rounded-full" />
  <Text className="font-medium">John Doe</Text>
</View>

// Centered content
<View className="flex-1 items-center justify-center">
  <Text>Perfectly centered</Text>
</View>

// Space between
<View className="flex-row items-center justify-between">
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Absolute positioning
<View className="relative h-48">
  <Image source={cover} className="absolute inset-0" />
  <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
    <Text className="text-white">Overlay text</Text>
  </View>
</View>
```

### 5.2 Text

```typescript
// ALL text MUST be inside <Text> components
// Unlike web, you can't put strings directly in <View>

<Text className="text-base text-foreground">Regular text</Text>
<Text className="text-2xl font-bold text-foreground">Heading</Text>
<Text className="text-sm text-foreground-secondary">Caption</Text>

// Nested styles
<Text className="text-base">
  Normal <Text className="font-bold">bold</Text> normal
</Text>

// Truncation
<Text numberOfLines={2}>Long text that will truncate after 2 lines...</Text>

// Adjustable font size
<Text adjustsFontSizeToFit numberOfLines={1}>
  This text shrinks to fit one line
</Text>
```

### 5.3 TextInput

```typescript
function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <TextInput
      value={query}
      onChangeText={setQuery}           // Called on every keystroke
      placeholder="Search books..."
      placeholderTextColor="#9CA3AF"
      className="rounded-xl bg-surface px-4 py-3 text-base text-foreground"

      // Keyboard type
      keyboardType="default"            // "email-address", "numeric", "phone-pad", "url"

      // Behavior
      autoCapitalize="none"             // "none", "sentences", "words", "characters"
      autoCorrect={false}
      autoComplete="email"              // Autofill hint: "email", "password", "name", etc.
      secureTextEntry={false}           // Password field
      multiline={false}                 // Multi-line input
      maxLength={100}                   // Character limit
      editable={true}                   // Disable input

      // Return key
      returnKeyType="search"            // "done", "go", "next", "search", "send"
      onSubmitEditing={() => search(query)}

      // Events
      onFocus={() => console.log("Focused")}
      onBlur={() => console.log("Blurred")}
    />
  );
}
```

### 5.4 Pressable (Touch Handler)

```typescript
// Pressable is the modern touch handler. Prefer it over TouchableOpacity.

<Pressable
  onPress={() => console.log("Tapped")}
  onPressIn={() => console.log("Finger down")}
  onPressOut={() => console.log("Finger up")}
  onLongPress={() => console.log("Long pressed")}
  delayLongPress={500}
  hitSlop={10}                          // Extend touch area
  disabled={false}
  className="active:opacity-80 rounded-xl bg-primary px-6 py-3"
>
  <Text className="text-center font-semibold text-white">Press Me</Text>
</Pressable>
```

### 5.5 FlatList (Virtualized List)

```typescript
// THE most important component for lists. It virtualizes — only renders
// items visible on screen + a buffer. This means 10,000 items perform
// the same as 10 items.

function BookList({ books }: { books: Book[] }) {
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BookCard book={item} />}

      // Spacing
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View className="h-3" />}

      // Header & Footer
      ListHeaderComponent={<SearchBar />}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      ListEmptyComponent={<EmptyState message="No books found" />}

      // Pagination
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}

      // Pull to refresh
      refreshing={refreshing}
      onRefresh={onRefresh}

      // Performance
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
}
```

### 5.6 SectionList (Grouped List)

```typescript
const sections = [
  { title: "Continue Reading", data: continueBooks },
  { title: "Recommended", data: recommendedBooks },
  { title: "New Releases", data: newBooks },
];

<SectionList
  sections={sections}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <BookCard book={item} />}
  renderSectionHeader={({ section }) => (
    <View className="bg-background px-4 py-2">
      <Text className="text-xl font-bold text-foreground">{section.title}</Text>
    </View>
  )}
  stickySectionHeadersEnabled
/>
```

---

## Module 6: Styling with NativeWind

### 6.1 How NativeWind Works

NativeWind compiles Tailwind CSS classes into React Native StyleSheet objects at build time. `className="p-4 bg-white"` becomes `style={{ padding: 16, backgroundColor: '#FFFFFF' }}`.

### 6.2 Layout Classes

```
Flex:         flex-1, flex-row, flex-col, flex-wrap
Align:        items-center, items-start, items-end, items-stretch
Justify:      justify-center, justify-between, justify-start, justify-end
Gap:          gap-1, gap-2, gap-3, gap-4 (number * 4px)
Padding:      p-4, px-6, py-3, pt-2, pb-4, pl-3, pr-3
Margin:       m-4, mx-6, my-3, mt-2, mb-4, ml-3, mr-3
Width:        w-full, w-1/2, w-32, w-[200px]
Height:       h-full, h-48, h-[100px]
Position:     relative, absolute
Inset:        inset-0, top-0, bottom-0, left-0, right-0
Overflow:     overflow-hidden, overflow-visible
Aspect Ratio: aspect-square, aspect-video, aspect-[2/3]
```

### 6.3 Visual Classes

```
Background:   bg-white, bg-primary, bg-surface, bg-black/50 (50% opacity)
Border:       border, border-2, border-border, border-t, border-b
Radius:       rounded, rounded-lg, rounded-xl, rounded-2xl, rounded-full
Shadow:       shadow-sm, shadow-md, shadow-lg
Opacity:      opacity-50, opacity-0
```

### 6.4 Text Classes

```
Size:         text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
Weight:       font-normal, font-medium, font-semibold, font-bold, font-black
Color:        text-foreground, text-primary, text-white, text-red-500
Align:        text-left, text-center, text-right
Line Height:  leading-tight, leading-normal, leading-relaxed
```

### 6.5 Responsive & State

```
Active:       active:opacity-80 (while pressed)
Dark mode:    dark:bg-black dark:text-white
```

### 6.6 The cn() Utility

```typescript
// utils/cn.ts (you already have this)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage: conditionally merge classes without conflicts
<View className={cn(
  "rounded-xl p-4",
  isActive && "bg-primary",
  !isActive && "bg-surface",
  className // Allow parent to override
)} />
```

---

## Module 7: Navigation (Expo Router)

See **08-ADVANCED-NAVIGATION.md** for the complete navigation guide. Key takeaways:

```
- Files in app/ = routes
- _layout.tsx = navigator type (Stack, Tabs, Drawer)
- (group) = logical grouping, not in URL
- [param] = dynamic segment
- router.push/replace/back for imperative navigation
- <Link> for declarative navigation
- useLocalSearchParams for reading route params
```

---

## Module 8: State Management

### 8.1 When to Use What

```
useState:         Component-local UI state (form inputs, toggles, modals)
Zustand:          App-wide state (auth, preferences, UI flags)
React Query:      Server state (all API data: books, users, categories)
Context:          Rare - theme, locale (prefer Zustand for most things)
```

### 8.2 Zustand Quick Start

```typescript
import { create } from "zustand";

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// In component
function Counter() {
  const count = useCounterStore((s) => s.count);        // Only re-renders when count changes
  const increment = useCounterStore((s) => s.increment); // Stable reference

  return (
    <Pressable onPress={increment}>
      <Text>{count}</Text>
    </Pressable>
  );
}
```

### 8.3 React Query Quick Start

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch data
function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: () => api.get("/books/").then((r) => r.data),
  });
}

// In component
function BookList() {
  const { data: books, isLoading, error, refetch } = useBooks();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorView onRetry={refetch} />;

  return (
    <FlatList
      data={books}
      renderItem={({ item }) => <BookCard book={item} />}
    />
  );
}

// Mutate data
function useBookmarkBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => api.post(`/books/${bookId}/bookmark/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
```

---

# Phase 3: Real App Features

---

## Module 9: Forms

See **MONSTER_GUIDE.md Section 10** for React Hook Form + Zod patterns.

Quick reference:

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login(data);

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} placeholder="Email" />
        )}
      />
      {errors.email && <Text className="text-destructive">{errors.email.message}</Text>}

      <Pressable onPress={handleSubmit(onSubmit)}>
        <Text>Sign In</Text>
      </Pressable>
    </View>
  );
}
```

---

## Module 10: API Integration

### 10.1 Axios Setup

```typescript
// lib/api-client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      // If refresh fails, logout
    }
    return Promise.reject(error);
  }
);
```

### 10.2 React Query Integration

```typescript
// features/books/api/books.queries.ts

// Query key factory
export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: BookFilters) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};

// Query hooks
export function useBooks(filters?: BookFilters) {
  return useQuery({
    queryKey: bookKeys.list(filters ?? {}),
    queryFn: () => api.get("/books/", { params: filters }).then((r) => r.data),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => api.get(`/books/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

// Infinite scroll
export function useBooksInfinite(category?: string) {
  return useInfiniteQuery({
    queryKey: bookKeys.list({ category }),
    queryFn: ({ pageParam = 1 }) =>
      api.get("/books/", { params: { page: pageParam, category } }).then((r) => r.data),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });
}
```

---

## Module 11: Authentication

See **MONSTER_GUIDE.md Section 13** and **02-BIOMETRIC-AUTH.md** for complete auth patterns.

Key flow:
```
1. User signs up → API returns tokens
2. Store tokens in SecureStore
3. Store user in Zustand
4. Root layout shows (tabs) when user exists
5. API interceptor adds token to all requests
6. On 401, try refresh token
7. If refresh fails, logout and show (auth)
```

---

## Module 12: Images & Media

See **03-CAMERA.md** for camera/image picker and **09-TIPS-AND-TRICKS.md Section 1** for image patterns.

Key rule: Always use `expo-image` instead of React Native `Image`:
```typescript
import { Image } from "expo-image";

<Image
  source={{ uri: url }}
  placeholder={{ blurhash: "..." }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  className="h-48 w-full rounded-xl"
/>
```

---

# Phase 4: Production Polish

---

## Module 13: Animations

See **07-ANIMATIONS.md** for the complete animation guide. Priority learning order:
1. Entering/Exiting animations (FadeIn, SlideInDown)
2. Shared values + animated styles
3. withSpring, withTiming
4. Scroll-driven animations
5. Gesture-driven animations

---

## Module 14: Error Handling

### 14.1 Error Boundary

```typescript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="mb-2 text-xl font-bold text-foreground">Oops!</Text>
      <Text className="mb-6 text-center text-foreground-secondary">
        Something went wrong. Please try again.
      </Text>
      <Button label="Try Again" onPress={resetErrorBoundary} />
    </View>
  );
}

// Wrap features (not the whole app)
function BookDetailScreen() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BookDetail />
    </ErrorBoundary>
  );
}
```

### 14.2 API Error Handling Pattern

```typescript
// Classify errors into actionable categories
function handleError(error: unknown): { title: string; message: string; retry: boolean } {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return { title: "No Connection", message: "Check your internet and try again.", retry: true };
    }
    switch (error.response.status) {
      case 401: return { title: "Session Expired", message: "Please log in again.", retry: false };
      case 403: return { title: "Access Denied", message: "You don't have permission.", retry: false };
      case 404: return { title: "Not Found", message: "This content doesn't exist.", retry: false };
      case 429: return { title: "Slow Down", message: "Too many requests. Wait a moment.", retry: true };
      default:
        if (error.response.status >= 500) {
          return { title: "Server Error", message: "We're fixing it. Try again shortly.", retry: true };
        }
    }
  }
  return { title: "Error", message: "Something went wrong.", retry: true };
}
```

---

## Module 15: Testing

### 15.1 Setup

```bash
npx expo install jest-expo @testing-library/react-native
```

### 15.2 Component Test

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";

test("BookCard renders title and author", () => {
  render(<BookCard book={mockBook} />);

  expect(screen.getByText("Atomic Habits")).toBeTruthy();
  expect(screen.getByText("James Clear")).toBeTruthy();
});

test("Button calls onPress when tapped", () => {
  const onPress = jest.fn();
  render(<Button label="Save" onPress={onPress} />);

  fireEvent.press(screen.getByText("Save"));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### 15.3 Hook Test

```typescript
import { renderHook, waitFor } from "@testing-library/react-native";

test("useDebounce debounces value", async () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: "hello" } }
  );

  expect(result.current).toBe("hello");

  rerender({ value: "world" });
  expect(result.current).toBe("hello"); // Not updated yet

  await waitFor(() => {
    expect(result.current).toBe("world"); // Updated after 300ms
  });
});
```

---

## Module 16: Deployment

### 16.1 Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Development build (for testing native modules)
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 16.2 Over-the-Air Updates

```bash
# Push JS-only updates instantly (no app store review!)
eas update --channel production --message "Fix onboarding text"
```

---

# Phase 5: Senior Patterns

---

## Module 17: Architecture Patterns

### Feature-Based Structure

```
features/
  books/
    api/          API calls + React Query hooks
    components/   Feature-specific components
    hooks/        Feature-specific hooks
    store/        Feature-specific state
    types/        Types for this feature
    utils/        Utilities for this feature
```

Each feature is self-contained. Deleting it = deleting one folder.

### Dependency Rule

```
features/books → components/ui     (OK: feature uses shared components)
features/books → lib/api-client    (OK: feature uses shared utility)
features/books → features/auth     (BAD: feature depends on feature)
```

Features should not import from other features. If they need to communicate, use global state (Zustand) or route params.

---

## Module 18: Performance Optimization

Priority order:
1. **Lists** — Use FlatList/FlashList, never .map() for 50+ items
2. **Images** — Use expo-image, specify dimensions, cache aggressively
3. **Renders** — Profile with React DevTools, memo expensive components
4. **Animations** — Use Reanimated (UI thread), not setState
5. **Bundle** — Lazy load screens, code-split large features
6. **Startup** — Minimize work before first paint

---

## Module 19: Accessibility

```typescript
// Every interactive element needs these:
<Pressable
  accessible={true}
  accessibilityLabel="Bookmark Atomic Habits"  // What screen reader says
  accessibilityRole="button"                   // What type of element
  accessibilityState={{ selected: isBookmarked }}
  accessibilityHint="Double tap to toggle bookmark"
>
  <BookmarkIcon />
</Pressable>

// Images
<Image
  source={{ uri: cover }}
  accessible={true}
  accessibilityLabel={`Cover of ${book.title} by ${book.author}`}
/>

// Text that updates
<Text
  accessibilityLiveRegion="polite"  // Announce changes
  accessibilityRole="text"
>
  {count} items in your library
</Text>
```

---

## Module 20: What to Learn Next

### Your Priority Learning Path

```
1. Build QuickRead features (practice > theory)
2. Master React Query (the biggest productivity multiplier)
3. Learn Reanimated animations (makes your app feel premium)
4. Study one open-source RN app's code (see real patterns)
5. Ship to TestFlight/Play Store internal testing
6. Get real user feedback
7. Optimize based on real usage data
```

### Libraries Worth Exploring

```
@shopify/flash-list     Better FlatList (5-10x faster)
@gorhom/bottom-sheet    Production bottom sheets
react-native-mmkv       Fastest key-value storage
@sentry/react-native    Error monitoring in production
expo-updates             OTA updates
react-native-skia        Canvas/drawing (advanced)
zeego                    Native context menus
burnt                    Native toast notifications
```

### Communities

```
- Expo Discord (discord.gg/expo)
- React Native Reddit (r/reactnative)
- Infinite Red Slack
- X/Twitter: @expo, @reactnative, @FernandoTheRojo, @wcandillon
```

---

> **The path to monster status:**
> Build → Ship → Get feedback → Fix → Build more.
> Read the source code of libraries you use.
> When something breaks, debug it yourself before Googling.
> Every bug you fix teaches you more than any tutorial.
> Ship.
