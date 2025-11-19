/** @type {import('tailwindcss').Config} */
const { hairlineWidth } = require("nativewind/theme");

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF", // App background
        primary: {
          DEFAULT: "#F97316", // The main orange from your buttons
          foreground: "#FFFFFF", // Text on primary buttons
        },
        card: "#EFF6FF", // A slightly off-white for card backgrounds
        foreground: "#0F172A", // Primary text color (dark slate)
        muted: {
          DEFAULT: "#F1F5F9", // Muted backgrounds, like input fields
          foreground: "#64748B", // Muted text (placeholders, descriptions)
        },
        border: "#E2E8F0", // Borders for inputs and dividers
        destructive: "#EF4444", // For errors or negative values
        success: "#22C55E", // For success states or positive values
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },ns: [],
}



// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

