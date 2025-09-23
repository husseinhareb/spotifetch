// src/GlobalStyle.tsx
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* make padding/borders part of the width math */
  html {
    box-sizing: border-box;
  }
  *, *::before, *::after {
    box-sizing: inherit;
  }
  /* reset default body margin and set dark theme base */
  body {
    margin: 0;
    background: linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #060606 100%);
    color: #e6eef0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: #1DB954;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;
