# Camera in React Native / Expo

> From taking a selfie to building a barcode scanner and real-time processing.

---

## Table of Contents

1. [Camera Concepts in Mobile](#1-camera-concepts-in-mobile)
2. [Setup & Permissions](#2-setup--permissions)
3. [Basic Camera View](#3-basic-camera-view)
4. [Taking Photos](#4-taking-photos)
5. [Recording Video](#5-recording-video)
6. [Image Picker (Gallery + Camera)](#6-image-picker-gallery--camera)
7. [Barcode & QR Code Scanning](#7-barcode--qr-code-scanning)
8. [Camera Controls (Flash, Zoom, Focus)](#8-camera-controls-flash-zoom-focus)
9. [Photo Preview & Editing](#9-photo-preview--editing)
10. [Image Upload to Server](#10-image-upload-to-server)
11. [Advanced: Frame Processing](#11-advanced-frame-processing)
12. [Advanced: Custom Camera UI](#12-advanced-custom-camera-ui)
13. [Performance & Memory](#13-performance--memory)
14. [Platform Differences](#14-platform-differences)
15. [Production Checklist](#15-production-checklist)

---

## 1. Camera Concepts in Mobile

### How Camera Works in React Native

```
Native Camera Hardware
        ↓
Camera API (AVFoundation on iOS, Camera2 on Android)
        ↓
Native View (renders camera preview)
        ↓
React Native Bridge / JSI
        ↓
Your <CameraView> component
```

The camera preview runs on the GPU entirely in native code. Your JS code only controls settings and receives callbacks (photo taken, barcode detected, etc.).

### Two Approaches

| Approach | Library | Use Case |
|----------|---------|----------|
| Full Camera UI | `expo-camera` | Custom camera screens, barcode scanning |
| System Picker | `expo-image-picker` | Profile photos, upload from gallery, quick capture |

**Rule of thumb:** If you need a viewfinder on screen, use `expo-camera`. If you just need the user to pick/take a photo, use `expo-image-picker`.

---

## 2. Setup & Permissions

### Install

```bash
npx expo install expo-camera expo-image-picker expo-media-library
```

You already have `expo-camera` and `expo-image-picker` installed.

### Permissions

Camera access requires explicit user permission on both platforms.

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "QuickRead needs your camera to scan book covers.",
          "microphonePermission": "QuickRead needs your microphone for video.",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "QuickRead needs access to your photos to set a profile picture.",
          "cameraPermission": "QuickRead needs your camera to take a profile picture."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "QuickRead needs access to save photos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ]
  }
}
```

### Requesting Permissions Properly

```typescript
import { Camera } from "expo-camera";

async function requestCameraPermission(): Promise<boolean> {
  // Check current status first
  const { status: existingStatus } = await Camera.getCameraPermissionsAsync();

  if (existingStatus === "granted") return true;

  // Request permission
  const { status } = await Camera.requestCameraPermissionsAsync();

  if (status === "granted") return true;

  // Permission denied
  if (status === "denied") {
    // On iOS, once denied, can only be changed in Settings
    // Show a helpful message
    Alert.alert(
      "Camera Permission Required",
      "Please enable camera access in your device Settings to scan book covers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  return false;
}
```

### Permission Hook

```typescript
// hooks/useCameraPermission.ts
import { useCameraPermissions } from "expo-camera";

export function useCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();

  return {
    isGranted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    status: permission?.status ?? "undetermined",
    request: requestPermission,
    openSettings: () => Linking.openSettings(),
  };
}
```

---

## 3. Basic Camera View

### Minimal Camera Screen

```typescript
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  // Still loading permission status
  if (!permission) return <View />;

  // Permission not granted
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-2 text-center text-lg font-semibold text-foreground">
          Camera Access Needed
        </Text>
        <Text className="mb-6 text-center text-foreground-secondary">
          We need camera access to scan book covers and barcodes.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-semibold text-primary-foreground">
            Grant Access
          </Text>
        </Pressable>
      </View>
    );
  }

  // Camera ready
  return (
    <View className="flex-1">
      <CameraView
        className="flex-1"
        facing="back" // "back" | "front"
      />
    </View>
  );
}
```

---

## 4. Taking Photos

### Photo Capture

```typescript
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";

export default function PhotoCaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const result = await cameraRef.current.takePictureAsync({
      quality: 0.8,          // 0-1, trade quality for file size
      base64: false,         // Set true if you need base64 (slower)
      exif: false,           // Set true to include EXIF data
      skipProcessing: false, // Set true for faster capture (no auto-adjustments)
    });

    if (result) {
      setPhoto(result.uri);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // Show preview if photo taken
  if (photo) {
    return (
      <PhotoPreview
        uri={photo}
        onRetake={() => setPhoto(null)}
        onAccept={() => handleAcceptPhoto(photo)}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing={facing}>
        {/* Camera overlay UI */}
        <View className="flex-1 justify-end pb-12">
          <View className="flex-row items-center justify-center gap-12">
            {/* Flip button */}
            <Pressable
              onPress={toggleFacing}
              className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
            >
              <FlipCamera color="white" size={24} />
            </Pressable>

            {/* Capture button */}
            <Pressable
              onPress={takePhoto}
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
            >
              <View className="h-16 w-16 rounded-full bg-white" />
            </Pressable>

            {/* Placeholder for symmetry */}
            <View className="h-12 w-12" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}
```

### Photo Preview Component

```typescript
import { Image } from "expo-image";

function PhotoPreview({
  uri,
  onRetake,
  onAccept,
}: {
  uri: string;
  onRetake: () => void;
  onAccept: () => void;
}) {
  return (
    <View className="flex-1 bg-black">
      <Image source={{ uri }} className="flex-1" contentFit="contain" />

      <View className="flex-row justify-between p-6">
        <Pressable
          onPress={onRetake}
          className="rounded-xl bg-white/20 px-8 py-4"
        >
          <Text className="font-semibold text-white">Retake</Text>
        </Pressable>

        <Pressable
          onPress={onAccept}
          className="rounded-xl bg-primary px-8 py-4"
        >
          <Text className="font-semibold text-primary-foreground">
            Use Photo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## 5. Recording Video

```typescript
export default function VideoRecordScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);

    const video = await cameraRef.current.recordAsync({
      maxDuration: 60,      // Max 60 seconds
      maxFileSize: 50_000_000, // Max 50MB
    });

    setIsRecording(false);

    if (video) {
      setVideoUri(video.uri);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        facing="back"
        mode="video" // IMPORTANT: set mode to "video"
      >
        <View className="flex-1 justify-end pb-12">
          <View className="items-center">
            {isRecording && (
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full bg-red-500" />
                <Text className="font-medium text-white">Recording...</Text>
              </View>
            )}

            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              className={`h-20 w-20 items-center justify-center rounded-full border-4 ${
                isRecording ? "border-red-500" : "border-white"
              }`}
            >
              <View
                className={`rounded-full ${
                  isRecording
                    ? "h-8 w-8 rounded-md bg-red-500"
                    : "h-16 w-16 bg-red-500"
                }`}
              />
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
```

---

## 6. Image Picker (Gallery + Camera)

This is what you'll use most often. No custom camera UI needed.

### Basic Usage

```typescript
import * as ImagePicker from "expo-image-picker";

// Pick from gallery
async function pickFromGallery() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],            // "images", "videos", or both
    allowsEditing: true,               // Shows crop/edit UI
    aspect: [1, 1],                    // Square crop (for profile pics)
    quality: 0.8,                      // Compression quality
  });

  if (!result.canceled) {
    const image = result.assets[0];
    console.log("URI:", image.uri);
    console.log("Size:", image.width, "x", image.height);
    console.log("File size:", image.fileSize);
    return image;
  }

  return null;
}

// Take a photo
async function takePhoto() {
  // Request camera permission first
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission needed", "Camera access is required.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0];
  }

  return null;
}
```

### Complete Profile Picture Picker

```typescript
// features/profile/components/AvatarPicker.tsx
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

function AvatarPicker({
  currentAvatar,
  onAvatarChange,
}: {
  currentAvatar: string | null;
  onAvatarChange: (uri: string) => void;
}) {
  const showOptions = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: handleTakePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: handlePickFromGallery,
      },
      ...(currentAvatar
        ? [
            {
              text: "Remove Photo",
              style: "destructive" as const,
              onPress: () => onAvatarChange(""),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission",
        "Enable camera in Settings to take photos.",
        [
          { text: "Cancel" },
          { text: "Settings", onPress: Linking.openSettings },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      onAvatarChange(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      onAvatarChange(result.assets[0].uri);
    }
  };

  return (
    <Pressable onPress={showOptions} className="items-center">
      <View className="relative">
        {currentAvatar ? (
          <Image
            source={{ uri: currentAvatar }}
            className="h-24 w-24 rounded-full"
            contentFit="cover"
          />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
            <UserIcon size={40} color="#9CA3AF" />
          </View>
        )}

        {/* Edit badge */}
        <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
          <PencilIcon size={14} color="white" />
        </View>
      </View>

      <Text className="mt-2 text-sm font-medium text-primary">
        Change Photo
      </Text>
    </Pressable>
  );
}
```

### Multiple Image Selection

```typescript
async function pickMultipleImages(maxCount: number = 5) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true, // Enable multi-select
    selectionLimit: maxCount,      // Max number of images
    quality: 0.7,
    orderedSelection: true,        // iOS: show selection order numbers
  });

  if (!result.canceled) {
    return result.assets; // Array of images
  }

  return [];
}
```

---

## 7. Barcode & QR Code Scanning

### Built-in Barcode Scanner

```typescript
import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult } from "expo-camera";

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return; // Prevent multiple scans

    setScanned(true);

    // result.type: "qr", "ean13", "ean8", "upc_a", "upc_e", "code128", etc.
    // result.data: The barcode content

    console.log(`Scanned ${result.type}: ${result.data}`);

    // For QuickRead: scan ISBN barcode to find a book
    if (result.type === "ean13" || result.type === "isbn13") {
      lookupBookByISBN(result.data);
    } else if (result.type === "qr") {
      handleQRCode(result.data);
    }

    // Allow rescanning after delay
    setTimeout(() => setScanned(false), 2000);
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-foreground">Camera access needed to scan</Text>
        <Pressable onPress={requestPermission} className="rounded-xl bg-primary px-6 py-3">
          <Text className="text-primary-foreground">Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "upc_a",
            "code128",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Scanning overlay */}
        <View className="flex-1 items-center justify-center">
          {/* Dimmed background with clear center */}
          <View className="absolute inset-0 bg-black/50" />

          {/* Scan window */}
          <View className="h-64 w-64 overflow-hidden rounded-3xl border-2 border-white">
            <View className="absolute inset-0 bg-transparent" />
          </View>

          {/* Instructions */}
          <Text className="mt-6 text-center text-white">
            Point your camera at a barcode
          </Text>

          {scanned && (
            <Pressable
              onPress={() => setScanned(false)}
              className="mt-4 rounded-xl bg-white/20 px-6 py-3"
            >
              <Text className="text-white">Tap to Scan Again</Text>
            </Pressable>
          )}
        </View>
      </CameraView>
    </View>
  );
}
```

### Scanning Overlay with Animated Line

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

function ScannerOverlay() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(240, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true // Reverse
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center">
      <View className="absolute inset-0 bg-black/60" />

      <View className="relative h-64 w-64">
        {/* Corner brackets */}
        <View className="absolute left-0 top-0 h-8 w-8 border-l-3 border-t-3 border-primary rounded-tl-lg" />
        <View className="absolute right-0 top-0 h-8 w-8 border-r-3 border-t-3 border-primary rounded-tr-lg" />
        <View className="absolute bottom-0 left-0 h-8 w-8 border-b-3 border-l-3 border-primary rounded-bl-lg" />
        <View className="absolute bottom-0 right-0 h-8 w-8 border-b-3 border-r-3 border-primary rounded-br-lg" />

        {/* Animated scan line */}
        <Animated.View
          style={lineStyle}
          className="absolute left-2 right-2 h-0.5 bg-primary"
        />
      </View>
    </View>
  );
}
```

### ISBN to Book Lookup

```typescript
// For QuickRead - scan a book's barcode and look it up
async function lookupBookByISBN(isbn: string) {
  try {
    // Try your own API first
    const { data: book } = await api.get(`/books/isbn/${isbn}/`);
    router.push(`/book/${book.id}`);
  } catch {
    // Fallback to Open Library API (free, no key needed)
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (bookData) {
      // Show book info, offer to add to library
      showBookFoundDialog(bookData);
    } else {
      Alert.alert("Book Not Found", "No book found for this barcode.");
    }
  }
}
```

---

## 8. Camera Controls (Flash, Zoom, Focus)

```typescript
export default function AdvancedCameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [zoom, setZoom] = useState(0);

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        facing="back"
        flash={flash}
        zoom={zoom} // 0 to 1
        // Autofocus is enabled by default
        // Mirror front camera: mirror={facing === "front"}
      >
        {/* Controls overlay */}
        <SafeAreaView className="flex-1">
          {/* Top bar - Flash toggle */}
          <View className="flex-row justify-center gap-4 p-4">
            {(["off", "auto", "on"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setFlash(mode)}
                className={`rounded-full px-4 py-2 ${
                  flash === mode ? "bg-white" : "bg-white/20"
                }`}
              >
                <Text
                  className={
                    flash === mode ? "text-black" : "text-white"
                  }
                >
                  {mode === "off" && "Flash Off"}
                  {mode === "auto" && "Auto"}
                  {mode === "on" && "Flash On"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Bottom - Zoom slider */}
          <View className="mt-auto p-6">
            <View className="flex-row items-center gap-3">
              <Text className="text-white">1x</Text>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                className="flex-1"
              />
              <Text className="text-white">10x</Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
```

### Pinch to Zoom with Gesture Handler

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";

function PinchZoomCamera() {
  const [zoom, setZoom] = useState(0);
  const savedZoom = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      // Scale 0-1: pinch scale of 1 = no zoom, 2 = halfway, 3+ = max
      const newZoom = Math.min(1, Math.max(0, savedZoom.value + (e.scale - 1) / 3));
      runOnJS(setZoom)(newZoom);
    })
    .onEnd(() => {
      savedZoom.value = zoom;
    });

  return (
    <GestureDetector gesture={pinchGesture}>
      <CameraView className="flex-1" zoom={zoom} facing="back" />
    </GestureDetector>
  );
}
```

---

## 9. Photo Preview & Editing

### Image Manipulation with expo-image-manipulator

```bash
npx expo install expo-image-manipulator
```

```typescript
import { manipulateAsync, SaveFormat, FlipType } from "expo-image-manipulator";

// Resize image before upload
async function resizeForUpload(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 800 } }], // Resize to 800px wide, maintain aspect ratio
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  return result.uri;
}

// Crop to square
async function cropToSquare(
  uri: string,
  width: number,
  height: number
): Promise<string> {
  const size = Math.min(width, height);
  const originX = (width - size) / 2;
  const originY = (height - size) / 2;

  const result = await manipulateAsync(
    uri,
    [
      {
        crop: {
          originX,
          originY,
          width: size,
          height: size,
        },
      },
      { resize: { width: 500 } },
    ],
    { compress: 0.8, format: SaveFormat.JPEG }
  );
  return result.uri;
}

// Rotate
async function rotateImage(uri: string, degrees: number): Promise<string> {
  const result = await manipulateAsync(uri, [{ rotate: degrees }]);
  return result.uri;
}

// Flip
async function flipImage(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [
    { flip: FlipType.Horizontal },
  ]);
  return result.uri;
}
```

### Save to Gallery

```typescript
import * as MediaLibrary from "expo-media-library";

async function saveToGallery(uri: string): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();

  if (status !== "granted") {
    Alert.alert("Permission needed", "Allow photo library access to save.");
    return false;
  }

  await MediaLibrary.saveToLibraryAsync(uri);
  return true;
}
```

---

## 10. Image Upload to Server

### Multipart Form Upload

```typescript
// The correct way to upload images from React Native
async function uploadImage(
  uri: string,
  endpoint: string
): Promise<{ url: string }> {
  // Create form data
  const formData = new FormData();

  // React Native's FormData accepts this format
  formData.append("image", {
    uri: uri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  // Add other fields
  formData.append("description", "Profile picture");

  const { data } = await api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // Track upload progress
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
      );
      console.log(`Upload: ${percentCompleted}%`);
    },
  });

  return data;
}
```

### Upload with Progress UI

```typescript
function ImageUploader({ uri, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );

  const upload = async () => {
    setStatus("uploading");

    try {
      // Resize before upload
      const resizedUri = await resizeForUpload(uri);

      const formData = new FormData();
      formData.append("image", {
        uri: resizedUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const { data } = await api.post("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / (e.total ?? 1)));
        },
      });

      setStatus("done");
      onComplete(data.url);
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <View className="items-center gap-4">
      <Image source={{ uri }} className="h-40 w-40 rounded-xl" />

      {status === "uploading" && (
        <View className="w-full">
          <View className="h-2 rounded-full bg-muted">
            <View
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-primary"
            />
          </View>
          <Text className="mt-1 text-center text-sm text-foreground-secondary">
            {progress}%
          </Text>
        </View>
      )}

      {status === "idle" && (
        <Pressable onPress={upload} className="rounded-xl bg-primary px-6 py-3">
          <Text className="font-semibold text-primary-foreground">Upload</Text>
        </Pressable>
      )}

      {status === "done" && (
        <Text className="font-medium text-success">Upload complete</Text>
      )}

      {status === "error" && (
        <View className="items-center gap-2">
          <Text className="text-destructive">Upload failed</Text>
          <Pressable onPress={upload}>
            <Text className="text-primary">Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
```

---

## 11. Advanced: Frame Processing

For real-time processing (OCR, object detection, AR):

### react-native-vision-camera (Alternative to expo-camera)

```bash
npx expo install react-native-vision-camera
npx expo install react-native-worklets-core
```

```typescript
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

function RealtimeScanner() {
  const device = useCameraDevice("back");

  const onTextDetected = useRunOnJS((text: string) => {
    console.log("Detected text:", text);
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    // This runs on a separate thread at 30fps
    // Use vision-camera plugins for ML processing:
    // - text recognition (OCR)
    // - barcode scanning
    // - face detection
    // - object detection
  }, []);

  if (!device) return null;

  return (
    <Camera
      device={device}
      isActive={true}
      style={{ flex: 1 }}
      frameProcessor={frameProcessor}
      pixelFormat="yuv" // Faster than rgb for ML
    />
  );
}
```

Frame processors are worklets (run on native thread), so they don't block your JS thread. This is how apps like Snapchat filters work.

---

## 12. Advanced: Custom Camera UI

### Full-Featured Camera Screen

```typescript
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type CameraMode = "photo" | "video" | "scan";

export default function ProCameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("photo");
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [isRecording, setIsRecording] = useState(false);

  // Shutter animation
  const shutterScale = useSharedValue(1);
  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  const capturePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    shutterScale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1)
    );

    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.8,
    });

    if (photo) {
      router.push({ pathname: "/preview", params: { uri: photo.uri } });
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        facing={facing}
        flash={flash}
        mode={mode === "video" ? "video" : "picture"}
        barcodeScannerSettings={
          mode === "scan"
            ? { barcodeTypes: ["qr", "ean13"] }
            : undefined
        }
        onBarcodeScanned={
          mode === "scan" ? handleBarcodeScanned : undefined
        }
      >
        <SafeAreaView className="flex-1 justify-between">
          {/* Top controls */}
          <View className="flex-row items-center justify-between px-4 py-2">
            <Pressable onPress={() => router.back()}>
              <X color="white" size={28} />
            </Pressable>

            <Pressable
              onPress={() =>
                setFlash((f) =>
                  f === "off" ? "auto" : f === "auto" ? "on" : "off"
                )
              }
              className="rounded-full bg-white/20 p-2"
            >
              {flash === "off" && <ZapOff color="white" size={20} />}
              {flash === "auto" && <Zap color="yellow" size={20} />}
              {flash === "on" && <Zap color="white" size={20} />}
            </Pressable>
          </View>

          {/* Bottom controls */}
          <View className="items-center gap-6 pb-8">
            {/* Mode selector */}
            <View className="flex-row gap-6">
              {(["photo", "video", "scan"] as const).map((m) => (
                <Pressable key={m} onPress={() => setMode(m)}>
                  <Text
                    className={`text-sm font-semibold uppercase ${
                      mode === m ? "text-white" : "text-white/50"
                    }`}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Capture / Record button */}
            <View className="flex-row items-center gap-12">
              <View className="w-12" />

              <GestureDetector gesture={Gesture.Tap().onEnd(capturePhoto)}>
                <Animated.View
                  style={shutterStyle}
                  className={`h-20 w-20 items-center justify-center rounded-full border-4 ${
                    mode === "video" ? "border-red-500" : "border-white"
                  }`}
                >
                  <View
                    className={`rounded-full ${
                      mode === "video"
                        ? isRecording
                          ? "h-8 w-8 rounded-md bg-red-500"
                          : "h-16 w-16 bg-red-500"
                        : "h-16 w-16 bg-white"
                    }`}
                  />
                </Animated.View>
              </GestureDetector>

              <Pressable
                onPress={() =>
                  setFacing((f) => (f === "back" ? "front" : "back"))
                }
                className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
              >
                <SwitchCamera color="white" size={22} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
```

---

## 13. Performance & Memory

### Image Memory Management

```
Problem: A 12MP photo (4000x3000) uses ~48MB of RAM uncompressed.
Loading many full-size images = crash.

Solutions:
1. Always resize before displaying (expo-image handles this via contentFit)
2. Use expo-image (not RN Image) - it uses native caching and resizing
3. Clean up temporary camera files when done
4. Use thumbnails in lists, full-size only in detail views
```

```typescript
// Clean up temporary files
import * as FileSystem from "expo-file-system";

async function cleanupTempPhotos() {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return;

  const files = await FileSystem.readDirectoryAsync(cacheDir);
  const photoFiles = files.filter(
    (f) => f.endsWith(".jpg") || f.endsWith(".png")
  );

  for (const file of photoFiles) {
    await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
  }
}
```

### Camera Preview Performance

```
- CameraView renders at 30fps by default
- Don't overlay heavy JS-rendered UI on top of camera
- Use simple, mostly static overlays
- Frame processors (vision-camera) run on native thread
- Don't call setState on every frame
```

---

## 14. Platform Differences

### iOS

```
- AVFoundation powers the camera
- Face ID works alongside camera (can use both)
- Live Photos supported (expo-camera supports .mov format)
- HEIF format by default (smaller files, good quality)
- Smooth zoom transition between camera lenses
- Camera permission dialog appears once; if denied, must go to Settings
```

### Android

```
- Camera2 API (or CameraX via libraries)
- Huge hardware variety (different sensors, capabilities per device)
- Some devices have buggy camera implementations
- JPEG format by default
- Zoom may switch between multiple camera lenses (ultrawide, main, tele)
- Camera permission can be "Ask every time" on Android 12+
- Background camera access restricted on Android 11+
```

### Testing Tips

```
- iOS Simulator: No camera hardware. Use expo-image-picker with gallery.
- Android Emulator: Has a simulated camera (virtual scene).
- Always test on REAL DEVICES for camera features.
- Test with both front and back cameras.
- Test in low light conditions.
- Test with different photo sizes and orientations.
```

---

## 15. Production Checklist

```
Permissions:
  [ ] Camera permission message is clear and specific
  [ ] Microphone permission requested only when recording video
  [ ] Media library permission requested only when saving
  [ ] Graceful handling when permissions are denied
  [ ] "Open Settings" button when permission permanently denied

Camera:
  [ ] Camera works on both iOS and Android
  [ ] Front and back camera work correctly
  [ ] Flash works (off, on, auto)
  [ ] Photo quality is appropriate (not too large, not too compressed)
  [ ] Camera releases resources when screen unmounts
  [ ] Orientation handled correctly (landscape photos aren't rotated)

Images:
  [ ] Images resized before upload (don't upload 12MP photos)
  [ ] Upload progress indicator shown
  [ ] Upload errors handled gracefully with retry option
  [ ] Temporary files cleaned up
  [ ] Gallery images work (not just camera captures)

UX:
  [ ] Photo preview before accepting/uploading
  [ ] Retake option available
  [ ] Loading states during processing
  [ ] Haptic feedback on capture
  [ ] Shutter animation for visual feedback

Performance:
  [ ] expo-image used for display (not RN Image)
  [ ] Images cached properly
  [ ] No memory leaks from uncleaned camera refs
  [ ] Large image lists use FlatList (virtualized)
```
