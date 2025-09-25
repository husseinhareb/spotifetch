import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    colors: {
      background: string;
      backgroundSolid: string;
      text: string;
      link: string;
      navBackground: string;
      navText: string;
      buttonBackground: string;
      buttonText: string;
      accent: string;
    };
  }
}
