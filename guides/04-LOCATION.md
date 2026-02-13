# Location Services in React Native / Expo

> GPS, maps, geofencing, and background tracking — from "where am I?" to production-grade location features.

---

## Table of Contents

1. [How Location Works on Mobile](#1-how-location-works-on-mobile)
2. [Setup & Permissions](#2-setup--permissions)
3. [Getting Current Location](#3-getting-current-location)
4. [Watching Location Changes](#4-watching-location-changes)
5. [Reverse Geocoding (Coordinates → Address)](#5-reverse-geocoding-coordinates--address)
6. [Forward Geocoding (Address → Coordinates)](#6-forward-geocoding-address--coordinates)
7. [Displaying Maps](#7-displaying-maps)
8. [Map Markers & Custom Pins](#8-map-markers--custom-pins)
9. [Geofencing](#9-geofencing)
10. [Background Location Tracking](#10-background-location-tracking)
11. [Distance & Region Calculations](#11-distance--region-calculations)
12. [Performance & Battery](#12-performance--battery)
13. [Platform Differences](#13-platform-differences)
14. [Privacy & App Store Compliance](#14-privacy--app-store-compliance)
15. [Production Checklist](#15-production-checklist)

---

## 1. How Location Works on Mobile

### Location Sources (Accuracy vs Battery)

```
Source          Accuracy     Battery    Speed       Indoor
─────────────  ──────────   ────────   ─────────   ──────
GPS             1-5m         High       Slow        Poor
Wi-Fi           15-40m       Low        Fast        Good
Cell Tower      100-3000m    Very Low   Very Fast   OK
Bluetooth/BLE   1-3m         Low        Fast        Great
```

The OS fuses these sources automatically. You just specify your desired accuracy level, and the OS picks the best strategy.

### Permission Levels

```
"When In Use" (foreground only):
  - Location only available while app is on screen
  - Green indicator shown in status bar (iOS)
  - Sufficient for most apps

"Always" (background):
  - Location available even when app is in background/killed
  - Required for geofencing, background tracking
  - App Store requires justification (Apple will REJECT without good reason)
  - Shows blue indicator on iOS, persistent notification on Android
```

---

## 2. Setup & Permissions

### Install

```bash
npx expo install expo-location
```

You already have `expo-location` installed.

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "QuickRead uses your location to find bookstores and reading events near you.",
          "locationAlwaysPermission": "QuickRead needs background location to notify you of nearby bookstores.",
          "locationWhenInUsePermission": "QuickRead uses your location to find bookstores near you.",
          "isAndroidBackgroundLocationEnabled": false,
          "isAndroidForegroundServiceEnabled": false
        }
      ]
    ]
  }
}
```

### Permission Handling

```typescript
import * as Location from "expo-location";

type LocationPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
  foreground: boolean;
  background: boolean;
};

async function requestLocationPermission(
  needsBackground = false
): Promise<LocationPermissionResult> {
  // Step 1: Request foreground permission
  const { status: fgStatus, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  if (fgStatus !== "granted") {
    return {
      granted: false,
      canAskAgain,
      foreground: false,
      background: false,
    };
  }

  // Step 2: If background needed, request it separately
  // IMPORTANT: iOS requires foreground to be granted FIRST
  let bgGranted = false;
  if (needsBackground) {
    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync();
    bgGranted = bgStatus === "granted";
  }

  return {
    granted: true,
    canAskAgain: true,
    foreground: true,
    background: bgGranted,
  };
}
```

### Permission Status Hook

```typescript
// hooks/useLocationPermission.ts
export function useLocationPermission() {
  const [permission, setPermission] = useState<Location.LocationPermissionResponse | null>(null);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(setPermission);
  }, []);

  const request = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermission(result);
    return result.granted;
  };

  return {
    isGranted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    status: permission?.status ?? "undetermined",
    request,
    openSettings: () => Linking.openSettings(),
  };
}
```

---

## 3. Getting Current Location

### One-Time Location Fetch

```typescript
import * as Location from "expo-location";

async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  const { granted } = await Location.getForegroundPermissionsAsync();
  if (!granted) {
    const { granted: newGranted } =
      await Location.requestForegroundPermissionsAsync();
    if (!newGranted) return null;
  }

  // Get location with desired accuracy
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced, // Good enough for most uses
  });

  return location;
  // Returns:
  // {
  //   coords: {
  //     latitude: 40.7128,
  //     longitude: -74.0060,
  //     altitude: 10.5,
  //     accuracy: 15,        // meters
  //     altitudeAccuracy: 3,
  //     heading: 180,        // degrees from north
  //     speed: 0,            // m/s
  //   },
  //   timestamp: 1700000000000,
  // }
}
```

### Accuracy Levels

```typescript
import { Accuracy } from "expo-location";

// Choose based on your needs:
Accuracy.Lowest;        // ~3km  - City level, minimal battery
Accuracy.Low;           // ~1km  - Neighborhood level
Accuracy.Balanced;      // ~100m - Block level (RECOMMENDED for most uses)
Accuracy.High;          // ~10m  - Street level
Accuracy.Highest;       // ~1m   - Exact position, max battery
Accuracy.BestForNavigation; // Highest + additional sensors
```

### Location Hook

```typescript
// hooks/useCurrentLocation.ts
export function useCurrentLocation(accuracy = Location.Accuracy.Balanced) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setError("Location permission not granted");
        return;
      }

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError("Location services are disabled. Enable them in Settings.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy });
      setLocation(loc);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get location"
      );
    } finally {
      setIsLoading(false);
    }
  }, [accuracy]);

  return { location, error, isLoading, refresh: fetchLocation };
}

// Usage
function NearbyScreen() {
  const { location, error, isLoading, refresh } = useCurrentLocation();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;
  if (!location) return null;

  return (
    <NearbyBookstores
      latitude={location.coords.latitude}
      longitude={location.coords.longitude}
    />
  );
}
```

### Last Known Location (Instant, No GPS Wait)

```typescript
// Returns cached location immediately (may be stale)
const lastKnown = await Location.getLastKnownPositionAsync();

// Use for: showing approximate position while waiting for accurate fix
// Don't use for: navigation, distance calculations
```

---

## 4. Watching Location Changes

### Continuous Location Updates

```typescript
// hooks/useLocationWatcher.ts
export function useLocationWatcher(
  options: {
    accuracy?: Location.Accuracy;
    distanceInterval?: number; // Minimum distance (meters) between updates
    timeInterval?: number;     // Minimum time (ms) between updates
  } = {}
) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return;

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: options.accuracy ?? Location.Accuracy.Balanced,
        distanceInterval: options.distanceInterval ?? 10, // Update every 10 meters
        timeInterval: options.timeInterval ?? 5000,       // Or every 5 seconds
      },
      (newLocation) => {
        setLocation(newLocation);
      }
    );

    setIsTracking(true);
  }, [options.accuracy, options.distanceInterval, options.timeInterval]);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { location, isTracking, startTracking, stopTracking };
}
```

### Usage: Live Location Display

```typescript
function LiveLocationScreen() {
  const { location, isTracking, startTracking, stopTracking } =
    useLocationWatcher({ distanceInterval: 5 });

  return (
    <View className="flex-1 bg-background p-4">
      {location && (
        <View className="rounded-xl bg-surface p-4">
          <Text className="text-foreground">
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text className="text-foreground">
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
          <Text className="text-foreground-secondary">
            Accuracy: {location.coords.accuracy?.toFixed(0)}m
          </Text>
          <Text className="text-foreground-secondary">
            Speed: {((location.coords.speed ?? 0) * 3.6).toFixed(1)} km/h
          </Text>
        </View>
      )}

      <Pressable
        onPress={isTracking ? stopTracking : startTracking}
        className={`mt-4 rounded-xl px-6 py-4 ${
          isTracking ? "bg-destructive" : "bg-primary"
        }`}
      >
        <Text className="text-center font-semibold text-white">
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </Text>
      </Pressable>
    </View>
  );
}
```

---

## 5. Reverse Geocoding (Coordinates → Address)

```typescript
import * as Location from "expo-location";

async function getAddressFromCoords(
  latitude: number,
  longitude: number
): Promise<Location.LocationGeocodedAddress | null> {
  const results = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  if (results.length === 0) return null;

  const address = results[0];
  // {
  //   city: "New York",
  //   country: "United States",
  //   district: "Manhattan",
  //   formattedAddress: "350 5th Ave, New York, NY 10118",
  //   isoCountryCode: "US",
  //   name: "350 5th Ave",
  //   postalCode: "10118",
  //   region: "New York",
  //   street: "5th Avenue",
  //   streetNumber: "350",
  //   subregion: "New York County",
  //   timezone: "America/New_York",
  // }

  return address;
}

// Format for display
function formatAddress(address: Location.LocationGeocodedAddress): string {
  const parts = [
    address.name,
    address.street,
    address.city,
    address.region,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
}

// Short format
function formatCityState(address: Location.LocationGeocodedAddress): string {
  return [address.city, address.region].filter(Boolean).join(", ");
}
```

### Hook: Current Location with Address

```typescript
export function useLocationWithAddress() {
  const { location, isLoading, error, refresh } = useCurrentLocation();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }).then((results) => {
      if (results.length > 0) {
        setAddress(formatCityState(results[0]));
      }
    });
  }, [location]);

  return { location, address, isLoading, error, refresh };
}

// Usage
function Header() {
  const { address, isLoading } = useLocationWithAddress();

  return (
    <View className="flex-row items-center gap-1">
      <MapPin size={14} className="text-primary" />
      <Text className="text-sm text-foreground-secondary">
        {isLoading ? "Locating..." : address ?? "Unknown location"}
      </Text>
    </View>
  );
}
```

---

## 6. Forward Geocoding (Address → Coordinates)

```typescript
async function getCoordinatesFromAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const results = await Location.geocodeAsync(address);

  if (results.length === 0) return null;

  return {
    latitude: results[0].latitude,
    longitude: results[0].longitude,
  };
}

// Usage: Search for a bookstore location
const coords = await getCoordinatesFromAddress("Barnes & Noble, Times Square, NY");
// { latitude: 40.7580, longitude: -73.9855 }
```

### Address Search Autocomplete

For production address search, use a service like Google Places API:

```typescript
import { useQuery } from "@tanstack/react-query";

function useAddressSearch(query: string) {
  return useQuery({
    queryKey: ["address-search", query],
    queryFn: async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_KEY}`
      );
      const data = await response.json();
      return data.predictions;
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
}
```

---

## 7. Displaying Maps

### react-native-maps (Most Popular)

```bash
npx expo install react-native-maps
```

```typescript
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";

function BookstoreMap() {
  const { location } = useCurrentLocation();
  const [region, setRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.01,    // Zoom level (smaller = more zoomed)
    longitudeDelta: 0.01,
  });

  // Center on user when location loads
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  return (
    <MapView
      className="flex-1"
      provider={PROVIDER_GOOGLE} // Use Google Maps (or remove for Apple Maps on iOS)
      region={region}
      onRegionChangeComplete={setRegion}
      showsUserLocation={true}         // Blue dot for user
      showsMyLocationButton={true}     // Button to center on user
      showsCompass={true}
      showsScale={true}
      mapType="standard"               // "standard", "satellite", "hybrid", "terrain"
    >
      {/* Markers */}
      <Marker
        coordinate={{ latitude: 40.7128, longitude: -74.006 }}
        title="BookStore"
        description="Open until 9 PM"
      />
    </MapView>
  );
}
```

### Google Maps Setup (Required for Android, Optional for iOS)

```json
// app.json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

---

## 8. Map Markers & Custom Pins

### Custom Marker Component

```typescript
import { Marker, Callout } from "react-native-maps";

interface BookstoreMarkerProps {
  bookstore: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    rating: number;
    isOpen: boolean;
  };
  onPress: (id: string) => void;
}

function BookstoreMarker({ bookstore, onPress }: BookstoreMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: bookstore.latitude,
        longitude: bookstore.longitude,
      }}
      onPress={() => onPress(bookstore.id)}
    >
      {/* Custom pin view */}
      <View className="items-center">
        <View
          className={`rounded-full p-2 ${
            bookstore.isOpen ? "bg-primary" : "bg-muted"
          }`}
        >
          <BookOpen
            size={16}
            color={bookstore.isOpen ? "white" : "#9CA3AF"}
          />
        </View>
        {/* Pin stem */}
        <View
          className={`h-2 w-0.5 ${
            bookstore.isOpen ? "bg-primary" : "bg-muted"
          }`}
        />
      </View>

      {/* Callout (info bubble on tap) */}
      <Callout>
        <View className="w-48 p-2">
          <Text className="font-semibold">{bookstore.name}</Text>
          <Text className="text-sm text-gray-500">
            {bookstore.isOpen ? "Open" : "Closed"} · {bookstore.rating} stars
          </Text>
        </View>
      </Callout>
    </Marker>
  );
}
```

### Marker Clustering (Many Markers)

For lots of markers (50+), use clustering to avoid visual clutter:

```bash
npx expo install react-native-map-clustering
```

```typescript
import MapView from "react-native-map-clustering";

function ClusteredMap({ bookstores }: { bookstores: Bookstore[] }) {
  return (
    <MapView
      className="flex-1"
      clusterColor="#007A5E"
      radius={50}              // Cluster markers within 50px
      minPoints={3}            // Minimum markers to form a cluster
    >
      {bookstores.map((store) => (
        <Marker
          key={store.id}
          coordinate={{
            latitude: store.latitude,
            longitude: store.longitude,
          }}
        />
      ))}
    </MapView>
  );
}
```

### Animated Map Camera

```typescript
import { useRef } from "react";
import MapView from "react-native-maps";

function AnimatedMap() {
  const mapRef = useRef<MapView>(null);

  const flyToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000 // Animation duration ms
    );
  };

  const fitToMarkers = (coordinates: { latitude: number; longitude: number }[]) => {
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  return <MapView ref={mapRef} className="flex-1" />;
}
```

---

## 9. Geofencing

Trigger actions when user enters/exits a geographic region.

```typescript
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const GEOFENCE_TASK = "geofence-task";

// Define the task that runs when geofence is triggered
TaskManager.defineTask(GEOFENCE_TASK, ({ data, error }) => {
  if (error) {
    console.error("Geofence error:", error.message);
    return;
  }

  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`Entered region: ${region.identifier}`);
    // Send notification: "You're near Barnes & Noble!"
    sendLocalNotification(
      `You're near ${region.identifier}!`,
      "Check out today's book recommendations"
    );
  }

  if (eventType === Location.GeofencingEventType.Exit) {
    console.log(`Left region: ${region.identifier}`);
  }
});

// Start geofencing
async function startGeofencing(
  bookstores: { id: string; name: string; lat: number; lng: number }[]
) {
  const { granted } = await Location.requestBackgroundPermissionsAsync();
  if (!granted) {
    Alert.alert(
      "Background Location Required",
      "Enable 'Always' location to get notified about nearby bookstores."
    );
    return;
  }

  const regions: Location.LocationRegion[] = bookstores.map((store) => ({
    identifier: store.name,
    latitude: store.lat,
    longitude: store.lng,
    radius: 200,              // 200 meter radius
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
}

// Stop geofencing
async function stopGeofencing() {
  const isRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (isRunning) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
}
```

---

## 10. Background Location Tracking

For apps that need continuous location updates (delivery, fitness):

```typescript
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const BG_LOCATION_TASK = "background-location-task";

// Define background task
TaskManager.defineTask(BG_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error("BG Location error:", error.message);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const latest = locations[locations.length - 1];

  console.log("Background location:", latest.coords);

  // Send to server, save locally, etc.
  // NOTE: You cannot update React state here (no UI access in background)
});

// Start background tracking
async function startBackgroundTracking() {
  const { granted: fgGranted } =
    await Location.requestForegroundPermissionsAsync();
  if (!fgGranted) return;

  const { granted: bgGranted } =
    await Location.requestBackgroundPermissionsAsync();
  if (!bgGranted) return;

  await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 50,       // Update every 50 meters
    timeInterval: 30000,        // Or every 30 seconds
    deferredUpdatesInterval: 60000, // Batch updates every 60s (saves battery)
    showsBackgroundLocationIndicator: true, // iOS blue bar
    foregroundService: {
      // Android: Required notification for foreground service
      notificationTitle: "QuickRead",
      notificationBody: "Tracking your location",
      notificationColor: "#007A5E",
    },
  });
}

// Stop background tracking
async function stopBackgroundTracking() {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(
    BG_LOCATION_TASK
  );
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK);
  }
}
```

---

## 11. Distance & Region Calculations

### Haversine Distance (Point to Point)

```typescript
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Format for display
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// Usage
const distance = getDistanceKm(40.7128, -74.006, 40.758, -73.9855);
console.log(formatDistance(distance)); // "5.2km"
```

### Sort Locations by Distance

```typescript
function sortByDistance(
  userLat: number,
  userLng: number,
  locations: Array<{ latitude: number; longitude: number; [key: string]: any }>
) {
  return locations
    .map((loc) => ({
      ...loc,
      distance: getDistanceKm(userLat, userLng, loc.latitude, loc.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Usage
const nearbyBookstores = sortByDistance(
  userLocation.coords.latitude,
  userLocation.coords.longitude,
  allBookstores
);
```

### Calculate Map Region from Points

```typescript
function getRegionForCoordinates(
  points: { latitude: number; longitude: number }[]
): Region {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const PADDING = 1.2; // 20% padding

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * PADDING || 0.01,
    longitudeDelta: (maxLng - minLng) * PADDING || 0.01,
  };
}
```

---

## 12. Performance & Battery

### Battery Optimization Rules

```
1. Use the LOWEST accuracy that meets your needs
   - Showing nearby stores? Accuracy.Balanced (100m) is fine
   - Turn-by-turn navigation? Accuracy.BestForNavigation

2. Stop watching when you don't need updates
   - Remove watchPositionAsync subscription when screen unmounts
   - Stop background tracking when user disables the feature

3. Use distanceInterval to reduce update frequency
   - distanceInterval: 50 means updates only every 50 meters of movement
   - Fewer updates = less battery drain

4. Batch background updates
   - deferredUpdatesInterval: 60000 batches location updates
   - Instead of waking the app every 10s, batches updates every 60s

5. Use significant location changes for monitoring
   - ~500m displacement triggers an update
   - Very battery-efficient for background monitoring
```

### Debounce Map Region Changes

```typescript
// Don't fire API calls on every map pan
import { useCallback, useRef } from "react";

function useMapRegionSearch() {
  const timerRef = useRef<NodeJS.Timeout>();

  const onRegionChange = useCallback((region: Region) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Fetch bookstores in this region
      fetchBookstoresInRegion(region);
    }, 500); // Wait 500ms after user stops panning
  }, []);

  return { onRegionChange };
}
```

---

## 13. Platform Differences

### iOS

```
- Apple Maps by default (can use Google Maps with API key)
- "Allow Once" permission option (temporary, per-session)
- "While Using the App" requires visible indicator (blue bar for background)
- "Always" requires strong justification for App Store review
- Location accuracy reduction option in iOS 14+ (user can give approximate location)
- Check Location.Accuracy.Reduced to detect approximate-only permission
```

### Android

```
- Google Maps by default (requires API key)
- "Allow only while using the app" / "Allow all the time" / "Ask every time"
- Background location requires separate permission request (Android 10+)
- Foreground service notification required for background tracking (Android 8+)
- Some OEMs aggressively kill background tasks (Xiaomi, Huawei, Samsung)
  → Use foreground services and educate users about battery optimization settings
- "Precise" vs "Approximate" location toggle (Android 12+)
```

### Handling Approximate Location (iOS 14+ / Android 12+)

```typescript
// User might grant only approximate location (~5km accuracy)
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Balanced,
});

if (location.coords.accuracy && location.coords.accuracy > 1000) {
  // User gave approximate location
  // Adjust your UX: show wider search area, don't show exact distance
  console.log("Approximate location - accuracy:", location.coords.accuracy, "m");
}

// Request full accuracy (iOS)
// This will show a system prompt asking for precise location
const { granted } = await Location.requestForegroundPermissionsAsync();
// On iOS 14+, even if granted, accuracy may be "reduced"
// Check Location.getProviderStatusAsync() for details
```

---

## 14. Privacy & App Store Compliance

### Apple App Store Requirements

```
1. MUST explain WHY you need location in your permission string
   BAD:  "This app uses your location"
   GOOD: "QuickRead uses your location to find bookstores and reading events near you"

2. "Always" location requires:
   - Obvious user-facing feature that needs it
   - NSLocationAlwaysAndWhenInUseUsageDescription in Info.plist
   - You WILL be asked to justify during App Review
   - Common rejections: no clear reason for background location

3. Privacy Nutrition Labels:
   - Declare location usage in App Store Connect
   - Specify: Precise Location, Coarse Location
   - Specify: Linked to user? Used for tracking?

4. App Tracking Transparency:
   - If you use location for advertising, ATT permission required
```

### Google Play Requirements

```
1. Background location requires:
   - Prominent disclosure (full-screen notice before requesting)
   - Declaration in Play Console
   - Review and approval by Google (can take weeks)

2. Play Store Data Safety:
   - Declare location collection
   - Explain purpose
   - Declare if shared with third parties
```

### Privacy Best Practices

```
- Request location only when the user triggers a feature that needs it
  (not on app launch)
- Don't collect more location data than you need
- Don't store location history on your server unless necessary
- Use approximate location when precise isn't needed
- Let users disable location features
- Clear stored location data on logout
```

---

## 15. Production Checklist

```
Permissions:
  [ ] Permission strings are descriptive and specific
  [ ] Foreground permission requested before background
  [ ] Graceful handling when permission denied
  [ ] "Open Settings" option when permission permanently denied
  [ ] Handle "Approximate location only" scenario

Accuracy:
  [ ] Using appropriate accuracy level for each feature
  [ ] Handle GPS timeout (set a reasonable timeout)
  [ ] Handle "location services disabled" scenario
  [ ] Show accuracy indicator to user when relevant

Maps:
  [ ] Maps work on both iOS and Android
  [ ] Google Maps API key configured for Android
  [ ] Custom markers render correctly on both platforms
  [ ] Map doesn't lag with many markers (use clustering)
  [ ] Callouts/info windows work on both platforms

Performance:
  [ ] Location watching stops when screen unmounts
  [ ] Background tracking stops when user disables feature
  [ ] Map region changes debounced for API calls
  [ ] Appropriate distanceInterval to avoid excessive updates

Privacy:
  [ ] Location only requested when feature needs it
  [ ] Location data not stored longer than necessary
  [ ] Background location has clear user-facing justification
  [ ] Privacy nutrition labels / data safety declarations updated

Platform:
  [ ] Tested on real iOS device
  [ ] Tested on real Android device
  [ ] Handles approximate-only location gracefully
  [ ] Android foreground service notification configured
  [ ] Works after location permission changes in Settings
```
