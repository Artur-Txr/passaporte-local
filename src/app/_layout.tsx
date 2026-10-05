import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VisitasProvider } from '../contextos/VisitasContext';

export default function Layout() {
  return (
    <VisitasProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </VisitasProvider>
  );
}