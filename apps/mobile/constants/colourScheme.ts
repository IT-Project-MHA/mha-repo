/**
 * Colour schemes across themes light / dark / light HC / dark HC
 * Themes can easily be extended, either by matching the 
 * ColourSet type, or by adjusting it.
 * 
 * Contrasts between values / onValues have been checked for contrast
 * using WGAC standard calculator. High contrast themes maintain at least a 7 : 1 ratio between values / onValues and regular
 * themes maintain at least 4.5 : 1
 * 
 * Ex colours meet text contrast requirements against primary colours.
 *  - light themes: 'ex' colours are darker versions of primary, secondary, tertiary
 *  - dark themes: they are lighter. 
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
  onPrimary: '#1d1b20',
  onSecondary: '#1d1b20',
  onTertiary: '#1d1b20',
  ex1: '#b8483f', // deeper coral
  ex2: '#417387', // deeper teal
  ex3: '#866826', // deeper yellow
  
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
  ex1: '#ff7f74', // brighter coral
  ex2: '#6fa9c0', // lighter teal
  ex3: '#d0ab59', // brighter yellow
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
  ex1: '#9c2b22', // deep red coral
  ex2: '#005b7f', // a deep teal
  ex3: '#5e4a1f', // deep yellow
};

/**
 * High contrast dark colour scheme
 */
export const darkHcColours: ColourSet = {
  background: '#121114',
  surface: '#262429',
  primary: '#ff7466',
  secondary: '#00fbff',
  tertiary: '#f4ff1f',
  onBackground: '#fff9f9',
  onSurface: '#fff3f3',
  onPrimary: '#080808',
  onSecondary: '#080808',
  onTertiary: '#080808',
  ex1: '#ff968c', // a brighter coral
  ex2: '#9bcbdc', // a deeper teal
  ex3: '#e0bb68', // brighter yellow
};
