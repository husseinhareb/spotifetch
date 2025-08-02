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

  /* reset default body margin so nothing peeks out */
  body {
    margin: 0;
  }
`;
