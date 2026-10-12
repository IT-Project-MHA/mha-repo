import React, { useState } from "react";
import Button from "../atomicUI/Button";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";

//button that takes us straight to the sign-in page when clicked
export function SignInButton() {
  const router = useRouter();
  const { theme } = useTheme();
  return  (<Button
          label="sign in"
          onPress={() => router.navigate('/(onboarding)/signIn')}
          buttonType = "secondaryButton"
        />);
};

/***/