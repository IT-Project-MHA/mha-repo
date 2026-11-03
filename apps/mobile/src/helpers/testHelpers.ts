// General test helpers to simplify jest writing

import type { ReactElement } from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react-native';

export const press = async (text: string) => fireEvent.press(screen.getByText(text));
export const pressLabel = async (label: string) => fireEvent.press(screen.getByLabelText(label));
export const expectText = (text: string | RegExp) => expect(screen.getByText(text)).toBeTruthy();
export const expectNoText = (text: string | RegExp) => expect(screen.queryByText(text)).toBeNull();

// presses the text and waits for what it triggers to settle
export const actPress = async (text: string) =>
  act(async () => {
    await press(text);
  });

// renders the element & wrap it in act(async () =>{...})
export const actRender = async (screenElement: ReactElement) =>
  act(async () => {
    await render(screenElement);
  });


