import { View, Text, ScrollView, Alert } from "react-native";
import Button from "../../../../components/atomicUI/Button";
import ButtonWithIcon from "../../../../components/atomicUI/ButtonWithIcon";
import { useTheme } from "../../../../context/ThemeContext";
import { useEffect, useState } from "react";
import AddPrescriptionModal, {
  PrescriptionDetails
} from "../../../../components/atomicUI/AddPrescriptionModal";
import { apiPrescription } from "@/api/django-API";
import ViewPrescriptionModal from "../../../../components/atomicUI/ViewPrescriptionModal";

export default function Screen() {
  const { theme, colours } = useTheme();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<
    "addPrescription" | "editPrescription" | "viewPrescription" | null
  >(null);
  const [selected, setSelected] = useState<any | null>(null);

  /**
   * Handles prescription deletion
   *
   * If user attempts to delete a prescription that is used by another record they are warned and given
   * an alternative.
   */
  const handleDeletePrescription = async () => {
    if (saving || !selected) return;
    setSaving(true);
    try {
      await apiPrescription("delete", { id: selected.id });
      await loadPrescriptions();
      setPending(null);
      setSelected(null);
    } catch (e: any) {
      console.log("delete failed", e?.name, e?.message, e?.status, e?.data);
      if (e?.status === 409) {
        Alert.alert(
          "Can't remove this prescription",
          "It is used in your weekly check-ins. You can mark it as stopped instead."
        );
      } else if (e?.status === 404) {
        // presctiption not found so refresh list
        await loadPrescriptions();
        setPending(null);
        setSelected(null);
      } else {
        Alert.alert(
          "Couldn't remove prescription",
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const loadPrescriptions = () =>
    apiPrescription("select")
      .then((data) => {
        console.log("loaded", Array.isArray(data), data?.length);
        setPrescriptions(data);
      })
      .catch((e) =>
        console.log("failed to load", e?.message, e?.status, e?.data)
      );

  const openPrescription = (p: any) => {
    setSelected(p);
    setPending("viewPrescription");
  };

  // loads the data after initial
  useEffect(() => {
    loadPrescriptions();
  }, []);

  // ignore soft-deleted records
  const visiblePrescriptions = prescriptions.filter((p) => !p.deleted_at);

  // creates list of active prescriptions
  const activePrescriptions = visiblePrescriptions.filter((p) => !p.stopped_on);

  // creates list of inactive prescriptions
  const inactivePrescriptions = visiblePrescriptions.filter(
    (p) => p.stopped_on
  );

  /**
   * Handles adding the prescription after confirmation from the modal
   */
  const handleAddPrescription = async (values: PrescriptionDetails) => {
    console.log("add submit", values);
    if (saving) return;
    setSaving(true);
    try {
      await apiPrescription("create", values);
      await loadPrescriptions();
      setPending(null);
    } catch (e: any) {
      console.log("create failed", e?.name, e?.message, e?.status, e?.data);
      Alert.alert(
        "Couldn't save prescription",
        "Please check your details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditPrescription = async (values: PrescriptionDetails) => {
    if (saving || !selected) return;
    setSaving(true);
    try {
      await apiPrescription("update", {
        id: selected.id,
        ...values,
        strength: values.strength === "" ? null : values.strength,
        strength_unit: values.strength_unit || undefined,
        frequency_unit: values.frequency_unit || undefined,
        started_on: values.started_on === "" ? null : values.started_on,
        stopped_on: values.stopped_on === "" ? null : values.stopped_on,
        form: values.form || undefined
      });
      await loadPrescriptions();
      setPending(null);
      setSelected(null);
    } catch (e: any) {
      console.log("create failed", e?.name, e?.message, e?.status, e?.data);
    } finally {
      setSaving(false);
    }
  };

  const selectedDetails: PrescriptionDetails | undefined = selected && {
    name: selected.name ?? "",
    dosage: String(selected.dosage ?? ""),
    frequency: String(selected.frequency ?? ""),
    frequency_unit: selected.frequency_unit ?? "",
    strength: selected.strength != null ? String(selected.strength) : "",
    strength_unit: selected.strength_unit ?? "",
    form: selected.form ?? "",
    started_on: selected.started_on ?? "",
    stopped_on: selected.stopped_on ?? "",
    notes: selected.notes ?? ""
  };

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>
          My Prescriptions
        </Text>
      </View>

      {/**
       *
       * if user has no prescriptions, they are prompted to add one
       * adding a prescription triggers a prescription modal
       *
       * if the user has >0 prescriptions, they can view their prescriptions in list form, click to
       * view more information on their prescription in a modal, edit their prescription in a modal,
       * and remove their prescription
       * 
       * Renders a list of active and inactive presctiptions, so that even if a user has 
       * stopped using a medication, they can still access that record.
       *
       */}
      {activePrescriptions.length === 0 ? (
        <View>
          <View style={theme.centerItems}>
           
            <Text style={[theme.body, { color: colours.onSurface, marginVertical: 40 }]}>
              Your prescriptions list is empty.
            </Text>

            <Button
              label="Add Prescriptions"
              onPress={() => setPending("addPrescription")}
              buttonType="roundButton"
              textStyle={{ color: colours.onTertiary }}
              style={{ width: "80%" }}
            />

            <Text style={theme.xSmall}> </Text>
          </View>
        </View>
      ) : (
        <View style={[theme.sectionContainer, theme.centerItems]}>
          {activePrescriptions.map((p, index) => (
            <View key={p.id} style={[theme.layoutContainer, theme.centerItems]}>
              <ButtonWithIcon
                label={p.name}
                onPress={() => openPrescription(p)}
                buttonType="transparentButton"
                name="chevron-forward-outline"
                textStyle={{ color: colours.onTertiary }}
                style={{ width: "80%" }}
              />

              {/**
               * puts a divider in between all but the last prescription in the list
               */}
              {index < activePrescriptions.length - 1 && (
                <View style={theme.line} />
              )}
            </View>
          ))}

          <Button
            label="Add new Prescription"
            onPress={() => setPending("addPrescription")}
            buttonType="roundButton"
            textStyle={{ color: colours.onTertiary }}
          />
        </View>
      )}

      {inactivePrescriptions.length > 0 && (
        <>
          <View style={theme.header}>
            <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>
              My Inactive Prescriptions
            </Text>
          </View>

          {inactivePrescriptions.map((p, index) => (
            <View key={p.id} style={[theme.layoutContainer, theme.centerItems]}>
              <ButtonWithIcon
                label={p.name}
                onPress={() => openPrescription(p)}
                buttonType="transparentButton"
                name="chevron-forward"
                textStyle={{ color: colours.onTertiary }}
                style={{ width: "80%" }}
              />

              {index < inactivePrescriptions.length - 1 && (
                <View style={theme.line} />
              )}
            </View>
          ))}
        </>
      )}

      <View style={theme.bottomGap} />

      {/**
       * Renders modals when pending === 'addPrescription', 'viewPrescription' or 'editPrescription'
       */}

      <AddPrescriptionModal
        visible={pending === "addPrescription"}
        title="Add Prescription"
        submitLabel="Save Prescription"
        onConfirm={handleAddPrescription}
        onCancel={() => setPending(null)}
      />

      <ViewPrescriptionModal
        visible={pending === "viewPrescription"}
        prescription={selected}
        onEdit={() => setPending("editPrescription")}
        onDelete={handleDeletePrescription}
        onClose={() => {
          setPending(null);
          setSelected(null);
        }}
      />

      <AddPrescriptionModal
        visible={pending === "editPrescription"}
        title="Edit Prescription"
        initialValues={selectedDetails}
        submitLabel="Save Changes"
        onConfirm={handleEditPrescription}
        onCancel={() => setPending("viewPrescription")}
      />
    </ScrollView>
  );
}
