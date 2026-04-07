import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Rubik_400Regular } from '@expo-google-fonts/rubik';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../constants/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Rubik_400Regular,
    // Rubik loaded from local assets (google-fonts package v0.4.x missing TTF files)
    Rubik_500Medium: require('../assets/fonts/Rubik-Medium.ttf'),
    Rubik_600SemiBold: require('../assets/fonts/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" backgroundColor={colors.white} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
