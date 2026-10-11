import type { TextStyle } from "react-native";

/**
 * Exports the type for text style
 */
export type TextSizeSet = {
  h1: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  h2: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  h3: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  h4: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  h5: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  h6: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  body: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  small: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
  xSmall: {fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']  };
};

export type FontScale = 1 | 1.5 | 2 ; 

/**
 * Base mode text sizes, which will have the option be scaled by the FontScale values
 * in the settings section of the app.
 */
 const baseText: TextSizeSet = {
  h1: {fontSize: 47.78, lineHeight: 71.67, fontWeight: 'regular'},
  h2: {fontSize: 39.8, lineHeight: 59.7, fontWeight: 'regular' },
  h3: {fontSize: 33.18, lineHeight: 49.77, fontWeight: 'regular' },
  h4: {fontSize: 27.65, lineHeight: 41.48, fontWeight: 'regular' },
  h5: {fontSize: 23.04, lineHeight: 34.56, fontWeight: 'regular' },
  h6: {fontSize: 19.2, lineHeight: 28.8, fontWeight: 'regular' },
  body: {fontSize: 16, lineHeight: 24, fontWeight: 'regular' },
  small: {fontSize: 13.33, lineHeight: 20, fontWeight: 'regular' },
  xSmall: {fontSize: 11.11, lineHeight: 16.67, fontWeight: 'regular' },
} as const;

export type TextVariants = keyof TextSizeSet; // exports the type of one item within TextSizeSet
export type Typography = Record<TextVariants, TextStyle>; // exports the structure of a variant and styles

/**
 * Returns the defined text structure and styles with sizes multiplied by the scale.
 * @param scale multiplication factor for the text(2x = 200%).
 */
export function createTypography(scale: FontScale): Typography {
  const scaledText = {} as Typography;

  (Object.keys(baseText) as TextVariants[]).forEach((key)=> {
    const baseFeatures = baseText[key];
    scaledText[key] ={
      ...baseFeatures,
      fontSize: baseFeatures.fontSize*scale,
      lineHeight: baseFeatures.lineHeight*(scale/1.5)
    };
  });
  return scaledText;
}