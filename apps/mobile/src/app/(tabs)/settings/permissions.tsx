import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Linking, AppState, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { useTheme } from '../../../../context/ThemeContext';
import Toggle from '../../../../components/atomicUI/Toggle';
import { apiMySettings, apiSaveSettings, apiErrorMessage } from '@/api/settings_api_helpers'

/**
 * UserSettings fields that map to an OS permission.
 */
const OS_PERMISSIONS: Record<string, { get: () => Promise<any>; request: () => Promise<any>; name: string }> = {
  microphone_access: {
    get: getRecordingPermissionsAsync,
    request: requestRecordingPermissionsAsync,
    name: 'microphone',
  },
  notifications_enabled: {
    get: Notifications.getPermissionsAsync,
    request: Notifications.requestPermissionsAsync,
    name: 'notifications',
  },
};

/**
 * A true/false setting stored on the phone with AsyncStorage rather than the server.
 * Used for the two reminder toggles, because UserSettings has no fields for them yet.
 *
 * @param key storage key, e.g. 'reminders.assessment'
 * @param defaultValue value to use until a saved one is found
 * @returns [value, update], the same shape as useState
 */
function useLocalFlag(key: string, defaultValue = true) {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    AsyncStorage.getItem(key).then((v) => v !== null && setValue(v === 'true')).catch(() => {});
  }, [key]);
  const update = (next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(key, String(next)).catch(() => {});
  };
  return [value, update] as const;
}

export default function Screen() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<any>(null); // null = no record yet
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [osGranted, setOsGranted] = useState<Record<string, boolean>>({});
  const [assessmentReminders, setAssessmentReminders] = useLocalFlag('reminders.assessment');
  const [appointmentReminders, setAppointmentReminders] = useLocalFlag('reminders.appointment');

  /**
   * Asks the phone what it currently allows for every permission in OS_PERMISSIONS and stores
   * the results in osGranted.
   */
  const refreshOs = useCallback(async () => {
    const entries = await Promise.all(
      Object.entries(OS_PERMISSIONS).map(async ([key, os]) => [key, (await os.get()).granted] as const)
    );
    setOsGranted(Object.fromEntries(entries));
  }, []);

  /**
   * Loads the user's saved settings from the server and the phone's permission status.
   * Shows an error with a retry button if it fails.
   */
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setSettings(await apiMySettings());
      await refreshOs();
    } catch (e) {
      setLoadError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [refreshOs]);

  useEffect(() => { load(); }, [load]);

  // re-check OS state when the user comes back from the phone's settings app
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshOs());
    return () => sub.remove();
  }, [refreshOs]);

  // on only if the user consented in the app and the OS allows it
  const isOn = (key: string) =>
    Boolean(settings?.[key]) && (OS_PERMISSIONS[key] ? Boolean(osGranted[key]) : true);

  /**
   * Turns a permission on or off when its toggle is pressed.
   *
   * Turning on: first makes sure the phone allows it, and if the phone
   * refuses, explains and offers to open the phone's settings.
   * Turning off, or on once allowed: saves the choice to the server.
   *
   * @param key the UserSettings field, e.g. 'microphone_access'
   * @param wanted true to turn it on, false to turn it off
   */
  async function setPermission(key: string, wanted: boolean) {
    if (saving) return; // avoids creating the settings record twice on rapid taps
    const os = OS_PERMISSIONS[key];

    // opting in: make sure the OS permission is granted first
    if (wanted && os) {
      let status = await os.get();
      if (!status.granted && status.canAskAgain) status = await os.request();
      if (!status.granted) {
        await refreshOs();
        Alert.alert(
          `Allow ${os.name}`,
          `${os.name[0].toUpperCase() + os.name.slice(1)} access is turned off for this app in your phone settings.`,
          [{ text: 'Not now', style: 'cancel' }, { text: 'Open settings', onPress: () => Linking.openSettings() }]
        );
        return;
      }
    }

    // opting out (or in, once allowed): save to the server, optimistic with rollback
    const previous = settings;
    setSettings({ ...(settings ?? {}), [key]: wanted });
    setSaving(true);
    try {
      setSettings(await apiSaveSettings(settings?.id ?? null, { [key]: wanted }));
    } catch (e) {
      setSettings(previous);
      Alert.alert('Could not save', apiErrorMessage(e));
    } finally {
      setSaving(false);
      refreshOs();
    }
  }

  // shown when the user opted out in the app but the phone still allows it
  const osHint = (key: string) =>
    OS_PERMISSIONS[key] && osGranted[key] && !settings?.[key] ? (
      <Pressable onPress={() => Linking.openSettings()}>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>
          Turned off in the app. To also remove it from your phone, open phone settings.
        </Text>
      </Pressable>
    ) : null;

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 48 }} />;
  }
  if (loadError) {
    return (
      <View style={theme.sectionContainer}>
        <Text style={[theme.body, theme.fontOnSurface]}>{loadError}</Text>
        <Pressable onPress={load}><Text style={[theme.h6, theme.fontOnSurface]}>Try again</Text></Pressable>
      </View>
    );
  }

  const notificationsOn = isOn('notifications_enabled');

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Permissions</Text>
      </View>
      <Text> </Text>

      <View style={[theme.sectionContainer]}>
        <View style={theme.row}>
          <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Microphone</Text>
          <Toggle switchOn={isOn('microphone_access')} onToggle={() => setPermission('microphone_access', !isOn('microphone_access'))} />
        </View>
        {osHint('microphone_access')}

        <Text> </Text>
        <View style={theme.line} />
        <Text> </Text>

        <View style={theme.row}>
          <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Notifications</Text>
          <Toggle switchOn={notificationsOn} onToggle={() => setPermission('notifications_enabled', !notificationsOn)} />
        </View>
        {osHint('notifications_enabled')}
        <Text> </Text>

        {/* sub-options only apply while notifications are on */}
        <View style={[theme.row, { opacity: notificationsOn ? 1 : 0.4 }]} pointerEvents={notificationsOn ? 'auto' : 'none'}>
          <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Weekly Assessment Reminders</Text>
          <Toggle switchOn={notificationsOn && assessmentReminders} onToggle={() => setAssessmentReminders(!assessmentReminders)} />
        </View>
        <View style={[theme.row, { opacity: notificationsOn ? 1 : 0.4 }]} pointerEvents={notificationsOn ? 'auto' : 'none'}>
          <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Appointment Reminders</Text>
          <Toggle switchOn={notificationsOn && appointmentReminders} onToggle={() => setAppointmentReminders(!appointmentReminders)} />
        </View>

        <Text> </Text>
        <View style={theme.line} />
        <Text> </Text>

        <View style={theme.row}>
          <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Offline Backup</Text>
          <Toggle switchOn={isOn('offline_backup')} onToggle={() => setPermission('offline_backup', !isOn('offline_backup'))} />
        </View>
      </View>
      <View style={theme.bottomGap} />
    </ScrollView>
  );
}