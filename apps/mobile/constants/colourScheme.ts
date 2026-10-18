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
  onEx1: string;
  onEx2: string; 
  onEx3: string; 
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
  ex1: '#b8483f',
  ex2: '#866826',
  ex3: '#417387',
  onEx1: '#FFB7B1',
  onEx2: '#F7CD77',
  onEx3: '#A8D3E4',  
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
  ex1: '#b8483f', // deeper coral
  ex2: '#866826', // deeper yellow
  ex3: '#417387', // deeper teal'
  onEx1: '#FFB7B1',
  onEx2: '#F7CD77',
  onEx3: '#A8D3E4',
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
  ex2: '#5e4a1f', // deep yellow 
  ex3: '#005b7f', // a deep teal
  onEx1: '#FFF9F9',
  onEx2: '#FFF9F9',
  onEx3: '#FFF9F9',
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
  onSurface: '#fff3f3',
  onPrimary: '#080808',
  onSecondary: '#080808',
  onTertiary: '#080808',
  ex1: '#ff968c',
  ex2: '#e0bb68',
  ex3: '#9bcbdc', 
  onEx1: '#FFF9F9',
  onEx2: '#FFF9F9',
  onEx3: '#FFF9F9',
};
