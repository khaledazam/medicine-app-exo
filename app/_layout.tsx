import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MedicineProvider } from "../src/context/MedicineContext";
import { ReminderProvider } from "../src/context/ReminderContext";

export default function Layout() {
  return (
    <MedicineProvider>
      <ReminderProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f4f7fb" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="home" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="daily-summary" />
          <Stack.Screen name="missed-doses" />
          <Stack.Screen name="caregiver" />
          <Stack.Screen name="medications/add" />
          <Stack.Screen name="medications/[id]" />
          <Stack.Screen name="medications/edit/[id]" />
          <Stack.Screen name="reminders/index" />
          <Stack.Screen name="reminders/add" />
          <Stack.Screen name="reminders/edit/[id]" />
          <Stack.Screen name="refills/index" />
          <Stack.Screen name="calendar/index" />
          <Stack.Screen name="history/index" />
        </Stack>
      </ReminderProvider>
    </MedicineProvider>
  );
}