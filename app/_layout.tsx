import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useAppStore } from '@/hooks/use-app-store';
import { AppProvider } from '@/context/app-context';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const dynamicTheme = useDynamicTheme();
  const { profile, apiKey, isLoading } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!profile || !apiKey) {
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else if (inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [profile, apiKey, isLoading, segments]);

  return (
    <ThemeProvider value={dynamicTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
