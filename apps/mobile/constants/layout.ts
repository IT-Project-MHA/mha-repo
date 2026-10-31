import { PixelRatio } from 'react-native';

/**
 * Thickness of every divider line: about 1 point, rounded to a whole number of screen pixels so
 * lines don't render thinner or thicker depending on where they land on phones with fractional
 * pixel densities
 */
export const lineThickness = Math.max(1, Math.round(PixelRatio.get())) / PixelRatio.get();

/**
 * StyleSheet for components.
 * 
 * These are tentative at the moment- used for testing component functionality.
 * 
 * To be edited as new components are created, alongside theme.ts.
 */

/**
 * Basic button layout
 */
export const buttonLayout = {
  paddingVertical: 12, 
  paddingHorizontal: 24, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

/**
 * Basic text layout
 */
export const textLayout = {
  fontSize: 16,
  fontWeight: 'bold' as const,
};

export const primaryButtonLayout = {
  paddingVertical: 12, 
  paddingHorizontal: 24, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

export const transparentButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 40,
  width: '85%' as const,
}

export const roundedTertiaryButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  margin: 5,
  padding: 5,
  borderWidth: 1,
  borderRadius: 50
}
export const textButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 0,
}

export const roundButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  alignSelf: 'center' as const,

  width: '85%' as const,

  paddingBlock: 15,
  paddingHorizontal: 16,

  borderRadius: 70,
  borderTopWidth: 0,
  borderBottomWidth: 0,
}
