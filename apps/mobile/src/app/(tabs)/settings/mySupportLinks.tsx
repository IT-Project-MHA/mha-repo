/**
 * My Support Links
 * - Patients can view support people & who their connections
 * - Support people can view their connections
 * - Patients can invite support people and adjust their permissions
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import ButtonWithIcon from "../../../../components/atomicUI/ButtonWithIcon";
import React, { useState, useEffect } from "react";
import TextButton from "../../../../components/atomicUI/TextButton";
import PeopleModal, {
  type Permissions
} from "../../../../components/atomicUI/PeopleModal";
import AddSupportPersonModal from "../../../../components/atomicUI/AddSupportPersonModal";
import { useUser } from "../../../../context/AuthorisationContext";
import {
  apiMySupportLinks,
  apiInviteSupportPerson,
  apiRemoveSupportPerson,
  apiRemoveConnection,
  apiErrorMessage,
  apiAcceptInvitation,
  apiDeclineInvitation,
  apiSaveSupportPermissions
} from "@/api/settings_api_helpers";

// a person on this screen, from apiMyConnections. id is the SupportLink's id
type Person = {
  id: string;
  name: string;
  phone: string;
  invited: boolean; // invite not accepted yet
  permissions: Permissions;
};

type Relationship = "supportsMe" | "imSupporting";

// default no permissions state for support people
const noPermissions: Permissions = {
  viewAppointments: false,
  viewAssessments: false,
  viewPrescriptions: false
};

type Connections = {
  supportPeople: Person[];
  supporting: Person[];
  invitations: { id: string; name: string }[];
};

export default function Screen() {
  const { theme, colours } = useTheme();
  const [connections, setConnections] = useState<Connections | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    person: Person;
    relationship: Relationship;
  } | null>(null);
  const [adding, setAdding] = useState(false); // add support person modal visibility
  const { refreshUserType, isPatient } = useUser();

  const handleAccept = async (id: string) => {
    try {
      await apiAcceptInvitation(id);
      await refreshUserType(); // noRole -> supportPerson (or patient -> both)
      await load(); // reload the connections lists
    } catch (e) {
      Alert.alert("Could not accept invitation", apiErrorMessage(e));
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await apiDeclineInvitation(id);
      await load();
    } catch (e) {
      Alert.alert("Could not decline invitation", apiErrorMessage(e));
    }
  };

  /**
   * Loads the user's support links from the backend, showing an error with a retry button if it
   * fails the first time.
   */
  const load = async () => {
    setLoadError(null);
    try {
      setConnections(await apiMySupportLinks());
    } catch (error) {
      setLoadError(
        apiErrorMessage(
          error,
          "Couldn't load your support links. Check your connection and try again."
        )
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * Invites a support person. Throws if it fails, so the modal can show the error and stay
   * open, and only closes once the invite has worked.
   */
  const handleInvite = async (phone: string) => {
    await apiInviteSupportPerson(phone);
    setAdding(false);
    await load();
  };

  /**
   * Removes the selected connection. patients delete the link of their support person, support
   * people revoke their own link.
   *  - returns error if linked to other records.
   */
  const handleRemove = async () => {
    if (!selected) return;
    try {
      if (selected.relationship === "supportsMe") {
        await apiRemoveSupportPerson(selected.person.id);
      } else {
        await apiRemoveConnection(selected.person.id);
      }
    } catch (error) {
      Alert.alert(
        "Could not remove connection",
        apiErrorMessage(
          error,
          "This connection is linked to other records and can't be removed yet."
        )
      );
      return;
    }
    setSelected(null);
    await load();
  };

  /**
   * Saves the permissions of the selected support person. Throws if it fails, so the modal can
   * undo the checkbox and show the error. On success the list and the open modal are updated
   * without reloading.
   */
  const handleChangePermissions = async (permissions: Permissions) => {
    if (!selected) return;
    const saved = await apiSaveSupportPermissions(
      selected.person.id,
      permissions
    );
    setSelected({
      ...selected,
      person: { ...selected.person, permissions: saved }
    });
    setConnections(
      (prev) =>
        prev && {
          ...prev,
          supportPeople: prev.supportPeople.map((person) =>
            person.id === selected.person.id
              ? { ...person, permissions: saved }
              : person
          )
        }
    );
  };

  /**
   * Renders the list of people to show for support people and connections.
   */
  const renderSection = (
    list: Person[],
    relationship: Relationship,
    emptyMessage: string
  ) => (
    <View style={theme.layoutContainer}>
      {list.length === 0 && (
        <Text style={[theme.body, theme.leftText, {color: colours.onSurface, marginVertical: 15 }]}>
          {emptyMessage}
        </Text>
      )}
      <View>
        {list.map((person, index) => (
          <View
            key={person.id}
            style={[[theme.layoutContainer, theme.centerItems]]}
          >
            {index > 0 && <View style={theme.line} />}
            <ButtonWithIcon
              label={person.invited ? `${person.name} (invited)` : person.name}
              onPress={() => setSelected({ person, relationship })}
              buttonType="transparentButton"
              name="chevron-forward-outline"
            />
          </View>
        ))}
      </View>
    </View>
  );

  /**
   * Renders a loading spinner until the connections are loaded, or the error if they can't be.
   */
  if (!connections) {
    return (
      <View style={[theme.centerItems, { flex: 1, padding: 24 }]}>
        {loadError ? (
          <>
            <Text style={[theme.body, {color: colours.onSurface}]}>{loadError}</Text>
            <TextButton label="Try again" onPress={load} fontColour={colours.onSurface} />
          </>
        ) : (
          <ActivityIndicator size="small" />
        )}
      </View>
    );
  }

  /**
   * Returns screen displaying users support people and users that they support
   *
   * By pressing edit details, user should be a able to remove people
   *
   * By pressing on the name of a Support Person, user can see their details and update their permissions.
   */
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, {color: colours.onSurface}]}>
          My Support Links
        </Text>
      </View>
  
      {connections.invitations.length > 0 && (
        <>
          <View style={theme.sectionContainer}>
            <Text style={[theme.h5, theme.leftText, {color: colours.onSurface}]}>
              Invitations
            </Text>
            <View style={theme.line}></View>
            {connections.invitations.map((inv) => (
              <View key={inv.id} style={theme.layoutContainer}>
                <Text style={[theme.body, theme.leftText, {color: colours.onSurface}]}>
                  {inv.name} invited you to support them
                </Text>
                <View style={[theme.rightItems, theme.row]}>
                  <TextButton
                    label="Decline"
                    onPress={() => handleDecline(inv.id)}
                    fontColour={colours.onSurface}
                  />
                  <TextButton
                    label="Accept"
                    onPress={() => handleAccept(inv.id)}
                    fontColour={colours.onSurface}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {isPatient && (
        <>
          <View style={[theme.sectionContainer, theme.sectionSeparation]}>
  
            <Text style={[theme.h5, theme.leftText, {color: colours.onSurface, marginVertical: 15 }]}>
              My Support People
            </Text>
  
            <View style={theme.line}></View>

            {renderSection(
              connections.supportPeople,
              "supportsMe",
              "You have not added any support people yet."
            )}

            <View style={[theme.rightItems]}>
              <TextButton
                label="Add Support Person"
                onPress={() => setAdding(true)}
                fontColour={colours.onSurface}
              />
            </View>

          </View>
        </>
      )}

      <View style={[theme.sectionContainer]}>

        <Text style={[theme.h5, theme.leftText, {color: colours.onSurface, marginVertical: 15 }]}>
          My Connections{" "}
        </Text>
        <View style={theme.line}></View>
          {renderSection(
            connections.supporting,
            "imSupporting",
            "You are not supporting anyone yet."
          )}
      </View>

      <PeopleModal
        visible={selected !== null}
        name={selected?.person.name ?? ""}
        role={
          selected?.relationship === "supportsMe"
            ? "Support Person"
            : "Im Supporting"
        }
        phone={selected?.person.phone ?? ""}
        permissions={selected?.person.permissions ?? noPermissions}
        onChange={handleChangePermissions}
        onRemove={handleRemove}
        onCancel={() => setSelected(null)}
      />

      <AddSupportPersonModal
        visible={adding}
        onConfirm={handleInvite}
        onCancel={() => setAdding(false)}
      />

      <View style={theme.bottomGap} />
      
    </ScrollView>
  );
}
