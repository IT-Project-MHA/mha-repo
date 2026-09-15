/**
 * Colour schemes across themes light / dark / light HC / dark HC
 * Themes can easily be extended, either by matching the 
 * ColourSet type, or by adjusting it.
 */


// standard theme layout
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
};

// M3 / sys / light / high contrast 
export const lightHcColours: ColourSet = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  primary: '#6750A4',
  secondary: '#e8def8',
  tertiary: '#4a4459',
  onBackground: '#000000',
  onSurface: '#1D1B20',
  onPrimary: '#FFFFFF',
  onSecondary: '#6750A4',
  onTertiary: '#FEF7FF'
};

// M3 / sys / dark / high contrast
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
  onTertiary: '#FEF7FF'
};

/**
 * Extra colours for graphics, etc.
 * Add colours here as you use them.
 */