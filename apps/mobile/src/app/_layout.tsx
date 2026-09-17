import { Stack } from "expo-router";
import { ThemeProvider } from "../../context/ThemeContext";

export default function RootLayout() {
  //return <Stack />;
  return(
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  )
}
