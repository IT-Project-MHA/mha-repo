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
  paddingHorizontal: 55, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

export const primaryButtonLayout = {
  paddingVertical: 12, 
  paddingHorizontal: 80, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

export const squareButtonWithLineLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,

  width: '90%' as const,
  height: 64,

  borderRadius: 20,
  borderTopWidth: 0,     
  borderBottomWidth: 4, 
  borderWidth: 1,
  elevation: 4,
}

export const transparentButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 40,
  width: '85%' as const,
  height: 64,
}

export const textButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 0,
  height: 40,
}