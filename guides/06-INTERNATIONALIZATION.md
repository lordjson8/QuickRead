# Internationalization (i18n) in React Native / Expo

> From hardcoded English to supporting 50+ languages, RTL layouts, and locale-aware formatting.

---

## Table of Contents

1. [Why i18n Matters for Mobile](#1-why-i18n-matters-for-mobile)
2. [Core Concepts](#2-core-concepts)
3. [Setup: i18next + react-i18next](#3-setup-i18next--react-i18next)
4. [Basic Translation](#4-basic-translation)
5. [Interpolation & Dynamic Values](#5-interpolation--dynamic-values)
6. [Pluralization](#6-pluralization)
7. [Nested & Namespaced Translations](#7-nested--namespaced-translations)
8. [Date, Time & Number Formatting](#8-date-time--number-formatting)
9. [Right-to-Left (RTL) Support](#9-right-to-left-rtl-support)
10. [Language Switcher](#10-language-switcher)
11. [Persisting Language Choice](#11-persisting-language-choice)
12. [Translation File Management](#12-translation-file-management)
13. [Advanced: Dynamic Loading & Code Splitting](#13-advanced-dynamic-loading--code-splitting)
14. [Advanced: Context-Aware Translations](#14-advanced-context-aware-translations)
15. [Images, Assets & Non-Text Content](#15-images-assets--non-text-content)
16. [Testing i18n](#16-testing-i18n)
17. [Production Workflow](#17-production-workflow)
18. [Production Checklist](#18-production-checklist)

---

## 1. Why i18n Matters for Mobile

### The Numbers

```
English-only apps miss:
  - 75% of the world's population
  - 50%+ of App Store/Play Store users
  - Major markets: China, India, Brazil, Japan, Germany, France, Middle East

Adding just 5 languages typically covers 80% of your potential users:
  English, Spanish, Chinese, Hindi, Arabic
```

### What i18n Covers

```
Translation (i18n):      "Hello" → "Hola" / "مرحبا" / "你好"
Localization (l10n):     Dates, numbers, currency, units
Layout (RTL):            Right-to-left for Arabic, Hebrew, Urdu, Persian
Cultural Adaptation:     Colors, images, idioms, legal requirements
```

---

## 2. Core Concepts

### Translation Keys

Never use the actual text as the key. Use semantic keys:

```typescript
// BAD - fragile, breaks if English text changes
t("Welcome to QuickRead")

// GOOD - semantic, stable
t("onboarding.welcome.title")

// GOOD - component-scoped
t("bookCard.readTime", { minutes: 15 })
```

### Translation File Structure

```
locales/
  en/
    common.json       # Shared strings (buttons, labels, errors)
    auth.json          # Authentication screens
    onboarding.json    # Onboarding screens
    books.json         # Book-related content
    settings.json      # Settings screen
  es/
    common.json
    auth.json
    ...
  ar/
    common.json
    auth.json
    ...
```

---

## 3. Setup: i18next + react-i18next

### Install

```bash
npx expo install i18next react-i18next expo-localization
```

You already have `expo-localization` via `expo-location` (different package but same pattern).

### Configure i18next

```typescript
// lib/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

// Import translation files
import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enOnboarding from "@/locales/en/onboarding.json";
import enBooks from "@/locales/en/books.json";
import enSettings from "@/locales/en/settings.json";

import esCommon from "@/locales/es/common.json";
import esAuth from "@/locales/es/auth.json";
import esOnboarding from "@/locales/es/onboarding.json";
import esBooks from "@/locales/es/books.json";
import esSettings from "@/locales/es/settings.json";

import arCommon from "@/locales/ar/common.json";
import arAuth from "@/locales/ar/auth.json";
import arOnboarding from "@/locales/ar/onboarding.json";
import arBooks from "@/locales/ar/books.json";
import arSettings from "@/locales/ar/settings.json";

// Detect device language
const deviceLanguage = getLocales()[0]?.languageCode ?? "en";

export const supportedLanguages = {
  en: { name: "English", nativeName: "English", rtl: false },
  es: { name: "Spanish", nativeName: "Español", rtl: false },
  ar: { name: "Arabic", nativeName: "العربية", rtl: true },
  fr: { name: "French", nativeName: "Français", rtl: false },
  de: { name: "German", nativeName: "Deutsch", rtl: false },
  zh: { name: "Chinese", nativeName: "中文", rtl: false },
  hi: { name: "Hindi", nativeName: "हिन्दी", rtl: false },
  ja: { name: "Japanese", nativeName: "日本語", rtl: false },
  pt: { name: "Portuguese", nativeName: "Português", rtl: false },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      onboarding: enOnboarding,
      books: enBooks,
      settings: enSettings,
    },
    es: {
      common: esCommon,
      auth: esAuth,
      onboarding: esOnboarding,
      books: esBooks,
      settings: esSettings,
    },
    ar: {
      common: arCommon,
      auth: arAuth,
      onboarding: arOnboarding,
      books: arBooks,
      settings: arSettings,
    },
  },

  lng: deviceLanguage, // Use device language
  fallbackLng: "en",  // Fall back to English if translation missing
  defaultNS: "common", // Default namespace

  interpolation: {
    escapeValue: false, // React already handles XSS
  },

  // React-specific
  react: {
    useSuspense: false, // Don't use Suspense (causes issues in RN)
  },

  // Missing key handling (development)
  saveMissing: __DEV__,
  missingKeyHandler: __DEV__
    ? (lngs, ns, key) => {
        console.warn(`Missing translation: [${ns}] ${key}`);
      }
    : undefined,
});

export default i18n;
```

### Wire Into Your App

```typescript
// app/_layout.tsx
import "@/lib/i18n"; // Import once at the top - initializes i18next

export default function RootLayout() {
  return (
    // No provider needed! react-i18next uses i18next instance directly
    <Stack />
  );
}
```

---

## 4. Basic Translation

### Translation Files

```json
// locales/en/common.json
{
  "buttons": {
    "continue": "Continue",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "retry": "Try Again",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "network": "No internet connection. Check your network.",
    "timeout": "Request timed out. Please try again.",
    "notFound": "Not found."
  },
  "labels": {
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "search": "Search"
  }
}
```

```json
// locales/es/common.json
{
  "buttons": {
    "continue": "Continuar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "delete": "Eliminar",
    "retry": "Intentar de nuevo",
    "signIn": "Iniciar sesión",
    "signUp": "Registrarse",
    "signOut": "Cerrar sesión"
  },
  "errors": {
    "generic": "Algo salió mal. Por favor, inténtalo de nuevo.",
    "network": "Sin conexión a internet. Verifica tu red.",
    "timeout": "La solicitud ha expirado. Inténtalo de nuevo.",
    "notFound": "No encontrado."
  },
  "labels": {
    "email": "Correo electrónico",
    "password": "Contraseña",
    "name": "Nombre",
    "search": "Buscar"
  }
}
```

```json
// locales/ar/common.json
{
  "buttons": {
    "continue": "متابعة",
    "cancel": "إلغاء",
    "save": "حفظ",
    "delete": "حذف",
    "retry": "حاول مرة أخرى",
    "signIn": "تسجيل الدخول",
    "signUp": "إنشاء حساب",
    "signOut": "تسجيل الخروج"
  },
  "errors": {
    "generic": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    "network": "لا يوجد اتصال بالإنترنت. تحقق من شبكتك.",
    "timeout": "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
    "notFound": "غير موجود."
  },
  "labels": {
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "name": "الاسم",
    "search": "بحث"
  }
}
```

### Using Translations in Components

```typescript
import { useTranslation } from "react-i18next";

function LoginScreen() {
  // Default namespace is "common"
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background p-6">
      <Text className="text-lg font-medium text-foreground">
        {t("labels.email")}
      </Text>
      <TextInput
        placeholder={t("labels.email")}
        className="rounded-lg border border-border bg-surface px-4 py-3"
      />

      <Text className="mt-4 text-lg font-medium text-foreground">
        {t("labels.password")}
      </Text>
      <TextInput
        placeholder={t("labels.password")}
        secureTextEntry
        className="rounded-lg border border-border bg-surface px-4 py-3"
      />

      <Pressable className="mt-6 rounded-lg bg-primary py-3">
        <Text className="text-center font-semibold text-primary-foreground">
          {t("buttons.signIn")}
        </Text>
      </Pressable>
    </View>
  );
}
```

### Using a Specific Namespace

```typescript
function OnboardingScreen() {
  // Use the "onboarding" namespace
  const { t } = useTranslation("onboarding");

  return (
    <View>
      <Text>{t("welcome.title")}</Text>
      <Text>{t("welcome.subtitle")}</Text>
    </View>
  );
}

// Or access multiple namespaces
function BookScreen() {
  const { t } = useTranslation(["books", "common"]);

  return (
    <View>
      <Text>{t("books:detail.title")}</Text>
      <Pressable>
        <Text>{t("common:buttons.save")}</Text>
      </Pressable>
    </View>
  );
}
```

---

## 5. Interpolation & Dynamic Values

### Variables in Translations

```json
// locales/en/books.json
{
  "readTime": "{{minutes}} min read",
  "byAuthor": "by {{author}}",
  "greeting": "Hello, {{name}}!",
  "progress": "{{percent}}% complete"
}
```

```json
// locales/es/books.json
{
  "readTime": "{{minutes}} min de lectura",
  "byAuthor": "por {{author}}",
  "greeting": "¡Hola, {{name}}!",
  "progress": "{{percent}}% completado"
}
```

```typescript
const { t } = useTranslation("books");

t("readTime", { minutes: 15 });       // "15 min read"
t("byAuthor", { author: "James Clear" }); // "by James Clear"
t("greeting", { name: user.firstName }); // "Hello, John!"
t("progress", { percent: 75 });       // "75% complete"
```

### Formatted Values

```json
// locales/en/books.json
{
  "rating": "{{rating, number}} out of 5",
  "price": "{{price, currency}}"
}
```

```typescript
// Custom formatters
i18n.services.formatter?.add("currency", (value, lng) => {
  return new Intl.NumberFormat(lng, {
    style: "currency",
    currency: "USD",
  }).format(value);
});

t("price", { price: 9.99 }); // "$9.99" in en, "9,99 $" in fr
```

---

## 6. Pluralization

Different languages have different plural rules. Arabic has 6 plural forms. English has 2.

### English (2 Forms)

```json
// locales/en/books.json
{
  "bookCount_one": "{{count}} book",
  "bookCount_other": "{{count}} books",
  "chapterCount_one": "{{count}} chapter",
  "chapterCount_other": "{{count}} chapters",
  "minutesLeft_one": "{{count}} minute left",
  "minutesLeft_other": "{{count}} minutes left"
}
```

### Arabic (6 Forms)

```json
// locales/ar/books.json
{
  "bookCount_zero": "لا كتب",
  "bookCount_one": "كتاب واحد",
  "bookCount_two": "كتابان",
  "bookCount_few": "{{count}} كتب",
  "bookCount_many": "{{count}} كتاباً",
  "bookCount_other": "{{count}} كتاب"
}
```

### Spanish (2 Forms)

```json
// locales/es/books.json
{
  "bookCount_one": "{{count}} libro",
  "bookCount_other": "{{count}} libros"
}
```

### Usage

```typescript
const { t } = useTranslation("books");

t("bookCount", { count: 0 });  // "0 books" / "لا كتب" / "0 libros"
t("bookCount", { count: 1 });  // "1 book" / "كتاب واحد" / "1 libro"
t("bookCount", { count: 2 });  // "2 books" / "كتابان" / "2 libros"
t("bookCount", { count: 5 });  // "5 books" / "5 كتب" / "5 libros"
t("bookCount", { count: 100 }); // "100 books" / "100 كتاب" / "100 libros"
```

i18next automatically picks the correct plural form based on the current language and count.

---

## 7. Nested & Namespaced Translations

### Deep Nesting

```json
// locales/en/onboarding.json
{
  "steps": {
    "welcome": {
      "title": "Big Ideas in 15 Minutes",
      "subtitle": "Discover key insights from bestselling books",
      "cta": "Get Started"
    },
    "interests": {
      "title": "What do you love reading?",
      "subtitle": "Pick topics that interest you",
      "categories": {
        "selfHelp": "Self Help",
        "business": "Business",
        "science": "Science",
        "fiction": "Fiction",
        "history": "History",
        "psychology": "Psychology"
      }
    },
    "notifications": {
      "title": "Stay in the loop",
      "subtitle": "Get daily reading reminders",
      "allow": "Allow Notifications",
      "skip": "Maybe Later"
    }
  }
}
```

```typescript
const { t } = useTranslation("onboarding");

t("steps.welcome.title");    // "Big Ideas in 15 Minutes"
t("steps.interests.categories.selfHelp"); // "Self Help"
```

### Returning Objects

```typescript
// Get all categories as an object
const categories = t("steps.interests.categories", {
  returnObjects: true,
});
// { selfHelp: "Self Help", business: "Business", ... }

// Useful for rendering lists
Object.entries(categories).map(([key, label]) => (
  <Chip key={key} label={label as string} />
));
```

---

## 8. Date, Time & Number Formatting

### Intl API (Built into React Native with Hermes)

```typescript
// hooks/useFormatter.ts
import { useTranslation } from "react-i18next";

export function useFormatter() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: locale === "en", // 12h for English, 24h for most others
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffMinutes < 1) return rtf.format(0, "minute"); // "just now" / "ahora"
    if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
    if (diffHours < 24) return rtf.format(-diffHours, "hour");
    if (diffDays < 30) return rtf.format(-diffDays, "day");
    return formatDate(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatCompactNumber = (num: number) => {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  };

  return {
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatCompactNumber,
  };
}
```

### Usage

```typescript
function BookCard({ book }: { book: Book }) {
  const { formatRelativeTime, formatCompactNumber } = useFormatter();

  return (
    <View>
      <Text>{book.title}</Text>
      <Text>
        {formatCompactNumber(book.readers)} readers
        {/* English: "15K readers" */}
        {/* German: "15.000 readers" */}
      </Text>
      <Text>
        Added {formatRelativeTime(new Date(book.createdAt))}
        {/* English: "3 days ago" */}
        {/* Spanish: "hace 3 días" */}
        {/* Arabic: "منذ 3 أيام" */}
      </Text>
    </View>
  );
}
```

### Locale-Specific Examples

```
Number 1234567.89:
  English (en):     1,234,567.89
  German (de):      1.234.567,89
  French (fr):      1 234 567,89
  Arabic (ar):      ١٬٢٣٤٬٥٦٧٫٨٩
  Hindi (hi):       12,34,567.89 (Indian grouping!)

Date "January 15, 2025":
  English (en):     January 15, 2025
  German (de):      15. Januar 2025
  French (fr):      15 janvier 2025
  Japanese (ja):    2025年1月15日
  Arabic (ar):      ١٥ يناير ٢٠٢٥

Currency $9.99:
  English (en):     $9.99
  German (de):      9,99 $
  Japanese (ja):    $9.99
  Arabic (ar):      ٩٫٩٩ US$
```

---

## 9. Right-to-Left (RTL) Support

This is what separates juniors from seniors. RTL is hard and most devs skip it.

### Enabling RTL

```typescript
// lib/i18n/index.ts
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export async function setLanguage(languageCode: SupportedLanguage) {
  const isRTL = supportedLanguages[languageCode].rtl;

  // Change i18next language
  await i18n.changeLanguage(languageCode);

  // Update RTL layout direction
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);

    // RTL change requires app restart
    if (!__DEV__) {
      await Updates.reloadAsync();
    } else {
      Alert.alert(
        "Restart Required",
        "Please restart the app to apply the layout direction change."
      );
    }
  }
}
```

### RTL Layout Gotchas

```typescript
// PROBLEM: Flexbox row direction flips in RTL
// LTR: [Icon] [Text] [Arrow>]
// RTL: [<Arrow] [Text] [Icon]

// This is CORRECT behavior! flexDirection: "row" auto-flips in RTL.
// BUT some things DON'T auto-flip:

// 1. Absolute positioning
// BAD - doesn't flip
<View style={{ position: "absolute", left: 16 }} />
// GOOD - use start/end instead
<View style={{ position: "absolute", start: 16 }} />

// 2. Margins and padding
// BAD
<View style={{ marginLeft: 8 }} />
// GOOD
<View style={{ marginStart: 8 }} />

// 3. Icons that imply direction
// BAD - arrow always points right
<ChevronRight />
// GOOD - flip in RTL
<ChevronRight style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} />

// 4. Text alignment
// BAD
<Text style={{ textAlign: "left" }} />
// GOOD - auto-aligns based on language direction
<Text style={{ textAlign: I18nManager.isRTL ? "right" : "left" }} />
// Or just don't set textAlign - default behavior is correct

// 5. NativeWind RTL support
// NativeWind supports RTL prefixes:
<View className="rtl:flex-row-reverse" />
<View className="rtl:mr-0 rtl:ml-4 ltr:ml-0 ltr:mr-4" />
// Or use logical properties:
<View className="ms-4" />  // margin-start (left in LTR, right in RTL)
<View className="me-4" />  // margin-end
<View className="ps-4" />  // padding-start
<View className="pe-4" />  // padding-end
```

### RTL-Aware Component

```typescript
function ListItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3"
      // flex-row auto-flips in RTL
    >
      {icon}
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-foreground-secondary">{subtitle}</Text>
        )}
      </View>
      <ChevronRight
        size={20}
        color="#9CA3AF"
        // Flip arrow direction in RTL
        style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}
      />
    </Pressable>
  );
}
```

### Testing RTL

```typescript
// In development, force RTL to test:
import { I18nManager } from "react-native";

// Add a debug toggle
if (__DEV__) {
  // Toggle with a dev menu option
  I18nManager.forceRTL(true);
  // Then reload the app
}
```

---

## 10. Language Switcher

### Full Language Picker Screen

```typescript
function LanguageSettings() {
  const { i18n, t } = useTranslation("settings");
  const currentLang = i18n.language as SupportedLanguage;

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    // Persist choice
    usePreferencesStore.getState().setLanguage(lang);
  };

  return (
    <View className="flex-1 bg-background">
      <Text className="px-4 py-3 text-sm font-medium uppercase text-foreground-secondary">
        {t("language.title")}
      </Text>

      {Object.entries(supportedLanguages).map(([code, lang]) => (
        <Pressable
          key={code}
          onPress={() => handleLanguageChange(code as SupportedLanguage)}
          className="flex-row items-center justify-between border-b border-border px-4 py-4"
        >
          <View>
            <Text className="text-base font-medium text-foreground">
              {lang.nativeName}
            </Text>
            <Text className="text-sm text-foreground-secondary">
              {lang.name}
            </Text>
          </View>

          {currentLang === code && (
            <Check size={20} className="text-primary" />
          )}
        </Pressable>
      ))}
    </View>
  );
}
```

### Inline Language Selector (Compact)

```typescript
function LanguageChip() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="flex-row items-center gap-1 rounded-full bg-surface-variant px-3 py-1.5"
      >
        <Globe size={14} className="text-foreground-secondary" />
        <Text className="text-sm font-medium text-foreground">
          {supportedLanguages[currentLang]?.nativeName}
        </Text>
      </Pressable>

      {/* Bottom sheet picker */}
      {showPicker && (
        <BottomSheet onDismiss={() => setShowPicker(false)}>
          {Object.entries(supportedLanguages).map(([code, lang]) => (
            <Pressable
              key={code}
              onPress={() => {
                setLanguage(code as SupportedLanguage);
                setShowPicker(false);
              }}
              className="px-4 py-3"
            >
              <Text className="text-base text-foreground">
                {lang.nativeName} ({lang.name})
              </Text>
            </Pressable>
          ))}
        </BottomSheet>
      )}
    </>
  );
}
```

---

## 11. Persisting Language Choice

```typescript
// store/preferences.store.ts
interface PreferencesStore {
  language: SupportedLanguage | "system";
  setLanguage: (lang: SupportedLanguage | "system") => void;
}

// On app startup, restore language
// app/_layout.tsx
useEffect(() => {
  const savedLanguage = usePreferencesStore.getState().language;

  if (savedLanguage && savedLanguage !== "system") {
    i18n.changeLanguage(savedLanguage);
  }
  // If "system", the default detection in i18n config handles it
}, []);
```

---

## 12. Translation File Management

### Type-Safe Translation Keys

```typescript
// types/i18n.d.ts
import "i18next";
import type common from "@/locales/en/common.json";
import type auth from "@/locales/en/auth.json";
import type books from "@/locales/en/books.json";
import type onboarding from "@/locales/en/onboarding.json";
import type settings from "@/locales/en/settings.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      auth: typeof auth;
      books: typeof books;
      onboarding: typeof onboarding;
      settings: typeof settings;
    };
  }
}
```

Now TypeScript will autocomplete translation keys and catch typos:

```typescript
const { t } = useTranslation("books");
t("readTime");       // Autocompletes
t("nonExistent");    // TypeScript error
```

### Organizing Large Translation Files

```
Rule of thumb:
  - One namespace per major feature/screen group
  - Keep common strings (buttons, errors, labels) in "common"
  - If a namespace file > 200 keys, split it
  - Never duplicate keys across namespaces
```

### Translation Key Conventions

```json
{
  "screenName.section.element": "Text",
  "bookDetail.header.title": "Book Details",
  "bookDetail.header.subtitle": "by {{author}}",
  "bookDetail.actions.bookmark": "Bookmark",
  "bookDetail.actions.share": "Share",
  "bookDetail.tabs.summary": "Summary",
  "bookDetail.tabs.chapters": "Chapters",
  "bookDetail.tabs.reviews": "Reviews",
  "bookDetail.empty.noReviews": "No reviews yet",
  "bookDetail.error.loadFailed": "Failed to load book details"
}
```

---

## 13. Advanced: Dynamic Loading & Code Splitting

For apps with many languages, don't bundle all translations:

```typescript
// lib/i18n/loader.ts
import i18n from "i18next";

const loadedLanguages = new Set<string>(["en"]); // English bundled by default

export async function loadLanguage(lang: SupportedLanguage) {
  if (loadedLanguages.has(lang)) return;

  try {
    // Fetch translations from your API
    const response = await fetch(
      `https://api.quickread.app/translations/${lang}`
    );
    const translations = await response.json();

    // Add to i18next
    Object.entries(translations).forEach(([namespace, resources]) => {
      i18n.addResourceBundle(lang, namespace, resources, true, true);
    });

    loadedLanguages.add(lang);
  } catch (error) {
    console.error(`Failed to load ${lang} translations:`, error);
    // Fall back to English (already loaded)
  }
}

// Usage
async function changeLanguage(lang: SupportedLanguage) {
  await loadLanguage(lang); // Load if needed
  await i18n.changeLanguage(lang);
}
```

### OTA Translation Updates

```typescript
// Update translations without app store update
async function checkTranslationUpdates() {
  const currentVersion = await AsyncStorage.getItem("translation_version");

  const { data } = await api.get("/translations/version");

  if (data.version !== currentVersion) {
    // Download new translations
    const { data: translations } = await api.get(
      `/translations/${i18n.language}`
    );

    // Update i18next resources
    Object.entries(translations).forEach(([ns, resources]) => {
      i18n.addResourceBundle(i18n.language, ns, resources, true, true);
    });

    await AsyncStorage.setItem("translation_version", data.version);
  }
}
```

---

## 14. Advanced: Context-Aware Translations

### Gender-Aware Translations

```json
// locales/en/common.json
{
  "greeting_male": "Welcome back, {{name}}!",
  "greeting_female": "Welcome back, {{name}}!",
  "greeting_other": "Welcome back, {{name}}!"
}

// locales/de/common.json (German has gendered greetings)
{
  "greeting_male": "Willkommen zurück, Herr {{name}}!",
  "greeting_female": "Willkommen zurück, Frau {{name}}!",
  "greeting_other": "Willkommen zurück, {{name}}!"
}

// locales/ar/common.json (Arabic has strong gender differences)
{
  "greeting_male": "!مرحبًا بعودتك يا {{name}}",
  "greeting_female": "!مرحبًا بعودتِك يا {{name}}",
  "greeting_other": "!مرحبًا بعودتكم يا {{name}}"
}
```

```typescript
t("greeting", { context: user.gender, name: user.name });
// German male: "Willkommen zurück, Herr Schmidt!"
// German female: "Willkommen zurück, Frau Schmidt!"
```

### Ordinal Numbers

```json
// locales/en/books.json
{
  "chapterOrdinal_one": "{{count}}st chapter",
  "chapterOrdinal_two": "{{count}}nd chapter",
  "chapterOrdinal_few": "{{count}}rd chapter",
  "chapterOrdinal_other": "{{count}}th chapter"
}
```

```typescript
t("chapterOrdinal", { count: 1, ordinal: true }); // "1st chapter"
t("chapterOrdinal", { count: 2, ordinal: true }); // "2nd chapter"
t("chapterOrdinal", { count: 3, ordinal: true }); // "3rd chapter"
t("chapterOrdinal", { count: 4, ordinal: true }); // "4th chapter"
```

---

## 15. Images, Assets & Non-Text Content

### Locale-Specific Images

```typescript
// Some images contain text or culturally specific content
const onboardingImages = {
  en: require("@/assets/images/onboarding-en.png"),
  es: require("@/assets/images/onboarding-es.png"),
  ar: require("@/assets/images/onboarding-ar.png"),
};

function OnboardingImage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as keyof typeof onboardingImages;
  const source = onboardingImages[lang] ?? onboardingImages.en;

  return <Image source={source} className="h-64 w-full" contentFit="contain" />;
}
```

### Locale-Specific App Store Content

```
For each language you support, prepare:
  - App Store screenshots with translated UI
  - App description in each language
  - "What's New" release notes
  - Keywords for ASO (App Store Optimization)
```

---

## 16. Testing i18n

### Unit Testing Translations

```typescript
// __tests__/i18n.test.ts
import enCommon from "@/locales/en/common.json";
import esCommon from "@/locales/es/common.json";
import arCommon from "@/locales/ar/common.json";

function getAllKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return getAllKeys(value as object, fullKey);
    }
    return [fullKey];
  });
}

describe("Translations", () => {
  const enKeys = getAllKeys(enCommon);

  test("Spanish has all English keys", () => {
    const esKeys = getAllKeys(esCommon);
    const missing = enKeys.filter((k) => !esKeys.includes(k));
    expect(missing).toEqual([]);
  });

  test("Arabic has all English keys", () => {
    const arKeys = getAllKeys(arCommon);
    const missing = enKeys.filter((k) => !arKeys.includes(k));
    expect(missing).toEqual([]);
  });

  test("No empty translations", () => {
    const checkEmpty = (obj: object, lang: string, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string") {
          expect(value.trim()).not.toBe("");
        } else if (typeof value === "object" && value !== null) {
          checkEmpty(value as object, lang, fullKey);
        }
      });
    };

    checkEmpty(enCommon, "en");
    checkEmpty(esCommon, "es");
    checkEmpty(arCommon, "ar");
  });
});
```

### Visual Testing

```
1. Run app in each language and screenshot every screen
2. Check for:
   - Text truncation (German and Finnish words are long!)
   - Layout breaks
   - RTL alignment issues
   - Correct date/number formatting
   - All strings translated (no English leaking through)
```

---

## 17. Production Workflow

### Translation Management Tools

```
For professional translation:

1. Crowdin, Lokalise, or Phrase
   - Upload your JSON files
   - Translators work in a web UI
   - Download translated files
   - Supports pluralization, context, glossaries

2. Workflow:
   Developer adds English key → CI uploads to tool → Translator translates →
   CI downloads translations → PR created → Merge

3. For indie/startup:
   - Start with Google Translate + manual review
   - Hire native speakers for key languages
   - Use ChatGPT/Claude for first pass, then native speaker review
```

### Adding a New Language Checklist

```
[ ] Create locale folder with all namespace files
[ ] Translate all keys (use translation tool)
[ ] Add to supportedLanguages config
[ ] Import and register in i18n config
[ ] Add RTL flag if applicable
[ ] Test all screens in the new language
[ ] Check for text overflow (some languages are much longer than English)
[ ] Test number/date/currency formatting
[ ] Prepare App Store listing in the language
[ ] Have a native speaker review all translations
```

---

## 18. Production Checklist

```
Setup:
  [ ] i18next configured with react-i18next
  [ ] Device language detected automatically
  [ ] Fallback to English for missing translations
  [ ] TypeScript types for translation keys

Translations:
  [ ] All user-facing strings externalized (no hardcoded text)
  [ ] Pluralization handled for all languages
  [ ] Dynamic values use interpolation (not string concatenation)
  [ ] Error messages translated
  [ ] Notification text translated
  [ ] Push notification text translated (server-side)

RTL:
  [ ] RTL layout works for Arabic/Hebrew/Urdu
  [ ] Directional icons flip correctly
  [ ] Start/end used instead of left/right
  [ ] Text alignment correct in RTL
  [ ] App restarts cleanly when switching to/from RTL

Formatting:
  [ ] Dates formatted per locale
  [ ] Numbers formatted per locale
  [ ] Currency formatted per locale
  [ ] Relative time ("3 days ago") localized

UX:
  [ ] Language picker in settings
  [ ] Language preference persisted
  [ ] "System" language option available
  [ ] Smooth language switching (minimal flicker)

Quality:
  [ ] All languages have complete translations
  [ ] No text truncation in any language
  [ ] Native speaker reviewed translations
  [ ] Automated tests for missing keys
  [ ] App Store listings in each language
```
