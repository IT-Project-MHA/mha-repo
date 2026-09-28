/**
 * The community slider annoyingly has three colour props outside theme-> we must export
 * the colours to use for it specifically
 * the minTrack is the left of the selected point
 * the maxTrack is right of the selected point
 * the thumb is the circle in the middle
 */
import { lightColours, darkColours, lightHcColours, darkHcColours } from "./colourScheme";

import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themes, ThemeMode } from '../constants/theme';

//light theme three colours
export const sliderLightTheme = {
  sliderMinTrack: lightColours.primary,
  sliderMaxTrack: lightColours.secondary,
  sliderThumb: lightColours.primary,
}

export const sliderDarkTheme = {
  sliderMinTrack: darkColours.primary,
  sliderMaxTrack: darkColours.secondary,
  sliderThumb: darkColours.primary,
}

export const sliderDarkHcTheme = {
  sliderMinTrack: darkHcColours.primary,
  sliderMaxTrack: darkHcColours.secondary,
  sliderThumb: darkHcColours.primary,
}

export const sliderLightHcTheme = {
  sliderMinTrack: lightHcColours.primary,
  sliderMaxTrack: lightHcColours.secondary,
  sliderThumb: lightHcColours.primary,
}

//hard coded for now to use dark theme, will have to check with Amelia how to do this better
