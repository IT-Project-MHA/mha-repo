/**
 * My account page, where the user can view/change their details, as well as health conditions.
 */
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import ButtonWithIcon from "../../../../components/atomicUI/ButtonWithIcon";
import { useState, useEffect } from "react";
import ConfirmModal from "../../../../components/atomicUI/ConfirmModal";
import AboutMeModal, {type Choice, type UserDetails } from "../../../../components/atomicUI/AboutMeModal";
import TextButton from "../../../../components/atomicUI/TextButton";
import MyConditionsModal, {type userDetails} from "../../../../components/atomicUI/MyConditionsModal";
import { useUser } from "../../../../context/AuthorisationContext";
import { UserType } from "../../../../constants/userType";
import {
  apiMyAccount,
  apiSaveAboutMe,
  apiSaveConditions,
  apiDeleteMyAccount,
  apiErrorMessage
} from "@/api/settings_api_helpers";

// the saved details of the user, from apiMyAccount
type Account = {
  user: {
    id: string;
    display_name: string;
    phone_number: string;
    email: string | null;
  };
  
  // null if the user is a support person, having a profile is what makes them a patient
  profile: {
    id: string;
    assigned_gender_at_birth: string | null;
    birth_year: number | null;
    has_diagnosis: boolean | null;
    other_conditions: string | null;
  } | null; // null until the user has a PatientProfile
  sexOptions: Choice[];
};

export default function Screen() {
  const { theme, colours } = useTheme();
  const [pending, setPending] = useState<
    "logout" | "delete" | "editAboutMe" | "editMyConditions" | null >(null); // modal visibility triggered by pending state
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { refreshUserType, setUserType } = useUser();

  /**
   * Loads the user's details from the backend, showing an error with a retry button if it fails.
   */
  const load = async () => {
    setLoadError(null);
    try {
      setAccount(await apiMyAccount());
    } catch (error) {
      setLoadError(
        apiErrorMessage(
          error,
          "Couldn't load your account. Check your connection and try again."
        )
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * Saves from the edit modals. They throw if the save fails, so the modal can show the error and
   * stay open, and only close once the save has worked.
   */
  const handleSaveAboutMe = async (values: UserDetails) => {
    if (!account) return;
    const { user, profile } = await apiSaveAboutMe(
      account.user.id,
      account.profile?.id ?? null,
      values
    );
    setAccount({ ...account, user, profile });
    setPending(null);
  };


  /**
   * Saves conditions input from the myConditionsModal. A support person has no profile, so
   * this creates one, which makes them a patient, so the role is refreshed afterwards.
   */
  const handleSaveConditions = async (values: userDetails) => {
  if (!account) return;
  const profile = await apiSaveConditions(account.profile?.id ?? null, values);
    setAccount((prev) => prev && { ...prev, profile });
    await refreshUserType(); 
    setPending(null);
  };


  /**
   * Handles confirmations (when user clicks confirm in a modal) whilst in pending states.
   */
  const handleConfirmations = async () => {
    if (pending === "delete") {
      try {
        await apiDeleteMyAccount();
        setUserType(UserType.undefined); // should trigger log in / onboarding
      } catch (error) {
        Alert.alert(
          "Could not delete account",
          apiErrorMessage(error, "Please try again.")
        );
      }
    } else if (pending === "logout") {
      setUserType(UserType.undefined); // should trigger log in / onboarding
    }
    setPending(null);
  };

  /**
   * Renders a loading spinner until the user's details are loaded, or the error if they can't be.
   */
  if (!account) {
    return (
      <View style={[theme.centerItems, { flex: 1, padding: 24 }]}>
        {loadError ? (
          <>
            <Text style={[theme.body, theme.fontOnSurface]}>{loadError}</Text>
            <Text> </Text>
            <TextButton label="Try again" onPress={load} />
          </>
        ) : (
          <ActivityIndicator/>
        )}
      </View>
    );
  }

  /**---------Labels--------------*/
  const { user, profile, sexOptions } = account;

  const sexLabel = sexOptions.find((option) => option.value === profile?.assigned_gender_at_birth
    )?.label ?? "Not set";
  
  const diagnosisLabel = profile?.has_diagnosis == null ? "Not set"
    : profile.has_diagnosis ? "Yes" : "No";

  const otherConditions = profile?.other_conditions;

  // saved values the modals open with
  const aboutMeValues: UserDetails = {
    name: user.display_name,
    sex: profile?.assigned_gender_at_birth ?? "",
    birthYear: profile?.birth_year ? String(profile.birth_year) : "",
    phone: user.phone_number,
    email: user.email ?? ""
  };

  const toList = (s: string | null | undefined) =>
  (s ?? "").split("\n").map((c) => c.trim()).filter(Boolean);


  const conditionsValues: userDetails = {
    hasDiagnosis: profile?.has_diagnosis ?? null,
    conditions: toList(profile?.other_conditions),
  };

  /**
   * Formats the my details section to have title on left with value on right.
   */
  const renderMyDetails = (label: string, value: string | number) => (
    <View
      style={[
        theme.row,
        theme.layoutContainer,
        { justifyContent: "space-between", alignItems: "flex-start" }
      ]}
    >
      <Text style={[theme.body, theme.leftText, { color: colours.onSurface }]}>
        {label}
      </Text>
      <Text
        style={[
          theme.body,
          theme.rightText,
          { color: colours.onSurface },
          { flexShrink: 1, textAlign: "right", marginLeft: 16 }
        ]}
      >
        {value}
      </Text>
    </View>
  );

  /**
   * Renders screen, which include user details (with option to edit with modal), user conditions (with option to edit with modal)
   * as well as the option to delete account and log out, both of which trigger confirm modals that ask the user
   * to confirm their decision.
   */
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>
          My Account
        </Text>
      </View>

      <Text> </Text>

      <View style={theme.sectionContainer}>
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>
          About Me
        </Text>

        <Text> </Text>

        <View style={theme.line}></View>

        <Text> </Text>
        {renderMyDetails("Name:", user.display_name)}
        <Text style={theme.body}> </Text>

        {/* sex and birth year are stored on the PatientProfile, so only patients have them */}
        {profile && (
          <>
          {renderMyDetails("Sex:", sexLabel)}
          <Text style={theme.body}> </Text>
          {renderMyDetails("Birth Year:", profile?.birth_year ?? "Not set")}
          <Text style={theme.body}> </Text>
          </>
        )}
        
        {renderMyDetails("Phone Number:", user.phone_number)}
        <Text style={theme.body}> </Text>
        {renderMyDetails("Email:", user.email || "No email")}
        <Text> </Text>

        <View style={[theme.rightItems]}>
          <TextButton
            label="Edit Details"
            onPress={() => setPending("editAboutMe")}
          />
        </View>
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={theme.sectionContainer}>
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>
          My Conditions
        </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>

        {profile ? (
          // patient: show their answers, with the option to correct them
          <>
          <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>
          Diagnosis
          </Text>
          <Text style={theme.body}> </Text>
          <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>
          {diagnosisLabel}
          </Text>
        <Text> </Text>
      
        {!!otherConditions && (
          <View>
            <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>
              Other Conditions
            </Text>
            <Text style={theme.body}> </Text>
            <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>
              {otherConditions}
            </Text>
            <Text> </Text>
          </View>
        )}

        <View style={[theme.rightItems]}>
          <TextButton
            label="Edit Details"
            onPress={() => setPending("editMyConditions")}
          />
        </View>
        </>
    ):(
      <>
            <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>
              Do you experience musculoskeletal symptoms?
            </Text>
            <Text> </Text>
            <View style={[theme.rightItems]}>
              <TextButton
                label="Yes, I do"
                onPress={() => setPending("editMyConditions")}
              />
            </View>
          </>
    )}
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={[theme.sectionContainer, theme.centerItems]}>
        <ButtonWithIcon
          label="Log Out"
          onPress={() => setPending("logout")}
          buttonType="transparentButton"
          name="person-outline"
        />
      </View>

      <Text> </Text>

      <View style={[theme.clearContainer, theme.centerItems]}>
        <ButtonWithIcon
          label="Delete my account"
          onPress={() => setPending("delete")}
          buttonType="transparentButton"
          name="trash-bin-outline"
        />
        <View style={theme.line}></View>

        <ConfirmModal
          visible={pending === "delete"}
          title="Are you sure you want to delete your account?"
          message="This will permanently delete your account and data."
          confirmLabel="Delete"
          cancelLabel="go back"
          onConfirm={handleConfirmations}
          onCancel={() => setPending(null)}
        />

        <ConfirmModal
          visible={pending === "logout"}
          title="Are you sure you want to log out?"
          message="You'll need to sign in again to access your account."
          confirmLabel="Log out"
          cancelLabel="go back"
          onConfirm={handleConfirmations}
          onCancel={() => setPending(null)}
        />

        <AboutMeModal
          visible={pending === "editAboutMe"}
          initialValues={aboutMeValues}
          sexOptions={sexOptions}
          onConfirm={handleSaveAboutMe}
          onCancel={() => setPending(null)}
        />

        <MyConditionsModal
          visible={pending === "editMyConditions"}
          initialValues={conditionsValues}
          onConfirm={handleSaveConditions}
          onCancel={() => setPending(null)}
        />
      </View>

      <View style={theme.bottomGap} />
    </ScrollView>
  );
}
