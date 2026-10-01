/**
 * Text size standards
 */
export type TextSizeSet = {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  body: number;
  small: number;
  xSmall: number;
};

/**
 * Normal mode text sizes
 */
 
export const normalText: TextSizeSet = {
  h1: 47.78,
  h2: 39.8,
  h3: 33.18,
  h4: 27.65,
  h5: 23.04,
  h6: 19.2,
  body: 16,
  small: 13.33,
  xSmall: 11.11,
};

/**
 * Large text mode text sizes– 200% bigger than normal as per design standards
 */
 
export const largeText: TextSizeSet = {
  h1: 95.55,
  h2: 79.63,
  h3: 66.36,
  h4: 55.3,
  h5: 46.08,
  h6: 38.4,
  body: 32,
  small: 26.67,
  xSmall: 22.22,
};
