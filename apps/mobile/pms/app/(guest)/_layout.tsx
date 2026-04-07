import { Stack } from 'expo-router';
import { colors } from '../../constants/tokens';

export default function GuestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="signup" options={{ animation: 'fade' }} />
      <Stack.Screen name="signup-verify" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="otp" />
      <Stack.Screen name="room-code" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[token]" />
      <Stack.Screen name="pdf" />
    </Stack>
  );
}
