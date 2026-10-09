/**
 * StyleSheet for components.
 * 
 * These are tentative at the moment- used for testing component functionality.
 * 
 * To be edited as new components are created, alongside theme.ts.
 */

import { BottomTabs } from "react-native-screens";


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

export const squareButtonWithLineLayout = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,

  // shape
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