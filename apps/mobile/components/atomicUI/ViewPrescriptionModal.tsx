import { Modal, View, Text, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../constants/date';

type Props = {
  visible: boolean;
  prescription: any | null;
  onEdit: () => void;
  onClose: () => void;
};

const ViewPrescriptionModal = ({ visible, prescription, onEdit, onClose }: Props) => {
  const { theme, colours } = useTheme();

  const rows: [string, string | null | undefined][] = [
  ['Dosage', prescription?.dosage != null ? String(prescription.dosage) : null],
  ['Frequency', prescription?.frequency != null ? String(prescription.frequency) : null],
  ['Strength', prescription?.strength != null ? String(prescription.strength) : null],
  ['Started on', prescription?.started_on ? formatDate(prescription.started_on) : null],
  ['Stopped on', prescription?.stopped_on ? formatDate(prescription.stopped_on) : null],
  ['Notes', prescription?.notes],
];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={theme.modalBackgroundColour} />
      <Pressable style={theme.modalView} onPress={onClose}>
        <Pressable style={[theme.card, { backgroundColor: colours.surface }]} onPress={() => {}}>
          <Text style={[theme.h4, { color: colours.onSurface }]}>{prescription?.name}</Text>
          <Text> </Text>

          {rows.map(([label, value]) =>
            value ? (
              <View key={label} style={theme.row}>
                <Text style={[theme.h6, { color: colours.onSurface }]}>{label}</Text>
                <Text style={[theme.body, { color: colours.onSurface }]}>{value}</Text>
              </View>
            ) : null
          )}

          <View style={theme.modalButtons}>
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
    </Modal>
  );
};

export default ViewPrescriptionModal;

