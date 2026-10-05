import { Stack } from "expo-router";
import { ThemeProvider } from "../../context/ThemeContext";
import { UserProvider } from "../../context/AuthorisationContext";

export default function RootLayout() {

  return(
    <ThemeProvider>
      <UserProvider>
      <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack>
      </UserProvider>
    </ThemeProvider>
  )
}
