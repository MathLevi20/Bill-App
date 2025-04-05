module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        "light-gray": "#f5f5f5",
        "white": "#ffffff",
        // Primary green colors
        "primary": "#15803d", // Green-700
        "primary-dark": "#166534", // Green-800
        "primary-light": "#22c55e", // Green-500
        // Hover colors - new addition
        "primary-hover": "#14532d", // Darker green for hover
        "primary-light-hover": "#16a34a", // Medium green for hover
        // Accent and status colors
        "accent": "#10b981", // Changed from white to emerald-500
        "accent-hover": "#059669", // Emerald-600 for hover
        "error-red": "#ef4444",
        "warning-yellow": "#f59e0b",
        // Additional hover states for feedback
        "secondary": "#f3f4f6", // Gray-100 
        "secondary-hover": "#e5e7eb", // Gray-200
      },
    },
  },
  plugins: [],
};
