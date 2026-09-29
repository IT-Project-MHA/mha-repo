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
  fontSize: 18,
};

/**
 * Basic button layout
 */
export const primaryButtonLayout = {
  paddingVertical: 12, 
  paddingHorizontal: 80, 
  borderRadius: 8,
  alignItems: 'center' as const,
};

/**
 * created for settings, to match the nav bar
 */
export const settingsButtonLayout = {
  //paddingVertical: '50%, 
  //paddingHorizontal: 80, 
  

  //flexDirection: 'middle',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,

  // shape
  width: '90%' as const,
  height: 64,
  borderRadius: 28,
  borderTopWidth: 2,     
  borderBottomWidth: 2, 
  borderWidth: 1,
  shadowColor: '#2a2727',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 4,
};