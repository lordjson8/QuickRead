# Gestures in React Native

> Taps, swipes, pinches, pans, and long presses — from basic handlers to building Instagram-level interactions.

---

## Table of Contents

1. [Gesture Architecture](#1-gesture-architecture)
2. [Setup](#2-setup)
3. [Built-in Touch Handlers](#3-built-in-touch-handlers)
4. [Gesture Handler: Tap](#4-gesture-handler-tap)
5. [Gesture Handler: Pan (Drag)](#5-gesture-handler-pan-drag)
6. [Gesture Handler: Pinch (Zoom)](#6-gesture-handler-pinch-zoom)
7. [Gesture Handler: Rotation](#7-gesture-handler-rotation)
8. [Gesture Handler: Long Press](#8-gesture-handler-long-press)
9. [Gesture Handler: Fling (Swipe)](#9-gesture-handler-fling-swipe)
10. [Composing Gestures](#10-composing-gestures)
11. [Building Real Features](#11-building-real-features)
12. [Connecting Gestures with Reanimated](#12-connecting-gestures-with-reanimated)
13. [Advanced: Custom Gesture Recognizers](#13-advanced-custom-gesture-recognizers)
14. [Troubleshooting](#14-troubleshooting)
15. [Gesture Recipes](#15-gesture-recipes)

---

## 1. Gesture Architecture

### Why Not Just Use onPress?

React Native's built-in touch system (`Pressable`, `onPress`) runs through the JS bridge. The gesture recognition happens in JavaScript. For simple taps, this is fine. For anything more complex (dragging, pinching, swiping), you need:

- **60fps** gesture tracking (can't wait for JS bridge round-trip)
- **Simultaneous** gesture recognition (pinch + pan at the same time)
- **Native** gesture handling (iOS/Android gesture systems are different)

### The Stack

```
Your Component
      ↓
react-native-gesture-handler   → Native gesture recognition
      ↓
react-native-reanimated        → Native-thread animations driven by gestures
      ↓
Native Platform (iOS UIKit / Android View system)
```

Gesture Handler recognizes gestures on the native thread. Reanimated runs animations on the native thread. Your JS thread is free to do other work. The result: buttery smooth 60fps interactions.

### The Mental Model

```
Gesture → SharedValue → AnimatedStyle → Native View
  (native)    (native)      (native)      (native)

The entire chain runs on the UI thread. JS thread is not involved.
```

---

## 2. Setup

You already have both libraries installed:
- `react-native-gesture-handler` (gestures)
- `react-native-reanimated` (animations driven by gestures)

### Wrap Your App

```typescript
// app/_layout.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* rest of your app */}
    </GestureHandlerRootView>
  );
}
```

This is REQUIRED. Without it, no gestures work. The root view intercepts all touch events and routes them to the native gesture system.

---

## 3. Built-in Touch Handlers

Before reaching for Gesture Handler, know when built-in components are enough:

### Pressable (Use for Simple Taps)

```typescript
import { Pressable } from "react-native";

<Pressable
  onPress={() => console.log("Tapped")}
  onPressIn={() => console.log("Finger down")}
  onPressOut={() => console.log("Finger up")}
  onLongPress={() => console.log("Long pressed")}
  delayLongPress={500} // ms before long press fires
  hitSlop={10}         // Expand tap area by 10px on each side
  disabled={false}
  // Style based on press state
  style={({ pressed }) => [
    { opacity: pressed ? 0.7 : 1 },
  ]}
  // NativeWind variant:
  className="active:opacity-70"
>
  <Text>Tap me</Text>
</Pressable>
```

### When to Use What

```
Pressable / onPress:
  - Buttons, links, cards
  - Simple tap handlers
  - Menu items, list rows
  - Any "click" interaction

react-native-gesture-handler:
  - Dragging / panning (move elements around)
  - Pinch to zoom
  - Swipe to dismiss / swipe actions
  - Double tap
  - Rotation
  - Any gesture that needs to track continuous movement
  - Any gesture that needs to compose with other gestures
  - Anything that needs 60fps native-thread animation
```

---

## 4. Gesture Handler: Tap

### Basic Tap

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function TappableCard() {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      // Finger touched down
      scale.value = withTiming(0.95, { duration: 100 });
    })
    .onFinalize(() => {
      // Finger lifted (whether successful tap or cancelled)
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      // Successful tap completed
      console.log("Tapped!");
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={animatedStyle} className="rounded-xl bg-surface p-4">
        <Text className="text-foreground">Tap me</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Double Tap

```typescript
function DoubleTapLike() {
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2) // Require double tap
    .onEnd(() => {
      // Show heart animation (like Instagram)
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1, { damping: 6 });
      heartOpacity.value = withDelay(600, withTiming(0, { duration: 400 }));
    });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  return (
    <GestureDetector gesture={doubleTap}>
      <View className="relative">
        <Image source={{ uri: bookCover }} className="h-80 w-full" />

        {/* Heart overlay */}
        <Animated.View
          style={heartStyle}
          className="absolute inset-0 items-center justify-center"
        >
          <Heart size={80} color="white" fill="white" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
```

### Tap vs Single Tap vs Double Tap Together

```typescript
function TapHandler() {
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      console.log("Single tap");
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      console.log("Double tap");
    });

  // Exclusive: single tap only fires if double tap doesn't
  const composed = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={composed}>
      <View className="h-40 w-40 bg-primary" />
    </GestureDetector>
  );
}
```

---

## 5. Gesture Handler: Pan (Drag)

The most versatile gesture. Use for dragging, swiping, pulling.

### Basic Drag

```typescript
function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Save position when gesture starts
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Save current position
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Move by the amount the finger has moved
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd((event) => {
      // Optional: snap back, apply velocity, etc.
      // event.velocityX and event.velocityY tell you how fast the finger was moving
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={animatedStyle}
        className="h-24 w-24 rounded-2xl bg-primary"
      />
    </GestureDetector>
  );
}
```

### Horizontal-Only Swipe (Swipe to Delete)

```typescript
function SwipeToDelete({ onDelete, children }: Props) {
  const translateX = useSharedValue(0);
  const DELETE_THRESHOLD = -120;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate after 10px horizontal movement
    .failOffsetY([-5, 5])    // Fail if vertical movement > 5px (let scroll handle it)
    .onUpdate((event) => {
      // Only allow left swipe
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Swipe far enough - trigger delete
        translateX.value = withTiming(-300, { duration: 200 });
        runOnJS(onDelete)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, DELETE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="relative overflow-hidden">
      {/* Delete background */}
      <Animated.View
        style={deleteStyle}
        className="absolute inset-0 flex-row items-center justify-end bg-destructive px-6"
      >
        <Trash2 color="white" size={24} />
      </Animated.View>

      {/* Swipeable content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle} className="bg-surface">
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### Pan with Velocity (Physics-Based)

```typescript
function ThrowableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      // Apply velocity for a "throw" effect
      // withDecay simulates friction - the card slows down naturally
      translateX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.998, // How quickly it slows down
        clamp: [-200, 200],  // Boundaries
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.998,
        clamp: [-400, 400],
      });
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style} className="h-48 w-32 rounded-xl bg-primary" />
    </GestureDetector>
  );
}
```

---

## 6. Gesture Handler: Pinch (Zoom)

### Basic Pinch to Zoom

```typescript
function PinchableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      // Clamp between 1x and 5x
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 5) {
        scale.value = withSpring(5);
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={imageStyle}>
        <Image source={{ uri }} className="h-80 w-full" contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}
```

### Pinch + Pan Together (Image Viewer)

```typescript
function ImageViewer({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      // If zoomed out, snap back to center
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Simultaneous: both gestures can be active at the same time
  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style} className="flex-1">
        <Image source={{ uri }} className="h-full w-full" contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 7. Gesture Handler: Rotation

```typescript
function RotatableView() {
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${(rotation.value / Math.PI) * 180}deg` }],
  }));

  return (
    <GestureDetector gesture={rotationGesture}>
      <Animated.View style={style} className="h-40 w-40 bg-primary rounded-2xl" />
    </GestureDetector>
  );
}
```

---

## 8. Gesture Handler: Long Press

```typescript
function LongPressMenu() {
  const scale = useSharedValue(1);
  const [showMenu, setShowMenu] = useState(false);

  const longPress = Gesture.LongPress()
    .minDuration(500)     // 500ms hold to trigger
    .maxDistance(10)       // Fail if finger moves > 10px
    .onBegin(() => {
      // Finger down - start subtle scale
      scale.value = withTiming(0.97, { duration: 300 });
    })
    .onStart(() => {
      // Long press threshold reached
      scale.value = withSpring(0.95);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
      runOnJS(setShowMenu)(true);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <GestureDetector gesture={longPress}>
        <Animated.View style={style} className="rounded-xl bg-surface p-4">
          <Text className="text-foreground">Long press me</Text>
        </Animated.View>
      </GestureDetector>

      {showMenu && (
        <ContextMenu onClose={() => setShowMenu(false)} />
      )}
    </>
  );
}
```

---

## 9. Gesture Handler: Fling (Swipe)

A fling is a quick directional gesture. Unlike pan, it triggers once at a velocity threshold.

```typescript
import { Directions } from "react-native-gesture-handler";

function FlingNavigator() {
  const translateX = useSharedValue(0);

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      // Navigate back
      runOnJS(router.back)();
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      // Navigate forward
      runOnJS(router.push)("/next-screen");
    });

  const composed = Gesture.Simultaneous(flingRight, flingLeft);

  return (
    <GestureDetector gesture={composed}>
      <View className="flex-1">{/* Screen content */}</View>
    </GestureDetector>
  );
}
```

---

## 10. Composing Gestures

The real power of Gesture Handler is combining gestures.

### Simultaneous (Both Active Together)

```typescript
// Pinch AND pan at the same time (for image viewing)
const composed = Gesture.Simultaneous(pinchGesture, panGesture);
```

### Exclusive (Only One Wins)

```typescript
// Double tap OR single tap (double tap checked first)
const composed = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
```

### Race (First One to Activate Wins)

```typescript
// Either swipe left OR swipe right (whichever direction starts first)
const composed = Gesture.Race(swipeLeftGesture, swipeRightGesture);
```

### Complex Composition

```typescript
// Image viewer: pinch + pan simultaneous, double-tap exclusive with tap
function FullImageViewer({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // Zoom out
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        // Zoom in to 2x
        scale.value = withSpring(2);
      }
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) scale.value = withSpring(1);
      if (scale.value > 5) scale.value = withSpring(5);
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Pinch and pan work simultaneously
  // Double tap is exclusive with pinch+pan
  const composed = Gesture.Exclusive(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style} className="flex-1">
        <Image source={{ uri }} className="h-full w-full" contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 11. Building Real Features

### Tinder-Style Card Swipe

```typescript
function SwipeCard({
  book,
  onSwipeLeft,
  onSwipeRight,
}: {
  book: Book;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = 150;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3; // Dampened vertical
    })
    .onEnd((e) => {
      if (translateX.value > SWIPE_THRESHOLD || e.velocityX > 500) {
        // Swiped right - "Like"
        translateX.value = withTiming(400, { duration: 200 });
        runOnJS(onSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD || e.velocityX < -500) {
        // Swiped left - "Skip"
        translateX.value = withTiming(-400, { duration: 200 });
        runOnJS(onSwipeLeft)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotate}deg` },
      ],
    };
  });

  // Like/Skip overlays
  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={cardStyle} className="h-96 w-72 rounded-3xl bg-surface shadow-xl">
        <Image
          source={{ uri: book.coverUrl }}
          className="h-full w-full rounded-3xl"
          contentFit="cover"
        />

        {/* "LIKE" overlay */}
        <Animated.View
          style={likeOpacity}
          className="absolute left-4 top-8 rounded-lg border-4 border-green-500 px-4 py-2"
        >
          <Text className="text-2xl font-black text-green-500">LIKE</Text>
        </Animated.View>

        {/* "SKIP" overlay */}
        <Animated.View
          style={skipOpacity}
          className="absolute right-4 top-8 rounded-lg border-4 border-red-500 px-4 py-2"
        >
          <Text className="text-2xl font-black text-red-500">SKIP</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Pull to Refresh (Custom Animated)

```typescript
function CustomPullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const TRIGGER_THRESHOLD = 80;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isRefreshing.value) return;
      // Only pull down (positive Y), with resistance
      translateY.value = Math.max(0, e.translationY * 0.5);
    })
    .onEnd(() => {
      if (isRefreshing.value) return;

      if (translateY.value > TRIGGER_THRESHOLD) {
        // Trigger refresh
        translateY.value = withTiming(TRIGGER_THRESHOLD);
        isRefreshing.value = true;
        runOnJS(doRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const doRefresh = async () => {
    await onRefresh();
    isRefreshing.value = false;
    translateY.value = withSpring(0);
  };

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, TRIGGER_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        rotate: `${interpolate(
          translateY.value,
          [0, TRIGGER_THRESHOLD],
          [0, 360]
        )}deg`,
      },
    ],
  }));

  return (
    <View className="flex-1">
      {/* Refresh indicator */}
      <Animated.View
        style={spinnerStyle}
        className="absolute left-0 right-0 top-2 items-center"
      >
        <ActivityIndicator size="large" color="#007A5E" />
      </Animated.View>

      {/* Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={contentStyle} className="flex-1">
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### Bottom Sheet

```typescript
function BottomSheet({
  children,
  snapPoints = [0, 300, 600],
}: {
  children: React.ReactNode;
  snapPoints?: number[];
}) {
  const translateY = useSharedValue(0);
  const currentSnap = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newY = currentSnap.value - e.translationY;
      translateY.value = Math.max(
        snapPoints[0],
        Math.min(snapPoints[snapPoints.length - 1], newY)
      );
    })
    .onEnd((e) => {
      // Find nearest snap point, considering velocity
      const projected = translateY.value + e.velocityY * -0.1;
      const nearest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - projected) < Math.abs(prev - projected) ? curr : prev
      );
      translateY.value = withSpring(nearest, {
        damping: 20,
        stiffness: 200,
      });
      currentSnap.value = nearest;
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, snapPoints[snapPoints.length - 1]],
      [0, 0.5]
    ),
    pointerEvents: translateY.value > 50 ? "auto" : "none",
  }));

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={backdropStyle}
        className="absolute inset-0 bg-black"
      />

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={sheetStyle}
          className="absolute bottom-0 left-0 right-0 min-h-[600px] rounded-t-3xl bg-surface shadow-2xl"
        >
          {/* Handle */}
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </View>

          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
}
```

For production, use `@gorhom/bottom-sheet` which handles all edge cases.

---

## 12. Connecting Gestures with Reanimated

### The Worklet Concept

```typescript
// Functions that run on the UI thread are called "worklets"
// Gesture callbacks (onUpdate, onEnd, etc.) are AUTOMATICALLY worklets

const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    // This runs on the UI thread (worklet)
    translateX.value = e.translationX; // Direct shared value assignment

    // To call JS functions from a worklet, use runOnJS:
    runOnJS(console.log)("Moving!"); // Bridges back to JS thread
    runOnJS(setShowTooltip)(true);   // Update React state from worklet
  });
```

### Shared Values Are the Bridge

```typescript
// Gesture → SharedValue → AnimatedStyle
//
// 1. Gesture updates shared value (on UI thread)
// 2. AnimatedStyle reads shared value (on UI thread)
// 3. Native view updates (on UI thread)
// 4. JS thread is NEVER involved = 60fps guaranteed

const translateX = useSharedValue(0);

// Gesture updates the value
Gesture.Pan().onUpdate((e) => {
  translateX.value = e.translationX;
});

// Animated style reads the value
useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### runOnJS vs runOnUI

```typescript
import { runOnJS, runOnUI } from "react-native-reanimated";

// runOnJS: Call a JS function from a worklet (UI → JS)
const panGesture = Gesture.Pan().onEnd(() => {
  // We're in a worklet (UI thread)
  runOnJS(handleSwipeComplete)(); // Jump to JS thread
});

// runOnUI: Call a worklet from JS (JS → UI)
const triggerAnimation = () => {
  // We're in JS
  runOnUI(() => {
    "worklet";
    scale.value = withSpring(2); // Run on UI thread
  })();
};
```

---

## 13. Advanced: Custom Gesture Recognizers

### Gesture State Machine

```typescript
// Build a "hold and drag" gesture: long press to activate, then pan
function HoldAndDrag() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isActive.value = true;
      scale.value = withSpring(1.1);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  const pan = Gesture.Pan()
    .manualActivation(true) // Don't auto-activate
    .onTouchesMove((e, state) => {
      if (isActive.value) {
        state.activate(); // Activate pan only after long press
      }
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isActive.value = false;
      scale.value = withSpring(1);
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isActive.value ? 100 : 0,
    shadowOpacity: isActive.value ? 0.3 : 0,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style} className="h-20 rounded-xl bg-surface p-4">
        <Text className="text-foreground">Hold to drag</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 14. Troubleshooting

### Common Issues

```
"Gestures are not working at all"
  → Make sure <GestureHandlerRootView> wraps your entire app
  → Check that the gesture is on the correct element (not a plain View)

"Pan gesture blocks scroll"
  → Use activeOffsetX/activeOffsetY to set activation threshold
  → Use failOffsetX/failOffsetY to fail in the scroll direction
  → Example for horizontal swipe inside vertical scroll:
    Gesture.Pan()
      .activeOffsetX([-10, 10])  // Activate after 10px horizontal
      .failOffsetY([-5, 5])      // Fail if 5px vertical

"Gesture detector not receiving touches"
  → Ensure the GestureDetector child has a measurable size
  → Animated.View must be directly inside GestureDetector
  → Check for overlapping gesture detectors

"runOnJS is not defined"
  → Import: import { runOnJS } from 'react-native-reanimated';

"Worklet doesn't have access to variable"
  → Closures work in worklets, but only for shared values and simple types
  → For complex objects, use runOnJS to access them on the JS thread

"Gesture doesn't work in a modal or bottom sheet"
  → These need their own GestureHandlerRootView
  → Or use the gestureHandlerRootHOC wrapper
```

### Debugging Gestures

```typescript
const panGesture = Gesture.Pan()
  .onBegin(() => console.log("BEGIN"))     // Touch starts
  .onStart(() => console.log("START"))     // Gesture recognized
  .onUpdate((e) => console.log("UPDATE", e.translationX))
  .onEnd((e) => console.log("END", e.velocityX))
  .onFinalize((e, success) =>
    console.log("FINALIZE", success ? "SUCCESS" : "FAILED")
  );
```

### Gesture Lifecycle

```
Touch Down → onBegin
             ↓
         (threshold reached?)
         ↓ Yes           ↓ No
      onStart          onFinalize(failed)
         ↓
      onUpdate (repeated)
         ↓
      Touch Up → onEnd → onFinalize(success)
```

---

## 15. Gesture Recipes

### Recipe: Page Flip (Book Reader)

```typescript
function PageFlip({ pages, currentPage, onPageChange }: Props) {
  const translateX = useSharedValue(0);
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = SCREEN_WIDTH / 3;

      if (translateX.value < -threshold && currentPage < pages.length - 1) {
        // Next page
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        runOnJS(onPageChange)(currentPage + 1);
      } else if (translateX.value > threshold && currentPage > 0) {
        // Previous page
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
        runOnJS(onPageChange)(currentPage - 1);
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  // Reset position when page changes
  useEffect(() => {
    translateX.value = 0;
  }, [currentPage]);

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={pageStyle} className="flex-1">
        {pages[currentPage]}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Recipe: Dismiss Modal by Swiping Down

```typescript
function SwipeToDismissModal({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  const translateY = useSharedValue(0);
  const DISMISS_THRESHOLD = 150;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow downward swipe
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (
        translateY.value > DISMISS_THRESHOLD ||
        e.velocityY > 500
      ) {
        translateY.value = withTiming(800, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderRadius: interpolate(
      translateY.value,
      [0, 100],
      [0, 24],
      Extrapolation.CLAMP
    ),
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, DISMISS_THRESHOLD],
      [0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="flex-1">
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-black" />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={modalStyle} className="flex-1 bg-surface">
          {/* Drag handle */}
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### Recipe: Slider Control

```typescript
function CustomSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
}: Props) {
  const translateX = useSharedValue(0);
  const sliderWidth = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(sliderWidth.value, e.absoluteX - 20));
      translateX.value = newX;

      const newValue = min + (newX / sliderWidth.value) * (max - min);
      runOnJS(onValueChange)(Math.round(newValue));
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackFillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <View
      className="h-12 justify-center px-5"
      onLayout={(e) => {
        sliderWidth.value = e.nativeEvent.layout.width - 40;
      }}
    >
      {/* Track background */}
      <View className="h-1 rounded-full bg-muted" />

      {/* Track fill */}
      <Animated.View
        style={trackFillStyle}
        className="absolute left-5 h-1 rounded-full bg-primary"
      />

      {/* Thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={thumbStyle}
          className="absolute h-6 w-6 rounded-full bg-primary shadow-md"
        />
      </GestureDetector>
    </View>
  );
}
```
