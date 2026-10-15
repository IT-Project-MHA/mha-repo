/**
 * Options of the drop-down menus in the app. Options defined on the Django models are loaded from
 * the server's choices endpoints (the TextChoices APIs in django-API.js), so they always match what
 * the server accepts. Add each drop-down's options here, e.g.
 * export const useStrengthUnits = () => useDropdownOptions(apiStrengthUnit);
 */
import { useEffect, useState } from 'react';
import { apiHealthService } from '../src/api/django-API';

// option of a drop-down menu, value is saved & label is shown
export type DropdownOption = { value: string; label: string };

/**
 * Loads a drop-down's options once with the given choices API call. first is the value of an
 * option to move to the top of the list. The list is empty if they can't be loaded.
 */
const useDropdownOptions = (load: () => Promise<DropdownOption[]>, first?: string) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const loaded = await load();
        setOptions([
          ...loaded.filter((option) => option.value === first),
          ...loaded.filter((option) => option.value !== first),
        ]);
      } catch (error) {
        console.error('Failed to load drop-down options', error);
      }
    };
    loadOptions();
  }, [load, first]);

  return options;
};

// Health services (Appointment.health_service)

// health service an appointment starts with, the same as the server's default
export const DEFAULT_HEALTH_SERVICE = 'General Practitioner';

// health service options, with General Practitioner first
export const useHealthServices = () => useDropdownOptions(apiHealthService, DEFAULT_HEALTH_SERVICE);
