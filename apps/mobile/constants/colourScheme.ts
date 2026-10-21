/**
 * Colour schemes across themes light / dark / light HC / dark HC
 * 
 * 'on' colours can be used as text on their counterparts (primary/onPrimary etc.) meeting
 *  WCAG contrast standards.
 * 
 *  '2' colours are alternate versions to their counterparts (primary/primary2)
 *  and can be used for components, etc. against the background.
 * 
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
  primary2: string;
  secondary2: string;
  tertiary2: string;
  onPrimary2: string;
  onSecondary2: string;
  onTertiary2: string;
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
  onPrimary: '#1d1b20', 
  onSecondary: '#1d1b20',
  onTertiary: '#1d1b20',

  primary2: '#b8483f',
  secondary2: '#866826',
  tertiary2: '#417387', 
  onPrimary2: '#feeeec', 
  onSecondary2: '#fdf0d3',
  onTertiary2: '#dff5fd',
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

  primary2: '#b8483f',
  secondary2: '#866826',
  tertiary2: '#417387', 
  onPrimary2: '#feeeec', 
  onSecondary2: '#fdf0d3',
  onTertiary2: '#dff5fd',
};

/**
 * High Contrast light colour scheme
 */
export const lightHcColours: ColourSet = {
  background: '#fff9f9',
  surface: '#fff9f9',
  primary: '#ff7466',
  secondary: '#ffd23f',
  tertiary: '#48cbff',
  onBackground: '#080808',
  onSurface: '#080808',
  onPrimary: '#080808',
  onSecondary: '#080808',
  onTertiary: '#080808',
  
  primary2: '#9c2b22',
  secondary2: '#5e4a1f',
  tertiary2: '#005b7f', 
  onPrimary2: '#fff9f9', 
  onSecondary2: '#fff9f9',
  onTertiary2: '#fff9f9',
};

/**
 * High contrast dark colour scheme
 */
export const darkHcColours: ColourSet = {
  background: '#121114',
  surface: '#262429',
  primary: '#ff7466',
  secondary: '#ffd23f',
  tertiary: '#48cbff',
  onBackground: '#fff9f9',
  onSurface: '#fff9f9',
  onPrimary: '#080808',
  onSecondary: '#080808',
  onTertiary: '#080808',

  primary2: '#ffc4bd',
  secondary2: '#e8a317',
  tertiary2: '#bde9fb',
  onPrimary2: '#080808',   
  onSecondary2: '#080808',
  onTertiary2: '#080808',  
};