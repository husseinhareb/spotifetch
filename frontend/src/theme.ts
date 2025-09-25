// theme.ts
// Defines light and dark theme variables used by styled-components ThemeProvider

export const darkTheme = {
  name: 'dark',
  colors: {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #060606 100%)',
    backgroundSolid: '#0b0b0b',
    text: '#e6eef0',
    textSecondary: '#b3b3b3',
    link: '#1DB954',
    navBackground: '#070707',
    navText: '#e6eef0',
    buttonBackground: 'rgba(255,255,255,0.06)',
    buttonText: '#e6eef0',
    accent: '#1DB954',
  },
};

export const lightTheme = {
  name: 'light',
  colors: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f6f7f8 50%, #ffffff 100%)',
    backgroundSolid: '#ffffff',
    text: '#0b0b0b',
    textSecondary: '#6b6b6b',
    link: '#1DB954',
    navBackground: '#ffffff',
    navText: '#0b0b0b',
    buttonBackground: 'rgba(0,0,0,0.06)',
    buttonText: '#0b0b0b',
    accent: '#1DB954',
  },
};

export type ThemeType = typeof darkTheme;
