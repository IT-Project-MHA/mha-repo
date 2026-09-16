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
 * M3 / sys / light in figma
 */
export const lightColours: ColourSet = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  primary: '#6750A4',
  secondary: '#e8def8',
  tertiary: '#4a4459',
  onBackground: '#000000',
  onSurface: '#1D1B20',
  onPrimary: '#FFFFFF',
  onSecondary: '#6750A4',
  onTertiary: '#FEF7FF',
  ex1: '#EADDFF',
  ex2: '#D9D9D9',
  ex3: '#CED0D4',
  
};

/**
 * Dark mode
 * M3 / sys / dark in figma
 */
 
export const darkColours: ColourSet = {
  background: '#1D1B20',
  surface: '#4a4459',
  primary: '#6750A4',
  secondary: '#e8def8',
  tertiary: '#4a4459',
  onBackground: '#FFFFFF',
  onSurface: '#CED0D4',
  onPrimary: '#FFFFFF',
  onSecondary: '#6750A4',
  onTertiary: '#FEF7FF',
  ex1: '#EADDFF',
  ex2: '#D9D9D9',
  ex3: '#CED0D4',
};

/**
 * M3 / sys / light / high contrast in figma
 */
export const lightHcColours: ColourSet = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  primary: '#27174E',
  secondary: '#FDF7FF',
  tertiary: '#322F35',
  onBackground: '#000000',
  onSurface: '#1D1B20',
  onPrimary: '#FFFFFF',
  onSecondary: '#7174E',
  onTertiary: '#FEF7FF',
  ex1: '#EADDFF',
  ex2: '#440F0E',
  ex3: '#6E2F2B',
};

/**
 * M3 / sys / dark / high contrast in figma
 */
export const darkHcColours: ColourSet = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  primary: '#6750A4',
  secondary: '#e8def8',
  tertiary: '#4a4459',
  onBackground: '#000000',
  onSurface: '#1D1B20',
  onPrimary: '#FFFFFF',
  onSecondary: '#6750A4',
  onTertiary: '#FEF7FF',
  ex1: '#EADDFF',
  ex2: '#440F0E',
  ex3: '#21222D',
};

/**
 * Extra colours for graphics, etc.
 * Add colours here as you use them.
 */