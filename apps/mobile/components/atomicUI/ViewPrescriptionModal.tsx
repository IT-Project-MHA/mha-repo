import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../constants/date';
import { apiStrengthUnit, apiFrequencyUnit, apiFormUnit } from '@/api/django-API';
import ConfirmModal from './ConfirmModal';

// dropdown choice from backend
type Option = { value: string; label: string };

type Props = {
  visible: boolean;
  prescription: any | null;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Turns an API number like '200.000' or 2.5 into display text ('200', '2.5').
 * Returns null for null/empty/non-numeric values so the row is hidden.
 */
const formatNumber = (value: string | number | null | undefined) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : String(n);
};

/**
 * Looks up the display label for an API value (e.g. 'mg' -> 'mg', 'hour' -> 'hour(s)').
 * Falls back to the raw value if the options haven't loaded or there's no match.
 */
const labelFor = (options: Option[], value?: string | null) => {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? value;
};

/**
 * Read-only modal showing prescription details called from backend.
 * 
 * Features edit prescription, remove prescription options.
 */
const ViewPrescriptionModal = ({ visible, prescription: p, onEdit, onDelete, onClose }: Props) => {
  const { theme, colours } = useTheme();
  const [units, setUnits] = useState<Option[]>([]); // strength units
  const [freqUnits, setFreqUnits] = useState<Option[]>([]); // frequency units
  const [forms, setForms] = useState<Option[]>([]); // medication forms
  const [confirming, setConfirming] = useState(false);

  // hide confirmation when modal closes
  useEffect(() => {
    if (!visible) setConfirming(false);
  }, [visible]);

  useEffect(() => {
    apiStrengthUnit()
      .then(setUnits)
      .catch((e) => console.log('failed to load units', e?.message, e?.status));
    apiFrequencyUnit()
      .then(setFreqUnits)
      .catch((e) => console.log('failed to load frequency units', e?.message, e?.status));
    apiFormUnit()
      .then(setForms)
      .catch((e) => console.log('failed to load forms', e?.message, e?.status));
  }, []);

  const strength = formatNumber(p?.strength);
  const dosage = formatNumber(p?.dosage);
  const frequency = formatNumber(p?.frequency);

  const formLabel = labelFor(forms, p?.form);

  // e.g. '200 mg' (unit only shown alongside a strength)
  const strengthText = strength
    ? `${strength} ${labelFor(units, p?.strength_unit)}`.trim()
    : null;

  // e.g. '2 Tablet(s)' (form is the type of medication)
  const dosageText = dosage ? `${dosage}${formLabel ? ` ${formLabel}` : ''}` : null;

  // e.g. '6 hour(s)'
  const frequencyText = frequency
    ? `${frequency} ${labelFor(freqUnits, p?.frequency_unit)}`.trim()
    : null;

  const rows: [string, string | null | undefined][] = [
    ['Form', formLabel || null],
    ['Strength', strengthText],
    ['Dosage', dosageText],
    ['Frequency', frequencyText],
    ['Started on', p?.started_on ? formatDate(p.started_on) : null],
    ['Stopped on', p?.stopped_on ? formatDate(p.stopped_on) : null],
    ['Notes', p?.notes],
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={theme.modalBackgroundColour} />
      <Pressable style={theme.modalView} onPress={onClose}>
        <Pressable style={[theme.card, { backgroundColor: colours.surface }]} onPress={() => {}}>
          <Text style={[theme.h4, { color: colours.onSurface, margin: 5 }]}>{p?.name}</Text>

          {/* scrolls if there are a lot of notes; buttons stay pinned below */}
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }}>
            {rows.map(([label, value]) =>
              value ? (
                <View key={label} style={{ marginTop: 14, marginStart: 7 }}>
                  <Text style={[theme.small, { color: colours.onSurface, opacity: 0.7 }]}>{label}</Text>
                  <Text style={[theme.body, { color: colours.onSurface, marginTop: 2 }]}>{value}</Text>
                </View>
              ) : null
            )}
          </ScrollView>
          
          <Pressable onPress={() => setConfirming(true)} style={{ marginTop: 16, padding: 5 }}>
              <Text style={[theme.body, theme.fontUnderlined, { color: colours.primary }]}>Remove Prescription</Text>
          </Pressable>

          <View style={[theme.modalButtons, theme.centerItems, theme.row]}>
            <Pressable
              style={[theme.modalButton, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={onClose}
            >
              <Text style={[theme.body, { color: colours.onSurface }]}>Close</Text>
            </Pressable>
            <Pressable style={[theme.modalButton, { backgroundColor: colours.primary }]} onPress={onEdit}>
              <Text style={[theme.body, { color: colours.onPrimary }]}>Edit Prescription</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

    
    <ConfirmModal
        visible={confirming}
        title={`Remove ${p?.name ?? 'this prescription'}?`}
        message={
          p?.stopped_on
            ? `Are you sure you want to remove this prescription?\nIt will no longer appear in your lists.`
          : `Are you sure you want to remove this prescription?\n\nIt will no longer appear in your lists. To keep it in your records add a "Stopped on" date instead.`
        }
        confirmLabel="Remove Medication"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirming(false);
          onDelete();
        }}
        onCancel={() => setConfirming(false)}
      />

    </Modal>
  );
};

export default ViewPrescriptionModal;