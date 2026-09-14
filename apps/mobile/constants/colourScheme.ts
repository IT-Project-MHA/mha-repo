/**
 * Colour schemes across themes light / dark / light HC / dark HC
 */

// make shape of theme explicit 
export type ColourSet = {
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  p5: string;
};

// M3 / sys / light
export const lightColours: ColourSet = {
  p1: '#4F378B',
  p2: '#F7F2FA',
  p3: '#6750A4',
  p4: '#000000',
  p5: '#EADDFF',
};

// M3 / sys / dark
export const darkColours: ColourSet = {
  p1: 'pink',
  p2: '#F7F2FA',
  p3: '#6750A4',
  p4: '#000000',
  p5: '#EADDFF',
};


// M3 / sys / light / high contrast 
export const lightHcColours: ColourSet = {
  p1: 'blue',
  p2: '#F7F2FA',
  p3: '#6750A4',
  p4: '#000000', 
  p5: '#EADDFF',
};


// M3 / sys / dark / high contrast
export const darkHcColours: ColourSet = {
  p1: 'red',
  p2: '#F7F2FA',
  p3: '#6750A4',
  p4: '#000000',
  p5: '#EADDFF',
};

