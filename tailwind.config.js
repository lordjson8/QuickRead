/** @type {import('tailwindcss').Config} */
const { hairlineWidth } = require("nativewind/theme");

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        background: "#F9F9F9", // App background
        foreground: "#212121", // Primary text color (dark slate)
        accent: {
          DEFAULT: "#FFC107$", // The main color from your buttons
          foreground: "#004D3B", // Text on primary buttons
        },
        primary: {
          DEFAULT: "#007A5E", // The main color from your buttons and links
          foreground: "#FFFFFF", // Text on primary buttons and links
        },
        secondary: {
          DEFAULT: "#E8F0ED", // The main color from your buttons
          foreground: "#004D3B", // Text on primary buttons
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121", // Text on primary buttons
        }, // A slightly off-white for card backgrounds
        muted: {
          DEFAULT: "#F1F5F9", // Muted backgrounds, like input fields
          foreground: "#64748B", // Muted text (placeholders, descriptions)
        },
        border: "#E5E7EB", // Borders for inputs and dividers
        input: "#FFFFFF",
        destructive: "#EF4444", // For errors or negative values
        success: "#22C55E", // For success states or positive values
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  ns: [],
};

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
