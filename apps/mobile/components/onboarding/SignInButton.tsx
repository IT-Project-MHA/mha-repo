import React, { useState } from "react";
import Button from "../atomicUI/Button";
import { useTheme } from "../../context/ThemeContext";


//button that takes us straight to the sign-in page when clicked
export function SignInButton() {
  const { theme } = useTheme();
  return  (<Button
          label="sign in"
          onPress={() => navigation.navigate('/(onboarding)/signIn')}
          buttonType = "secondaryButton"
        />);
};

/***/