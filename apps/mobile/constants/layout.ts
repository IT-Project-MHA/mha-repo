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

/**
 * Basic text layout
 */
export const textLayout = {
  fontSize: 16,
  fontWeight: 'bold' as const,
};

export const primaryButtonLayout = {
  paddingVertical: 12, 
  paddingHorizontal: 80, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

export const transparentButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 40,
  width: '85%' as const,
}

export const textButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingBlock: 0,
}

export const roundButtonLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,

  width: '85%' as const,
  
  paddingBlock: 15,
  paddingHorizontal: 40,

  borderRadius: 70,
  borderTopWidth: 0,     
  borderBottomWidth: 0, 
}
