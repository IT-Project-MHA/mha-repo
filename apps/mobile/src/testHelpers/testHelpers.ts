// General test helpers to simplify jest writing

import { screen, fireEvent } from '@testing-library/react-native';

export const press = async (text: string) => fireEvent.press(screen.getByText(text));
export const pressLabel = async (label: string) => fireEvent.press(screen.getByLabelText(label));
