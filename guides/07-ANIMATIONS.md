# Animations in React Native: The Complete Guide

> From a fading view to building Airbnb-level micro-interactions. Every technique, every API, every pattern.

---

## Table of Contents

1. [Animation Mental Model](#1-animation-mental-model)
2. [The Three Animation Systems](#2-the-three-animation-systems)
3. [Animated API (Built-in)](#3-animated-api-built-in)
4. [LayoutAnimation (One-Liner Magic)](#4-layoutanimation-one-liner-magic)
5. [Reanimated: Fundamentals](#5-reanimated-fundamentals)
6. [Reanimated: Shared Values & Animated Styles](#6-reanimated-shared-values--animated-styles)
7. [Reanimated: Animation Functions](#7-reanimated-animation-functions)
8. [Reanimated: Entering & Exiting Animations](#8-reanimated-entering--exiting-animations)
9. [Reanimated: Layout Animations](#9-reanimated-layout-animations)
10. [Reanimated: Scroll-Driven Animations](#10-reanimated-scroll-driven-animations)
11. [Reanimated: Keyframe Animations](#11-reanimated-keyframe-animations)
12. [Gesture-Driven Animations](#12-gesture-driven-animations)
13. [Micro-Interactions Library](#13-micro-interactions-library)
14. [Screen Transitions](#14-screen-transitions)
15. [Loading & Skeleton Animations](#15-loading--skeleton-animations)
16. [List Animations](#16-list-animations)
17. [Lottie Animations](#17-lottie-animations)
18. [Advanced: Shared Element Transitions](#18-advanced-shared-element-transitions)
19. [Advanced: Physics-Based Animations](#19-advanced-physics-based-animations)
20. [Advanced: Canvas Animations (Skia)](#20-advanced-canvas-animations-skia)
21. [Performance Guide](#21-performance-guide)
22. [Animation Recipes](#22-animation-recipes)

---

## 1. Animation Mental Model

### Why Animate?

Animations are not decoration. They serve three purposes:
1. **Feedback** — User pressed a button? Scale it down to confirm the touch.
2. **Context** — Where did this screen come from? Slide transition shows spatial relationship.
3. **Focus** — What should the user look at? Animate the important thing in.

### The 60fps Rule

Your phone screen refreshes 60 times per second (or 120fps on ProMotion). Every frame has **16.6ms** to render. If your animation logic takes longer, frames drop, and the user sees jank.

```
JS Thread:  Runs your React code, state updates, business logic
UI Thread:  Renders views, runs native animations
GPU:        Composites layers, applies transforms

The secret: Keep animation logic OFF the JS thread.
```

### What Makes an Animation Smooth

```
SMOOTH (runs on UI thread):
  - transform (translateX/Y, scale, rotate)
  - opacity
  - Reanimated shared values
  - Native driver animations

JANKY (runs on JS thread, can drop frames):
  - width, height changes
  - backgroundColor transitions (without native driver)
  - Layout recalculations
  - setState during animations
```

---

## 2. The Three Animation Systems

| System | Thread | Complexity | Use Case |
|--------|--------|-----------|----------|
| `Animated` API | JS (or native with `useNativeDriver`) | Medium | Simple fades, slides, basic transforms |
| `LayoutAnimation` | Native | Very Low | Auto-animate layout changes |
| `Reanimated` | UI thread | High | Everything. The professional choice. |

**Your stack already includes Reanimated.** That's what you should use for everything. But understanding all three helps you pick the right tool.

---

## 3. Animated API (Built-in)

The built-in `Animated` API ships with React Native. No extra install.

### Fade In

```typescript
import { Animated } from "react-native";

function FadeInView({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true, // ALWAYS use native driver for opacity/transform
    }).start();
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
```

### Slide Up

```typescript
function SlideUpView({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
}
```

### Spring Animation

```typescript
function BounceIn({ children }: { children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,     // Lower = more bouncy (default 7)
      tension: 40,     // Higher = faster (default 40)
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}
```

### Sequence, Parallel, Stagger

```typescript
// Run one after another
Animated.sequence([
  Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
]).start();

// Run all at the same time
Animated.parallel([
  Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();

// Run with delays between each
Animated.stagger(100, [
  Animated.timing(item1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(item2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(item3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();

// Loop
Animated.loop(
  Animated.sequence([
    Animated.timing(rotation, { toValue: 1, duration: 1000, useNativeDriver: true }),
    Animated.timing(rotation, { toValue: 0, duration: 1000, useNativeDriver: true }),
  ])
).start();
```

### Interpolation (Map Value Ranges)

```typescript
const scrollY = useRef(new Animated.Value(0)).current;

// Map scroll position to header height
const headerHeight = scrollY.interpolate({
  inputRange: [0, 200],
  outputRange: [300, 80],
  extrapolate: "clamp", // Don't go beyond output range
});

// Map scroll position to opacity
const headerOpacity = scrollY.interpolate({
  inputRange: [0, 100, 200],
  outputRange: [1, 0.5, 0],
  extrapolate: "clamp",
});

// Map 0-1 to rotation degrees
const spin = rotation.interpolate({
  inputRange: [0, 1],
  outputRange: ["0deg", "360deg"],
});

<Animated.View
  style={{
    height: headerHeight,
    opacity: headerOpacity,
    transform: [{ rotate: spin }],
  }}
/>
```

### Limitations of Built-in Animated

```
- useNativeDriver: true only works with transform and opacity
- Can't animate layout properties (width, height) on native driver
- Interpolation is limited
- No worklet support (runs calculations on JS thread when not using native driver)
- No gesture integration (need Reanimated for that)
```

---

## 4. LayoutAnimation (One-Liner Magic)

The easiest way to animate layout changes. When state changes cause a layout shift, LayoutAnimation auto-animates the transition.

```typescript
import { LayoutAnimation, UIManager, Platform } from "react-native";

// Enable on Android (iOS works by default)
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

function ExpandableCard() {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    // Call BEFORE the state change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Pressable onPress={toggle}>
      <View className={`rounded-xl bg-surface p-4 ${expanded ? "h-60" : "h-20"}`}>
        <Text className="text-foreground">
          {expanded ? "Expanded content here..." : "Tap to expand"}
        </Text>
      </View>
    </Pressable>
  );
}
```

### Custom LayoutAnimation Config

```typescript
const customAnimation = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.7,
  },
  delete: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

function AnimatedList() {
  const [items, setItems] = useState(["A", "B", "C"]);

  const addItem = () => {
    LayoutAnimation.configureNext(customAnimation);
    setItems([...items, String.fromCharCode(65 + items.length)]);
  };

  const removeItem = (index: number) => {
    LayoutAnimation.configureNext(customAnimation);
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <View>
      {items.map((item, i) => (
        <Pressable key={item} onPress={() => removeItem(i)}>
          <View className="mb-2 rounded-lg bg-surface p-4">
            <Text className="text-foreground">Item {item}</Text>
          </View>
        </Pressable>
      ))}
      <Pressable onPress={addItem}>
        <Text className="text-primary">+ Add Item</Text>
      </Pressable>
    </View>
  );
}
```

### When to Use LayoutAnimation

```
GOOD for:
  - Expanding/collapsing sections
  - Adding/removing list items
  - Showing/hiding elements
  - Simple layout transitions

BAD for:
  - Continuous animations (use Reanimated)
  - Gesture-driven animations
  - Precise control over timing
  - Complex multi-step animations
```

---

## 5. Reanimated: Fundamentals

This is your main animation library. Everything below runs on the **UI thread** at 60fps.

### The Core Concept

```
Shared Value  →  Animated Style  →  Animated.View
(the data)       (the mapping)      (the view)

All three live on the UI thread. JS thread is not involved.
```

### Setup Verification

You already have `react-native-reanimated` installed. Verify your `babel.config.js`:

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin", // MUST be last
    ],
  };
};
```

The Reanimated plugin MUST be the last plugin in the list.

---

## 6. Reanimated: Shared Values & Animated Styles

### Shared Values

```typescript
import { useSharedValue } from "react-native-reanimated";

// A shared value is like useState, but:
// - Lives on both JS and UI threads
// - Updates don't cause re-renders
// - Can be read/written from worklets (UI thread functions)

const opacity = useSharedValue(0);      // Initial value: 0
const position = useSharedValue(0);
const scale = useSharedValue(1);
const color = useSharedValue("#FF0000"); // Can hold any type

// Update (triggers animation if wrapped in withTiming/withSpring)
opacity.value = 1;
opacity.value = withTiming(1, { duration: 300 });
opacity.value = withSpring(1);
```

### Animated Styles

```typescript
import Animated, { useAnimatedStyle } from "react-native-reanimated";

function MyComponent() {
  const offset = useSharedValue(0);

  // This function re-runs on UI thread whenever offset.value changes
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  // MUST use Animated.View (not regular View)
  return <Animated.View style={animatedStyle} />;
}
```

### Multiple Shared Values

```typescript
function AnimatedCard() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const animateIn = () => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 15 });
    scale.value = withSpring(1, { damping: 12 });
  };

  useEffect(() => {
    animateIn();
  }, []);

  return (
    <Animated.View style={style} className="rounded-xl bg-surface p-4">
      <Text>Animated Card</Text>
    </Animated.View>
  );
}
```

### Animated Props (Not Just Styles)

```typescript
import { useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// Animate SVG properties
function AnimatedProgress({ progress }: { progress: number }) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 283 * (1 - animatedProgress.value), // Circumference * (1 - progress)
  }));

  return (
    <Svg width={100} height={100}>
      {/* Background circle */}
      <Circle cx={50} cy={50} r={45} stroke="#E5E7EB" strokeWidth={6} fill="none" />
      {/* Animated progress circle */}
      <AnimatedCircle
        cx={50}
        cy={50}
        r={45}
        stroke="#007A5E"
        strokeWidth={6}
        fill="none"
        strokeDasharray={283}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );
}
```

---

## 7. Reanimated: Animation Functions

### withTiming (Linear/Eased)

```typescript
import { withTiming, Easing } from "react-native-reanimated";

// Default (300ms, ease-in-out)
value.value = withTiming(100);

// Custom duration
value.value = withTiming(100, { duration: 500 });

// Custom easing
value.value = withTiming(100, {
  duration: 400,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // CSS cubic-bezier
});

// Common easings
Easing.linear;                          // Constant speed
Easing.ease;                            // Gentle ease (default CSS)
Easing.in(Easing.ease);                // Slow start
Easing.out(Easing.ease);               // Slow end
Easing.inOut(Easing.ease);             // Slow start and end
Easing.bezier(0.25, 0.1, 0.25, 1);    // Custom curve
Easing.elastic(1);                     // Bouncy overshoot
Easing.bounce;                         // Bounce at end
Easing.back(1.5);                      // Slight overshoot
```

### withSpring (Physics-Based)

```typescript
import { withSpring } from "react-native-reanimated";

// Default spring
value.value = withSpring(100);

// Custom spring config
value.value = withSpring(100, {
  damping: 15,          // How quickly it settles (higher = less bouncy)
  stiffness: 150,       // How "stiff" the spring is (higher = faster)
  mass: 1,              // Weight of the object
  overshootClamping: false, // Allow overshoot?
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
});

// Common spring presets
// Snappy (UI elements)
withSpring(target, { damping: 20, stiffness: 200 });

// Bouncy (playful interactions)
withSpring(target, { damping: 8, stiffness: 100 });

// Gentle (modals, sheets)
withSpring(target, { damping: 20, stiffness: 90 });

// No bounce (quick snap)
withSpring(target, { damping: 30, stiffness: 300 });
```

### withDecay (Friction/Momentum)

```typescript
import { withDecay } from "react-native-reanimated";

// Simulate friction - object slows down naturally
// Perfect for: fling/throw interactions, scroll momentum
value.value = withDecay({
  velocity: 1000,          // Initial velocity (from gesture)
  deceleration: 0.998,     // Friction (0.998 = slow stop, 0.99 = fast stop)
  clamp: [0, 500],         // Boundaries
});
```

### withRepeat (Looping)

```typescript
import { withRepeat } from "react-native-reanimated";

// Infinite pulse
opacity.value = withRepeat(
  withTiming(0.3, { duration: 800 }),
  -1,    // -1 = infinite, positive number = specific count
  true   // reverse = alternate direction
);

// Spin forever
rotation.value = withRepeat(
  withTiming(360, { duration: 1000, easing: Easing.linear }),
  -1,
  false  // Don't reverse (continuous spin)
);

// Bounce 3 times then stop
scale.value = withRepeat(
  withSequence(
    withTiming(1.2, { duration: 200 }),
    withTiming(1, { duration: 200 })
  ),
  3,
  false
);
```

### withSequence (Chain Animations)

```typescript
import { withSequence } from "react-native-reanimated";

// Shake animation
translateX.value = withSequence(
  withTiming(-10, { duration: 50 }),
  withTiming(10, { duration: 50 }),
  withTiming(-10, { duration: 50 }),
  withTiming(10, { duration: 50 }),
  withTiming(0, { duration: 50 })
);

// Pop effect (scale up then settle)
scale.value = withSequence(
  withTiming(1.15, { duration: 150 }),
  withSpring(1, { damping: 10 })
);

// Attention pulse
scale.value = withSequence(
  withTiming(0.95, { duration: 100 }),
  withSpring(1.05, { damping: 5 }),
  withSpring(1)
);
```

### withDelay

```typescript
import { withDelay } from "react-native-reanimated";

// Start animation after 500ms
opacity.value = withDelay(500, withTiming(1, { duration: 300 }));

// Staggered entrance
items.forEach((_, index) => {
  itemOpacities[index].value = withDelay(
    index * 100, // 0ms, 100ms, 200ms, 300ms...
    withTiming(1, { duration: 400 })
  );
});
```

### Callbacks

```typescript
import { withTiming, runOnJS } from "react-native-reanimated";

// Do something when animation finishes
opacity.value = withTiming(0, { duration: 300 }, (finished) => {
  if (finished) {
    // This runs on UI thread - use runOnJS for JS functions
    runOnJS(onAnimationComplete)();
  }
});
```

### interpolate

```typescript
import { interpolate, Extrapolation } from "react-native-reanimated";

const style = useAnimatedStyle(() => ({
  opacity: interpolate(
    scrollY.value,
    [0, 100, 200],     // Input range
    [1, 0.5, 0],       // Output range
    Extrapolation.CLAMP // Don't go beyond output range
  ),
  transform: [
    {
      scale: interpolate(
        scrollY.value,
        [0, 200],
        [1, 0.8],
        Extrapolation.CLAMP
      ),
    },
    {
      rotate: `${interpolate(
        scrollY.value,
        [0, 200],
        [0, -15]
      )}deg`,
    },
  ],
}));

// Extrapolation options:
Extrapolation.EXTEND  // Continue the curve beyond range (default)
Extrapolation.CLAMP   // Stop at the last output value
Extrapolation.IDENTITY // Use input value directly
```

### interpolateColor

```typescript
import { interpolateColor } from "react-native-reanimated";

const style = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(
    progress.value,
    [0, 0.5, 1],
    ["#FF0000", "#FFFF00", "#00FF00"] // Red → Yellow → Green
  ),
}));
```

---

## 8. Reanimated: Entering & Exiting Animations

The easiest way to animate components mounting/unmounting.

### Built-in Presets

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  SlideOutDown,
  SlideOutUp,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXDown,
  StretchInX,
  StretchOutX,
  LightSpeedInLeft,
  LightSpeedOutRight,
  RotateInDownLeft,
  PinwheelIn,
  PinwheelOut,
} from "react-native-reanimated";

// Just add entering/exiting props
function NotificationBanner({ message }: { message: string }) {
  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
      className="rounded-xl bg-primary p-4"
    >
      <Text className="text-primary-foreground">{message}</Text>
    </Animated.View>
  );
}
```

### Customizing Presets

```typescript
// Chaining modifiers
<Animated.View
  entering={FadeInDown
    .delay(200)           // Wait 200ms before starting
    .duration(400)        // Animation takes 400ms
    .springify()          // Use spring physics instead of timing
    .damping(15)          // Spring damping (with springify)
    .stiffness(100)       // Spring stiffness (with springify)
    .withInitialValues({ // Start from these values
      opacity: 0,
      transform: [{ translateY: 50 }],
    })
    .withCallback((finished) => {
      "worklet";
      if (finished) {
        runOnJS(onEntered)();
      }
    })
  }
/>
```

### Staggered List Entrance

```typescript
function StaggeredList({ items }: { items: Item[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown
            .delay(index * 80)     // Each item delayed by 80ms more
            .duration(400)
            .springify()
            .damping(15)
          }
          exiting={FadeOutUp.duration(200)}
          className="mb-3 rounded-xl bg-surface p-4"
        >
          <Text className="text-foreground">{item.title}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
```

### Conditional Rendering with Animations

```typescript
function Toast({ message, visible }: { message: string; visible: boolean }) {
  // When visible becomes false, the exiting animation plays before unmount
  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(15)}
      exiting={SlideOutDown.duration(200)}
      className="absolute bottom-10 left-4 right-4 rounded-xl bg-foreground p-4"
    >
      <Text className="text-center text-background">{message}</Text>
    </Animated.View>
  );
}
```

---

## 9. Reanimated: Layout Animations

Automatically animate when a component's position or size changes.

```typescript
import Animated, { Layout, LinearTransition, FadingTransition } from "react-native-reanimated";

function ReorderableList({ items }: { items: Item[] }) {
  return (
    <View>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          layout={LinearTransition.springify().damping(15)}
          // When items reorder, they smoothly animate to new positions
          className="mb-2 rounded-xl bg-surface p-4"
        >
          <Text className="text-foreground">{item.title}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
```

### Layout Transition Types

```typescript
Layout                // Default, animates position and size
LinearTransition      // Linear interpolation
SequencedTransition   // Width then height (or vice versa)
FadingTransition      // Fade out old layout, fade in new
JumpingTransition     // Jump to new position
CurvedTransition      // Follow a curve path
EntryExitTransition   // Use entering/exiting animations for layout change

// Usage
<Animated.View layout={CurvedTransition.duration(400)} />
```

---

## 10. Reanimated: Scroll-Driven Animations

### Collapsible Header

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const HEADER_MAX = 250;
const HEADER_MIN = 80;

function CollapsibleHeaderScreen() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [HEADER_MAX, HEADER_MIN],
      Extrapolation.CLAMP
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [32, 18],
      Extrapolation.CLAMP
    ),
    opacity: interpolate(
      scrollY.value,
      [0, 50, HEADER_MAX - HEADER_MIN],
      [1, 0.8, 1],
      Extrapolation.CLAMP
    ),
  }));

  const coverStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],  // Pulling down
          [1.5, 1],   // Zoom in on pull
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View className="flex-1 bg-background">
      {/* Animated header */}
      <Animated.View style={headerStyle} className="overflow-hidden bg-primary">
        <Animated.Image
          source={{ uri: book.coverUrl }}
          style={coverStyle}
          className="absolute inset-0"
        />
        <SafeAreaView className="flex-1 justify-end p-4">
          <Animated.Text
            style={titleStyle}
            className="font-bold text-white"
          >
            {book.title}
          </Animated.Text>
        </SafeAreaView>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 16 }}
      >
        {/* Book content */}
      </Animated.ScrollView>
    </View>
  );
}
```

### Parallax Effect

```typescript
function ParallaxCard({ imageUri, title, scrollY, index }: Props) {
  const cardOffset = index * CARD_HEIGHT;

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [cardOffset - SCREEN_HEIGHT, cardOffset, cardOffset + SCREEN_HEIGHT],
          [-50, 0, 50], // Image moves slower than scroll
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View className="mb-4 h-60 overflow-hidden rounded-2xl">
      <Animated.Image
        source={{ uri: imageUri }}
        style={imageStyle}
        className="absolute inset-[-50px]" // Extra height for parallax travel
      />
      <View className="flex-1 justify-end bg-black/30 p-4">
        <Text className="text-xl font-bold text-white">{title}</Text>
      </View>
    </View>
  );
}
```

### Scroll-Driven Tab Indicator

```typescript
function TabBar({ tabs, scrollX, width }: Props) {
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          tabs.map((_, i) => i * width),
          tabs.map((_, i) => i * (width / tabs.length)),
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View className="flex-row border-b border-border">
      {tabs.map((tab, i) => (
        <Pressable key={tab} className="flex-1 items-center py-3">
          <Text className="font-medium text-foreground">{tab}</Text>
        </Pressable>
      ))}
      <Animated.View
        style={[indicatorStyle, { width: `${100 / tabs.length}%` }]}
        className="absolute bottom-0 h-0.5 bg-primary"
      />
    </View>
  );
}
```

---

## 11. Reanimated: Keyframe Animations

Define complex multi-step animations with exact timing.

```typescript
import { Keyframe } from "react-native-reanimated";

// Attention-seeking bounce
const bounceKeyframe = new Keyframe({
  0: { transform: [{ scale: 1 }] },
  30: { transform: [{ scale: 1.25 }] },
  40: { transform: [{ scale: 0.9 }] },
  50: { transform: [{ scale: 1.15 }] },
  65: { transform: [{ scale: 0.95 }] },
  75: { transform: [{ scale: 1.05 }] },
  100: { transform: [{ scale: 1 }] },
}).duration(800);

// Slide in with overshoot
const slideInKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateX: 100 }],
  },
  70: {
    opacity: 1,
    transform: [{ translateX: -10 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
  },
}).duration(500);

// Usage
<Animated.View entering={bounceKeyframe}>
  <Text>Bouncing!</Text>
</Animated.View>

<Animated.View entering={slideInKeyframe}>
  <Text>Sliding in!</Text>
</Animated.View>
```

### Pulse Notification Badge

```typescript
const pulseKeyframe = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  50: { transform: [{ scale: 1.4 }], opacity: 0.7 },
  100: { transform: [{ scale: 1 }], opacity: 1 },
}).duration(1500);

function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify()}
      className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1"
    >
      <Text className="text-[10px] font-bold text-white">{count}</Text>
    </Animated.View>
  );
}
```

---

## 12. Gesture-Driven Animations

See the Gestures guide (05-GESTURES.md) for comprehensive gesture + animation examples.

Quick reference of the key pattern:

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} className="h-40 w-32 rounded-2xl bg-primary" />
    </GestureDetector>
  );
}
```

---

## 13. Micro-Interactions Library

Build these once, use everywhere.

### Button Press Feedback

```typescript
function AnimatedPressable({
  onPress,
  children,
  className,
}: {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.95, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} className={className}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Animated Checkbox

```typescript
function AnimatedCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(checked ? 1 : 0);
  const checkmarkProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, { damping: 12 });
    checkmarkProgress.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scale.value,
      [0, 1],
      ["transparent", "#007A5E"]
    ),
    borderColor: interpolateColor(
      scale.value,
      [0, 1],
      ["#E5E7EB", "#007A5E"]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkProgress.value,
    transform: [{ scale: checkmarkProgress.value }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={boxStyle}
        className="h-6 w-6 items-center justify-center rounded-md border-2"
      >
        <Animated.View style={checkStyle}>
          <Check size={14} color="white" strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
```

### Animated Counter

```typescript
function AnimatedNumber({ value }: { value: number }) {
  const animatedValue = useSharedValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 500 }, () => {
      runOnJS(setDisplay)(value);
    });
  }, [value]);

  // Scale pop on change
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
  }, [value]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={style} className="text-2xl font-bold text-foreground">
      {display.toLocaleString()}
    </Animated.Text>
  );
}
```

### Heart Like Animation (Instagram)

```typescript
function HeartAnimation({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={ZoomIn.duration(200).springify().damping(6)}
      exiting={FadeOut.delay(400).duration(300)}
      className="absolute inset-0 items-center justify-center"
    >
      <Heart size={80} color="white" fill="white" />
    </Animated.View>
  );
}
```

### Animated Switch

```typescript
function AnimatedSwitch({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  const offset = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    offset.value = withSpring(value ? 1 : 0, { damping: 15 });
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(offset.value, [0, 1], [2, 22]),
      },
    ],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      offset.value,
      [0, 1],
      ["#E5E7EB", "#007A5E"]
    ),
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={trackStyle}
        className="h-8 w-14 justify-center rounded-full"
      >
        <Animated.View
          style={thumbStyle}
          className="h-6 w-6 rounded-full bg-white shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}
```

---

## 14. Screen Transitions

### Custom Stack Transitions

```typescript
// app/_layout.tsx
import { TransitionPresets } from "@react-navigation/stack";

<Stack
  screenOptions={{
    animation: "slide_from_right",     // Default
    // animation: "slide_from_bottom",  // Modal-like
    // animation: "fade",               // Crossfade
    // animation: "none",               // Instant
    // animation: "fade_from_bottom",   // Android-style

    // Custom animation config
    animationDuration: 250,
  }}
/>
```

### Animated Screen Wrapper

```typescript
function AnimatedScreen({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 bg-background"
    >
      {children}
    </Animated.View>
  );
}

// Usage in every screen
export default function HomeScreen() {
  return (
    <AnimatedScreen>
      {/* Screen content */}
    </AnimatedScreen>
  );
}
```

---

## 15. Loading & Skeleton Animations

### Shimmer Skeleton

```typescript
function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
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

// Book Card Skeleton
function BookCardSkeleton() {
  return (
    <View className="flex-row gap-3 rounded-xl bg-surface p-4">
      <Skeleton className="h-36 w-24 rounded-lg" />
      <View className="flex-1 gap-2 py-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <View className="flex-1" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </View>
    </View>
  );
}

// Full screen skeleton
function HomeScreenSkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="mb-6 h-44 w-full rounded-2xl" />
      <Skeleton className="mb-4 h-6 w-32" />
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-3">
          <BookCardSkeleton />
        </View>
      ))}
    </View>
  );
}
```

### Animated Loading Dots

```typescript
function LoadingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animate = (sv: Animated.SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-8, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        )
      );
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const Dot = ({ sv }: { sv: Animated.SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({
      transform: [{ translateY: sv.value }],
    }));
    return (
      <Animated.View
        style={style}
        className="h-2.5 w-2.5 rounded-full bg-primary"
      />
    );
  };

  return (
    <View className="flex-row items-center gap-1.5">
      <Dot sv={dot1} />
      <Dot sv={dot2} />
      <Dot sv={dot3} />
    </View>
  );
}
```

---

## 16. List Animations

### Animated FlatList Items

```typescript
function AnimatedBookList({ books }: { books: Book[] }) {
  const renderItem = useCallback(
    ({ item, index }: { item: Book; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60).springify().damping(15)}
        className="mb-3"
      >
        <BookCard book={item} />
      </Animated.View>
    ),
    []
  );

  return (
    <FlatList
      data={books}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Swipeable List Items

See 05-GESTURES.md for the full swipe-to-delete implementation.

---

## 17. Lottie Animations

For complex pre-made animations (onboarding, empty states, success/error feedback):

```bash
npx expo install lottie-react-native
```

```typescript
import LottieView from "lottie-react-native";

// Basic usage
function SuccessAnimation() {
  return (
    <LottieView
      source={require("@/assets/animations/success.json")}
      autoPlay
      loop={false}
      style={{ width: 200, height: 200 }}
    />
  );
}

// Controlled animation
function OnboardingAnimation() {
  const animationRef = useRef<LottieView>(null);

  const play = () => animationRef.current?.play();
  const reset = () => animationRef.current?.reset();

  return (
    <LottieView
      ref={animationRef}
      source={require("@/assets/animations/onboarding.json")}
      loop
      style={{ width: 300, height: 300 }}
    />
  );
}

// Progress-driven (connect to scroll or slider)
function ProgressAnimation({ progress }: { progress: number }) {
  return (
    <LottieView
      source={require("@/assets/animations/reading-progress.json")}
      progress={progress} // 0 to 1
      style={{ width: 100, height: 100 }}
    />
  );
}
```

Where to find Lottie animations:
- [LottieFiles](https://lottiefiles.com) — Huge free library
- Create your own in After Effects → export with Bodymovin plugin

---

## 18. Advanced: Shared Element Transitions

Animate an element from one screen to another (like a book cover expanding into the detail screen).

```typescript
import { SharedTransition } from "react-native-reanimated";

// In your list screen
function BookListItem({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} asChild>
      <Pressable>
        <Animated.Image
          source={{ uri: book.coverUrl }}
          sharedTransitionTag={`book-cover-${book.id}`}
          className="h-48 w-32 rounded-xl"
        />
      </Pressable>
    </Link>
  );
}

// In your detail screen
function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: book } = useBook(id);

  return (
    <View className="flex-1">
      <Animated.Image
        source={{ uri: book?.coverUrl }}
        sharedTransitionTag={`book-cover-${id}`}
        className="h-72 w-full"
      />
      {/* Rest of detail content */}
    </View>
  );
}
```

The cover image smoothly animates from its position in the list to its position in the detail screen.

---

## 19. Advanced: Physics-Based Animations

### Spring Chain (Connected Springs)

```typescript
function SpringChain() {
  const positions = Array.from({ length: 5 }, () => useSharedValue(0));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      positions[0].value = e.translationX;
      // Each subsequent ball follows with a spring delay
      for (let i = 1; i < positions.length; i++) {
        positions[i].value = withSpring(positions[i - 1].value, {
          damping: 12,
          stiffness: 100,
        });
      }
    })
    .onEnd(() => {
      positions.forEach((pos) => {
        pos.value = withSpring(0);
      });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View className="flex-row items-center justify-center gap-4 py-20">
        {positions.map((pos, i) => {
          const style = useAnimatedStyle(() => ({
            transform: [{ translateX: pos.value }],
          }));
          return (
            <Animated.View
              key={i}
              style={style}
              className="h-12 w-12 rounded-full bg-primary"
            />
          );
        })}
      </View>
    </GestureDetector>
  );
}
```

### Gravity Effect

```typescript
function GravityBall() {
  const translateY = useSharedValue(0);
  const velocity = useSharedValue(0);
  const GRAVITY = 9.8;
  const BOUNCE = 0.7;
  const FLOOR = 400;

  useEffect(() => {
    // Simple physics simulation using withDecay + spring
    translateY.value = withSpring(FLOOR, {
      velocity: 0,
      damping: 10,
      stiffness: 50,
    });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style} className="h-16 w-16 rounded-full bg-primary" />
  );
}
```

---

## 20. Advanced: Canvas Animations (Skia)

For complex visual effects, particle systems, custom drawing:

```bash
npx expo install @shopify/react-native-skia
```

```typescript
import { Canvas, Circle, Group, BlurMask } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue, withRepeat, withTiming } from "react-native-reanimated";

function GlowingOrb() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const radius = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [40, 50])
  );

  const opacity = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [0.3, 0.8])
  );

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      {/* Glow */}
      <Circle cx={100} cy={100} r={60} color="rgba(0, 122, 94, 0.3)">
        <BlurMask blur={20} style="normal" />
      </Circle>
      {/* Core */}
      <Circle cx={100} cy={100} r={radius} color="#007A5E" />
    </Canvas>
  );
}
```

---

## 21. Performance Guide

### Do's

```
1. Use Reanimated (runs on UI thread)
2. Only animate transform and opacity when possible
3. Use useAnimatedStyle (not inline styles)
4. Use useCallback for renderItem in animated lists
5. Use entering/exiting for mount/unmount animations
6. Cancel animations when component unmounts (cancelAnimation)
7. Use interpolate instead of multiple shared values when possible
```

### Don'ts

```
1. Don't use setState to drive animations (causes re-renders)
2. Don't animate width/height/padding/margin if possible (causes layout recalc)
3. Don't create shared values in loops (create array once)
4. Don't use Animated.event without useNativeDriver
5. Don't animate too many elements simultaneously (>20 is risky)
6. Don't use heavy components (images, text with many fonts) inside animated views unnecessarily
```

### Debugging Animation Performance

```typescript
// In development, monitor frame drops
import { PerformanceObserver } from "react-native-reanimated";

// Check if animations are running on UI or JS thread
// If you see "Animation XYZ fell back to JS thread", you have a problem

// Use React DevTools Profiler to spot re-renders during animations
// If components re-render during animation, something is wrong
```

---

## 22. Animation Recipes

### Recipe: Shake on Error

```typescript
function useShakeAnimation() {
  const translateX = useSharedValue(0);

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-5, { duration: 40 }),
      withTiming(5, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, style };
}
```

### Recipe: Confetti Burst

```typescript
function Confetti({ count = 30 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: useSharedValue(0),
        y: useSharedValue(0),
        rotation: useSharedValue(0),
        scale: useSharedValue(1),
        color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][
          Math.floor(Math.random() * 5)
        ],
      })),
    []
  );

  useEffect(() => {
    particles.forEach((p) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 300 + Math.random() * 300;

      p.x.value = withDecay({
        velocity: Math.cos(angle) * velocity,
        deceleration: 0.998,
      });
      p.y.value = withSequence(
        withDecay({
          velocity: Math.sin(angle) * velocity - 500,
          deceleration: 0.998,
        }),
        withTiming(800, { duration: 2000 }) // Gravity
      );
      p.rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
      p.scale.value = withDelay(1000, withTiming(0, { duration: 500 }));
    });
  }, []);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {particles.map((p, i) => {
        const style = useAnimatedStyle(() => ({
          transform: [
            { translateX: p.x.value },
            { translateY: p.y.value },
            { rotate: `${p.rotation.value}deg` },
            { scale: p.scale.value },
          ],
        }));
        return (
          <Animated.View
            key={i}
            style={[
              style,
              {
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: p.color,
              },
            ]}
          />
        );
      })}
    </View>
  );
}
```

### Recipe: Typing Indicator

```typescript
function TypingIndicator() {
  const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    dots.forEach((dot, i) => {
      dot.value = withDelay(
        i * 200,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 300 }),
            withTiming(0, { duration: 300 }),
            withTiming(0, { duration: 300 }) // Pause
          ),
          -1
        )
      );
    });
  }, []);

  return (
    <View className="flex-row items-center gap-1 rounded-2xl bg-surface-variant px-4 py-3">
      {dots.map((dot, i) => {
        const style = useAnimatedStyle(() => ({
          transform: [{ translateY: dot.value }],
        }));
        return (
          <Animated.View
            key={i}
            style={style}
            className="h-2 w-2 rounded-full bg-foreground-secondary"
          />
        );
      })}
    </View>
  );
}
```

### Recipe: Progress Bar

```typescript
function AnimatedProgressBar({
  progress,
  color = "bg-primary",
}: {
  progress: number; // 0 to 1
  color?: string;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 20 });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View className="h-2 overflow-hidden rounded-full bg-muted">
      <Animated.View style={style} className={`h-full rounded-full ${color}`} />
    </View>
  );
}
```
