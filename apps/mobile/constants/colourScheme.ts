/**
 * Colour schemes across themes light / dark / light HC / dark HC
 * Themes can easily be extended, either by matching the 
 * ColourSet type, or by adjusting it.
 */
export type ColourSet = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  tertiary: string;
  onBackground: string;
  onSurface: string;
  onPrimary: string;
  onSecondary: string;
  onTertiary: string;
  ex1: string;
  ex2: string;
  ex3: string;

};

/**
 * Light mode
 */
export const lightColours: ColourSet = {
  background: '#fff9f9',
  surface: '#f9eded',
  primary: '#e8756b',
  secondary: '#f6ce76',
  tertiary: '#79b0c6',
  onBackground: '#1d1b20',
  onSurface: '#35313b',
  onPrimary: '#fff9f9',
  onSecondary: '#fff9f9',
  onTertiary: '#fff9f9',
  ex1: '#ff7f74', // a brighter coral
  ex2: '#5292ab', // a deeper teal
  ex3: '#d0ab59', // shaded yellow
  
};

/**
 * Dark mode
 */
export const darkColours: ColourSet = {
  background: '#1d1b20',
  surface: '#37363b',
  primary: '#e8756b',
  secondary: '#f6ce76',
  tertiary: '#79b0c6',
  onBackground: '#fff9f9',
  onSurface: '#fff3f3',
  onPrimary: '#1d1b20',
  onSecondary: '#1d1b20',
  onTertiary: '#1d1b20',
  ex1: '#ff7f74', // a brighter coral
  ex2: '#5292ab', // a deeper teal
  ex3: '#d0ab59', // shaded yellow
};

/**
 * High Contrast light colour scheme
 */
export const lightHcColours: ColourSet = {
  background: '#fff9f9',
  surface: '#fff9f9',
  primary: '#ff6254',
  secondary: '#b1eb10',
  tertiary: '#48cbff',
  onBackground: '#080808',
  onSurface: '#080808',
  onPrimary: '#fff9f9',
  onSecondary: '#fff9f9',
  onTertiary: '#fff9f9',
  ex1: '#ff2b18', 
  ex2: '#00b7ff', 
  ex3: '#604c20', 
};

/**
 * High contrast dark colour scheme
 */
export const darkHcColours: ColourSet = {
  background: '#121114',
  surface: '#262429',
  primary: '#ff6254',
  secondary: '#00fbff',
  tertiary: '#f4ff1f',
  onBackground: '#fff9f9',
  onSurface: '#fff3f3',
  onPrimary: '#1d1b20',
  onSecondary: '#1d1b20',
  onTertiary: '#1d1b20',
  ex1: '#ff7f74', // a brighter coral
  ex2: '#5292ab', // a deeper teal
  ex3: '#d0ab59', // shaded yellow
};

/**
 * Extra colours for graphics, etc.
 * Add colours here as you use them.
 */