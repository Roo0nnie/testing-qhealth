/**
 * House of Gaia Design System Theme
 * Extracted from houseofgaia.ph design analysis
 */

const baseTheme = {
  typography: {
    fontFamily: {
      primary: 'Rubik, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
      '5xl': '36px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  zIndex: {
    base: 1,
    dropdown: 1000,
    overlay: 2000,
    modal: 3000,
    tooltip: 4000,
  },
};

export const lightTheme = {
  ...baseTheme,
  colors: {
    // Primary colors - Earth tones and natural greens
    primary: {
      main: '#2d5016', // Deep forest green
      light: '#4a7c2a', // Medium green
      dark: '#1a3009', // Dark forest green
      contrast: '#ffffff',
    },
    secondary: {
      main: '#8b6f47', // Warm beige/brown
      light: '#a68b6b', // Light beige
      dark: '#6b5535', // Dark beige
      contrast: '#ffffff',
    },
    accent: {
      main: '#6b8e23', // Olive green
      light: '#9ab855', // Light olive
      dark: '#4a5f18', // Dark olive
      contrast: '#ffffff',
    },
    // Background colors
    background: {
      primary: '#f5f5f0', // Warm off-white
      secondary: '#ffffff', // Pure white
      tertiary: '#faf9f6', // Light cream
      overlay: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
    },
    // Text colors
    text: {
      primary: '#2d2d2d', // Dark gray
      secondary: '#5a5a5a', // Medium gray
      tertiary: '#8b8b8b', // Light gray
      inverse: '#ffffff', // White text
      link: '#4a7c2a', // Green link color
    },
    // Status colors
    status: {
      success: '#4a7c2a', // Green
      error: '#c33', // Red
      warning: '#f59e0b', // Amber
      info: '#3b82f6', // Blue
    },
    // Border colors
    border: {
      light: '#e5e5e0', // Light border
      medium: '#d4d4d0', // Medium border
      dark: '#8b8b8b', // Dark border
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

export const darkTheme = {
  ...baseTheme,
  colors: {
    // Primary colors - Adjusted for dark mode
    primary: {
      main: '#6b8e23', // Lighter olive green for better visibility
      light: '#9ab855', // Light olive
      dark: '#4a5f18', // Dark olive
      contrast: '#ffffff',
    },
    secondary: {
      main: '#a68b6b', // Lighter beige for dark backgrounds
      light: '#c4a882', // Light beige
      dark: '#8b6f47', // Medium beige
      contrast: '#ffffff',
    },
    accent: {
      main: '#9ab855', // Light olive green
      light: '#b8d47a', // Very light olive
      dark: '#6b8e23', // Medium olive
      contrast: '#1a1a1a',
    },
    // Background colors - Dark grays
    background: {
      primary: '#1a1a1a', // Dark gray
      secondary: '#2d2d2d', // Medium dark gray
      tertiary: '#3a3a3a', // Lighter dark gray
      overlay: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    },
    // Text colors - Light colors for dark backgrounds
    text: {
      primary: '#f5f5f0', // Light off-white
      secondary: '#e0e0e0', // Light gray
      tertiary: '#b0b0b0', // Medium gray
      inverse: '#1a1a1a', // Dark text for light backgrounds
      link: '#9ab855', // Light green link color
    },
    // Status colors - Slightly adjusted for dark mode
    status: {
      success: '#9ab855', // Light green
      error: '#ff6b6b', // Lighter red
      warning: '#ffb347', // Lighter amber
      info: '#5dade2', // Lighter blue
    },
    // Border colors - Lighter for dark backgrounds
    border: {
      light: '#3a3a3a', // Dark border
      medium: '#4a4a4a', // Medium border
      dark: '#5a5a5a', // Light border
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  },
};

// Export for backward compatibility
export const theme = lightTheme;
export type Theme = typeof lightTheme;

