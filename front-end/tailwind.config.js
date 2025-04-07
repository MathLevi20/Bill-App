module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
          hover: {
            light: '#388E3C',
            dark: '#43A047'
          }
        },
        accent: {
          DEFAULT: '#00796B',
          light: '#009688',
          dark: '#004D40',
          hover: {
            light: '#00897B',
            dark: '#00695C'
          }
        },
        background: {
          light: '#FFFFFF',
          dark: '#1A1A1A',
          hover: {
            light: '#F3F4F6',
            dark: '#2D2D2D'
          }
        },
        surface: {
          light: '#FFFFFF',
          dark: '#242424',
          hover: {
            light: '#F9FAFB',
            dark: '#2F2F2F'
          }
        },
        text: {
          light: {
            primary: '#1F2937',
            secondary: '#4B5563',
            disabled: '#9CA3AF'
          },
          dark: {
            primary: '#E5E7EB',
            secondary: '#9CA3AF',
            disabled: '#6B7280'
          }
        },
        border: {
          light: '#E5E7EB',
          dark: '#404040'
        },
        warning: {
          light: '#FFF3CD',
          dark: '#422006',
          border: {
            light: '#FFE69C',
            dark: '#92400E'
          }
        },
        error: {
          light: '#DC2626',
          dark: '#991B1B',
          background: {
            light: '#FEE2E2',
            dark: '#2D1A1A'
          }
        },
        success: {
          light: '#059669',
          dark: '#065F46',
          background: {
            light: '#D1FAE5',
            dark: '#1A2E1A'
          }
        }
      },
      height: {
        '17': '4.25rem',
      },
    },
  },
  plugins: [],
};
